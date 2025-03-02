from Config.db import client
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Routes.SampleRoutes import router as SampleRouter
from Routes.UserRoutes import router as UserRouter
app = FastAPI()
app.add_middleware(CORSMiddleware)

# app.include_router(SampleRouter)
app.include_router(UserRouter)