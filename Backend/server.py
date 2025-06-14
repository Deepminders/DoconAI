from fastapi import FastAPI
from Routes.UserRoutes import router
from Routes.DocumentRoutes import router as doc_router
from fastapi.middleware.cors import CORSMiddleware
from Routes import StaffRoutes

server = FastAPI()


server.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

server.include_router(router)
server.include_router(doc_router)
server.include_router(StaffRoutes.router)

@server.get("/home")
def home():
    return {"Message":"Hello World"}