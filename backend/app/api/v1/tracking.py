import json
from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/tracking", tags=["tracking"])

class ConnectionManager:
    def __init__(self):
        # Maps ride_id to a list of connected WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, ride_id: str):
        await websocket.accept()
        if ride_id not in self.active_connections:
            self.active_connections[ride_id] = []
        self.active_connections[ride_id].append(websocket)

    def disconnect(self, websocket: WebSocket, ride_id: str):
        if ride_id in self.active_connections:
            self.active_connections[ride_id].remove(websocket)
            if len(self.active_connections[ride_id]) == 0:
                del self.active_connections[ride_id]

    async def broadcast(self, message: str, ride_id: str, sender: WebSocket = None):
        """Broadcasts to all connections in the room, except the sender (optional)"""
        if ride_id in self.active_connections:
            for connection in self.active_connections[ride_id]:
                if connection != sender:
                    await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/{ride_id}")
async def tracking_endpoint(websocket: WebSocket, ride_id: str):
    """
    WebSocket endpoint for real-time location streaming.
    Driver pushes JSON payload: {"lat": float, "lng": float}
    Rider receives the payload instantly.
    """
    await manager.connect(websocket, ride_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast the received location data to the other party (Rider)
            await manager.broadcast(data, ride_id, sender=websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, ride_id)
