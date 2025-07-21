
from fastapi import APIRouter, HTTPException, UploadFile, File
import openai
import os
import tempfile
import ffmpeg
from datetime import datetime,timezone
from Config.db import session_collection
from Models.Chatbotmodel import ChatRequest, ChatResponse, NewSessionRequest, SessionIDResponse, RenameRequest
from Models.UserModel import UserModel
from Controllers.ChatController import handle_chat  # NEW: Import RAG logic
from Controllers.UserController import get_current_user
from bson import ObjectId
import traceback
from fastapi import Depends
from openai import OpenAI
router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

client = OpenAI(api_key="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")

from Config.db import chat_collection


@router.post("/start-session", response_model=SessionIDResponse)
async def start_session(req: NewSessionRequest, current_user: UserModel = Depends(get_current_user)):
    from uuid import uuid4
    session_id = str(uuid4())
    user_id = str(current_user["_id"]) if isinstance(current_user["_id"], ObjectId) else current_user["_id"]
# or current_user["_id"]

    await session_collection.insert_one({
        "user_id": user_id,
        "session_id": session_id,
        "created_time": datetime.now(timezone.utc),
        "title": req.title or "Untitled"
    })

    return SessionIDResponse(session_id=session_id)

@router.post("/chat", response_model=ChatResponse)
async def chat(
    chat_request: ChatRequest,
    current_user: UserModel = Depends(get_current_user),  # <-- add dependency
):
    try:
        user_id = str(current_user["_id"]) if isinstance(current_user["_id"], ObjectId) else current_user["_id"]

        result = await handle_chat(
            user_id,
            chat_request.session_id,
            chat_request.message
        )
        
        reply = result["reply"]
        tier = result["tier"]

        return ChatResponse(reply=reply, tier=tier)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chatbot failed: {str(e)}")

@router.get("/sessions")
async def list_sessions(current_user: UserModel = Depends(get_current_user)):
    user_id = str(current_user["_id"]) if isinstance(current_user["_id"], ObjectId) else current_user["_id"]
# or current_user["_id"] if it's a dict
    sessions_cursor =session_collection.find({"user_id": user_id}).sort("created_time", -1)
    result = []
    async for s in sessions_cursor:
        result.append({
            "session_id": s["session_id"],
            "title": s.get("title", ""),
            "created_time": s["created_time"]
        })
    return result
    


@router.get("/history/{session_id}")
async def get_chat_history(session_id: str, current_user: UserModel = Depends(get_current_user)):
    user_id = str(current_user.get("_id")) or current_user.get("user_id")

    session = await session_collection.find_one({"session_id": session_id, "user_id": user_id})
    if not session:
        raise HTTPException(status_code=403, detail="You do not have access to this session.")

    messages_cursor = chat_collection.find({"session_id": session_id, "user_id": user_id}).sort("created_time", 1)
    history = []
    async for msg in messages_cursor:
        message = {
            "role": msg["role"],
            "content": msg["content"]
        }
        if msg["role"] == "assistant" and "tier" in msg:
            message["tier"] = msg["tier"]
        history.append(message)
    return history


@router.delete("/delete-empty-sessions")
async def delete_empty_sessions(current_user: UserModel = Depends(get_current_user)):
    try:
        user_id = (
            str(current_user["_id"]) if isinstance(current_user["_id"], ObjectId) else current_user["_id"]
        )
        # Get all sessions of the user
        session_docs = await session_collection.find({"user_id": user_id}).to_list(None)
        session_ids = [s["session_id"] for s in session_docs]

        # Get session_ids that have messages in chat_collection
        used_session_ids = await chat_collection.distinct("session_id", {"session_id": {"$in": session_ids}})

        # Find sessions with no messages
        empty_session_ids = [sid for sid in session_ids if sid not in used_session_ids]

        # Delete empty sessions
        result = await session_collection.delete_many({"session_id": {"$in": empty_session_ids}})

        return {"deleted_count": result.deleted_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete empty sessions: {str(e)}")


@router.get("/history/{user_id}/{session_id}")
async def get_chat_history(user_id: str, session_id: str):
    try:
        # Step 1: Ensure this session belongs to the user
        session = await session_collection.find_one({"session_id": session_id, "user_id": user_id})
        if not session:
            raise HTTPException(status_code=403, detail="You do not have access to this session.")

        # Step 2: Fetch messages if session is valid
        messages_cursor = chat_collection.find({"session_id": session_id, "user_id": user_id}).sort("created_time", 1)
        history = []
        async for msg in messages_cursor:
            history.append({"role": msg["role"], "content": msg["content"]})
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")

@router.post("/voice-to-text")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Create temp .webm file and write contents
        temp_input = tempfile.NamedTemporaryFile(delete=False, suffix=".webm")
        try:
            contents = await file.read()
            temp_input.write(contents)
            temp_input.flush()
            temp_input.close()  # <-- Close here, release lock for ffmpeg

            # Create temp .wav output file
            temp_output = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
            temp_output.close()  # Close immediately, ffmpeg will write here

            # Convert webm -> wav
            ffmpeg.input(temp_input.name).output(temp_output.name).run(overwrite_output=True)

            # Open wav and send to OpenAI Whisper
            with open(temp_output.name, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    file=audio_file,
                    model="whisper-1"
                )

        finally:
            # Cleanup temp files safely
            if os.path.exists(temp_input.name):
                os.remove(temp_input.name)
            if os.path.exists(temp_output.name):
                os.remove(temp_output.name)

        return {"text": transcript.text}

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@router.delete("/delete-session/{session_id}")
async def delete_session(session_id: str, current_user: UserModel = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    session = await session_collection.find_one({"session_id": session_id, "user_id": user_id})
    if not session:
        raise HTTPException(status_code=403, detail="Unauthorized to delete this session.")

    await chat_collection.delete_many({"session_id": session_id, "user_id": user_id})
    await session_collection.delete_one({"session_id": session_id, "user_id": user_id})
    return {"message": "Session deleted successfully"}

@router.put("/rename-session/{session_id}")
async def rename_session(session_id: str, req: RenameRequest, current_user: UserModel = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    session = await session_collection.find_one({"session_id": session_id, "user_id": user_id})
    if not session:
        raise HTTPException(status_code=403, detail="Unauthorized to rename this session.")
    
    await session_collection.update_one(
        {"session_id": session_id},
        {"$set": {"title": req.title.strip() or "Untitled"}}
    )
    return {"message": "Session renamed successfully"}

