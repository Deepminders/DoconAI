from fastapi import APIRouter

router = APIRouter(prefix="/sample",tags=["Sample"])

# Path - localhost:PORT/sample
@router.get("/")
def sample():
    return {"message":"Welcome to the Mongo"}