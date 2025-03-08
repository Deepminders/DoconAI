from fastapi import FastAPI
from Routes.UserRoutes import router
from Routes.DocumentRoutes import router as doc_router

server = FastAPI()
server.include_router(router)
server.include_router(doc_router)

@server.get("/home")
def home():
    return {"Message":"Hello World"}