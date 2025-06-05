from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from chat_manager import UserChatManager

router = APIRouter()
user_chat_manager = UserChatManager()

@router.websocket("/ws/chat/{username}")
async def websocket_chat(websocket: WebSocket, username: str):
    await user_chat_manager.connect(username, websocket)
    await user_chat_manager.broadcast_user_list()
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "message")
            if msg_type == "message":
                recipient = data.get("to")
                msg = data.get("message")
                if recipient and msg:
                    await user_chat_manager.send_personal_message(
                        recipient,
                        {"type": "message", "from": username, "to": recipient, "message": msg}
                    )
            elif msg_type == "book_offer":
                recipient = data.get("to")
                book = data.get("book")
                if recipient and book:
                    await user_chat_manager.send_personal_message(
                        recipient,
                        {
                            "type": "book_offer",
                            "from": username,
                            "to": recipient,
                            "book": book
                        }
                    )
            elif msg_type == "book_offer_response":
                recipient = data.get("to")
                book = data.get("book")
                accepted = data.get("accepted")
                if recipient and book is not None:
                    await user_chat_manager.send_personal_message(
                        recipient,
                        {
                            "type": "book_offer_response",
                            "from": username,
                            "to": recipient,
                            "book": book,
                            "accepted": accepted
                        }
                    )
    except WebSocketDisconnect:
        user_chat_manager.disconnect(username)
        await user_chat_manager.broadcast_user_list()
