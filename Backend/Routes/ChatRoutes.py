from fastapi import APIRouter, HTTPException
from datetime import datetime,timezone
from Config.db import session_collection
from Models.Chatbotmodel import ChatRequest, ChatResponse, NewSessionRequest, SessionIDResponse
from Controllers.ChatController import handle_chat  # NEW: Import RAG logic
import traceback
router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

from Config.db import chat_collection

@router.post("/start-session", response_model=SessionIDResponse)
async def start_session(req: NewSessionRequest):
    from uuid import uuid4
    session_id = str(uuid4())

    session_collection.insert_one({
        "user_id": req.user_id,
        "session_id": session_id,
        "created_time": datetime.now(timezone.utc),
        "title": req.title or "Untitled"
    })

    return SessionIDResponse(session_id=session_id)

@router.post("/chat", response_model=ChatResponse)
async def chat(chat_request: ChatRequest):
    # Call handle_chat, which includes RAG + fallback logic
    try:
        reply = await handle_chat(
            chat_request.user_id,
            chat_request.session_id,
            chat_request.message
        )
        return ChatResponse(reply=reply)
    except Exception as e:
  
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chatbot failed: {str(e)}")

@router.get("/sessions/{user_id}")
async def list_sessions(user_id: str):
    sessions_cursor = session_collection.find({"user_id": user_id}).sort("created_time", -1)
    result = []
    async for s in sessions_cursor:
        result.append({"session_id": s["session_id"], "created_time": s["created_time"]})
    return result
    


@router.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    try:
        messages_cursor = chat_collection.find({"session_id": session_id}).sort("created_time", 1)
        history = []
        async for msg in messages_cursor:
            history.append({"role": msg["role"], "content": msg["content"]})
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")


@router.delete("/delete-empty-sessions/{user_id}")
async def delete_empty_sessions(user_id: str):
    try:
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

