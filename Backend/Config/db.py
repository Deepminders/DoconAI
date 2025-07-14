from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument
from fastapi import HTTPException
import logging

URI = "mongodb+srv://Sehara:Sehara1234@deepminders.mnjvr.mongodb.net/?retryWrites=true&w=majority&appName=DeepMinders"

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    client = AsyncIOMotorClient(URI)
    db = client["DeepMinders"]
    logger.info("Connected to MongoDB successfully")
    user_collection = db.get_collection("users")
    staff_collection = db.get_collection("staff")
    document_collection = db.get_collection("documents")
    counters_collection = db.get_collection("counters")
    project_collection = db.get_collection("projects")
    chat_collection = db.get_collection("chat_history")
    counters_collection = db.get_collection("counters")
    session_collection = db.get_collection("chat_sessions")

    
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")
    raise HTTPException(
        status_code=500,
        detail="Database connection failed"
    )

async def initialize_db():
    """Initialize database collections and indexes"""
    try:
        collection_names = await db.list_collection_names()
        if "counters" not in collection_names:
            await counters_collection.insert_one({"_id": "document_id", "seq": 0})
            logger.info("Initialized counters collection")
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        raise

async def get_next_sequence_value(sequence_name: str):
    """Get the next sequence value (async version)"""
    try:
        counter = await counters_collection.find_one_and_update(
            {"_id": sequence_name},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=ReturnDocument.AFTER
        )
        return counter["seq"]
    except Exception as e:
        logger.error(f"Failed to get sequence value: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate document ID"
        )
