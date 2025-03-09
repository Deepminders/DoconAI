from fastapi import FastAPI
from Routes.UserRoutes import router
from Routes.ProjectRoutes import routerproject
from Routes.DocumentRoutes import router as doc_router
from Routes import StaffRoutes

server = FastAPI()
server.include_router(router)
server.include_router(doc_router)
server.include_router(routerproject)
server.include_router(StaffRoutes.router)

@server.get("/home")
def home():
    return {"Message":"Hello World"}