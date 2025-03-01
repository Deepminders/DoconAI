from Config.db import client
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Routes.SampleRoutes import router as SampleRouter
app = FastAPI()
app.add_middleware(CORSMiddleware)

app.include_router(SampleRouter)