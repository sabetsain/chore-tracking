import uuid
from typing import Any, Optional
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status

from app.security import decode_access_token


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[uuid.UUID, set[WebSocket]] = {}

    async def connect(self, household_id: uuid.UUID, websocket: WebSocket):
        await websocket.accept()
        if household_id not in self.active_connections:
            self.active_connections[household_id] = set()
        self.active_connections[household_id].add(websocket)

    def disconnect(self, household_id: uuid.UUID, websocket: WebSocket):
        if household_id in self.active_connections:
            self.active_connections[household_id].discard(websocket)
            if not self.active_connections[household_id]:
                del self.active_connections[household_id]

    async def broadcast(self, household_id: uuid.UUID, event: str, data: Any):
        if household_id not in self.active_connections:
            return

        message = {"event": event, "data": data}
        dead_connections = set()
        for connection in list(self.active_connections[household_id]):
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.add(connection)

        for dead in dead_connections:
            self.disconnect(household_id, dead)


ws_manager = ConnectionManager()

router = APIRouter(tags=["websockets"])


@router.websocket("/api/v1/ws/{household_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    household_id: uuid.UUID,
    token: Optional[str] = Query(None),
):
    if not token:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Missing authentication token",
        )
        return

    try:
        payload = decode_access_token(token)
    except Exception:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Invalid authentication token",
        )
        return

    token_household_id = payload.get("household_id")
    if not token_household_id or str(household_id) != str(token_household_id):
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Unauthorized household",
        )
        return

    await ws_manager.connect(household_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(household_id, websocket)
    except Exception:
        ws_manager.disconnect(household_id, websocket)
