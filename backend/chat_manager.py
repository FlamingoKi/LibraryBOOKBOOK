from typing import Dict
from fastapi import WebSocket

class UserChatManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, username: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[username] = websocket

    def disconnect(self, username: str):
        if username in self.active_connections:
            del self.active_connections[username]

    async def send_personal_message(self, recipient: str, message: dict):
        ws = self.active_connections.get(recipient)
        if ws:
            await ws.send_json(message)

    async def broadcast_user_list(self):
        users = list(self.active_connections.keys())
        for ws in self.active_connections.values():
            await ws.send_json({"type": "users", "users": users})

    async def broadcast_book_available(self, book_id: int, book_title: str):
        for ws in self.active_connections.values():
            await ws.send_json({
                "type": "book_available",
                "book_id": book_id,
                "book_title": book_title
            })
