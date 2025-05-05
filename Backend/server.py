from fastapi import FastAPI
from Routes.UserRoutes import router
from Routes.DocumentRoutes import router as doc_router
from Routes import StaffRoutes
from Config.db import initialize_db

server = FastAPI()
server.include_router(router)
server.include_router(doc_router)
server.include_router(StaffRoutes.router)

@server.get("/home")
def home():
    return {"Message":"Hello World"}

@server.on_event("startup")
async def startup_db_client():
    await initialize_db()