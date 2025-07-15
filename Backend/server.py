from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from Routes.UserRoutes import router
from Routes.ProjectRoutes import routerproject
from Routes.DocumentRoutes import router as doc_router
from Routes.CostRoutes import cost_routes
from fastapi.middleware.cors import CORSMiddleware
from Routes import StaffRoutes
from Routes.ChatRoutes import router as chat_router
from fastapi.middleware.cors import CORSMiddleware
from Config.db import initialize_db
import os
from Routes import comparator_router  # adjust import if needed


server = FastAPI()
server.mount("/uploaded_images", StaticFiles(directory="uploaded_images"), name="uploaded_images")

server.add_middleware(
    CORSMiddleware,
    allow_origins=["*","http://192.168.163.1:3001/*"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

server.include_router(router)
server.include_router(doc_router)
server.include_router(routerproject)
server.include_router(cost_routes)
server.include_router(StaffRoutes.router)
server.include_router(chat_router)
server.include_router(comparator_router.router)  # Include the comparator router
@server.get("/home")
def home():
    return {"Message":"Hello World"}

@server.on_event("startup")
async def startup_db_client():
    await initialize_db()

os.makedirs("static/profile_images", exist_ok=True)

# Mount the /static path
server.mount("/static", StaticFiles(directory="static"), name="static")