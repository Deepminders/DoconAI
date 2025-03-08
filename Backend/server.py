from fastapi import FastAPI
from Routes.UserRoutes import router
from Routes import StaffRoutes

server = FastAPI()
server.include_router(router)
server.include_router(StaffRoutes.router)

@server.get("/home")
def home():
    return {"Message":"Hello World"}