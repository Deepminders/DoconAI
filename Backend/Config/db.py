from motor.motor_asyncio import AsyncIOMotorClient

URI = "mongodb+srv://Sehara:Sehara1234@deepminders.mnjvr.mongodb.net/?retryWrites=true&w=majority&appName=DeepMinders"

client = AsyncIOMotorClient(URI)
if(client):
    print("Connected to MongoDB")
else:
    print("Failed to connect to MongoDB")
    
db = client["DeepMinders"]
user_collection = db.get_collection("users")
staff_collection = db.get_collection("staff")
document_collection = db.get_collection("documents")