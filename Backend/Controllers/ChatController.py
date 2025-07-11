from datetime import datetime, timezone
import os
import pickle
import faiss
import asyncio
from typing import List
from motor.motor_asyncio import AsyncIOMotorCollection
from sentence_transformers import SentenceTransformer
from fastapi import HTTPException
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ChatMessageHistory
from langchain_core.prompts import PromptTemplate
from langchain.docstore import InMemoryDocstore

from Config.db import chat_collection, session_collection
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join("Controllers", ".env"))

# ---------------- Load Embeddings + FAISS ----------------
print("GOOGLE_API_KEY:", os.getenv("GOOGLE_API_KEY"))
EMBEDDING_MODEL = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
VECTOR_DB_PATH = "embeddings/index.faiss"
CHUNKS_PATH = "embeddings/doc_chunks.pkl"

if not os.path.exists(VECTOR_DB_PATH) or not os.path.exists(CHUNKS_PATH):
    raise RuntimeError("Embedding or FAISS index not found.")

VECTOR_INDEX = faiss.read_index(VECTOR_DB_PATH)

with open(CHUNKS_PATH, "rb") as f:
    DOC_CHUNKS = pickle.load(f)

# Prepare docstore: map string id to Document
documents = {str(i): Document(page_content=chunk["content"]) for i, chunk in enumerate(DOC_CHUNKS)}
docstore = InMemoryDocstore(documents)
index_to_docstore_id = {i: str(i) for i in range(len(DOC_CHUNKS))}

vectorstore = FAISS(
    index=VECTOR_INDEX,
    docstore=docstore,
    index_to_docstore_id=index_to_docstore_id,
    embedding_function=EMBEDDING_MODEL
)

# ---------------- LangChain Setup ----------------
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0.3,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

qa_chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True
)

# ---------------- Utility ----------------
def is_meaningful_message(msg: str) -> bool:
    normalized = msg.strip().lower()
    trivial_starts = ["hi", "hello", "hey", "how are you", "good morning", "good evening", "good afternoon", "what's up", "yo"]
    return (
        len(normalized.split()) > 3 or
        all(not normalized.startswith(greet) for greet in trivial_starts)
    )

# ---------------- Chat Handler ----------------
async def handle_chat(user_id: str, session_id: str, user_message: str) -> str:
    greetings = ["hi", "hello", "hey", "how are you", "good morning", "good afternoon", "good evening"]

    if user_message.lower().strip() in greetings:
        reply = "Hello! How can I assist you with your construction project today?"
        await store_chat_messages(chat_collection, user_id, session_id, user_message, reply)
        return reply

    # Fetch chat history
    history = await chat_collection.find(
        {"user_id": user_id, "session_id": session_id}
    ).sort("created_time", -1).to_list(length=10)

    message_history = ChatMessageHistory()
    for item in reversed(history):
        message_history.add_message({"role": item["role"], "content": item["content"]})

    # Generate session title if it's the first meaningful message
    total_messages = await chat_collection.count_documents({"session_id": session_id})
    if total_messages <= 2 and is_meaningful_message(user_message):
        try:
            prompt = PromptTemplate.from_template(
                "Summarize this message in 5 words or fewer to use as a chat session title:\n\n{message}"
            )
            chain = prompt | llm
            title = (await chain.ainvoke({"message": user_message})).strip()

            await session_collection.update_one(
                {"session_id": session_id},
                {"$set": {"title": title}}
            )
        except Exception as e:
            print("Title generation failed:", e)

    # Run Gemini QA chain
    try:
        result = await asyncio.to_thread(qa_chain.invoke, {
            "question": user_message,
            "chat_history": [(msg["role"], msg["content"]) for msg in history[::-1]]
        })

        reply = result["answer"].strip() or "Sorry, I couldn't understand that. Could you rephrase?"

        await store_chat_messages(chat_collection, user_id, session_id, user_message, reply)
        return reply

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------- MongoDB History Helper ----------------
async def store_chat_messages(
    collection: AsyncIOMotorCollection,
    user_id: str,
    session_id: str,
    user_msg: str,
    assistant_msg: str
):
    now = datetime.now(timezone.utc)
    await collection.insert_many([
        {
            "user_id": user_id,
            "session_id": session_id,
            "role": "user",
            "content": user_msg,
            "created_time": now
        },
        {
            "user_id": user_id,
            "session_id": session_id,
            "role": "assistant",
            "content": assistant_msg,
            "created_time": now
        }
    ])
