from fastapi import FastAPI

from app.routers import appliances, auth, chores, households, members, push
from app.websocket import router as websocket_router

app = FastAPI(
    title="Household Coordination API",
    version="0.1.0",
    description="API for shared household chore & appliance coordination",
)

app.include_router(households.router)
app.include_router(auth.router)
app.include_router(members.router)
app.include_router(chores.router)
app.include_router(appliances.router)
app.include_router(push.router)
app.include_router(websocket_router)



@app.get("/health")
async def health_check():
    return {"status": "ok"}

