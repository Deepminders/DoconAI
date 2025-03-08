from motor.motor_asyncio import AsyncIOMotorClient



client = AsyncIOMotorClient(URI)
if(client):
    print("Connected to MongoDB")
else:
    print("Failed to connect to MongoDB")
    
db = client["DeepMinders"]
user_collection = db.get_collection("users")