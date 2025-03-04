from fastapi import FastAPI
from Routes.UserRoutes import router

server = FastAPI()
server.include_router(router)

@server.get("/home")
def home():
    return {"Message":"Hello World"}