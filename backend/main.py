from fastapi import FastAPI, Depends, HTTPException, Body, UploadFile, File, Form, Query, WebSocket, WebSocketDisconnect, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import SessionLocal, init_db
from models import User, Book, Rent, Request, Comment
from pydantic import BaseModel, conint
from passlib.hash import bcrypt
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import os
from typing import List, Dict
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import auth
from jose import JWTError, jwt
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
from uuid import uuid4
from schemas import (
    UserIn, RoleUpdate, BookCreate, CommentIn, CancelRequestIn, AdminUserIn,
    UsernameIn, BookIdIn, RentIdIn, ChangePasswordIn, EmailIn,
    ProcessRequestIn, ReturnRequestIn, AcceptReturnIn, CancelPendingRequestIn
)
from crud import get_user_by_username
from chat_manager import UserChatManager

load_dotenv()

app = FastAPI()
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/register")
def register(
    username: str = Body(...),
    password: str = Body(...),
    email: str = Body(...),  # добавляем email
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    hashed_password = auth.get_password_hash(password)
    new_user = User(username=username, password=hashed_password, role="reader", email=email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Пользователь создан"}

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Неверные учетные данные")
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@app.get("/profile/{username}")
def get_profile(username: str, db: Session = Depends(get_db)):
    user = get_user_by_username(db, username)
    now = datetime.utcnow()
    active_rents = (
        db.query(Rent, Book)
        .join(Book, Book.id == Rent.book_id)
        .filter(
            Rent.user_id == user.id,
            Rent.rented_at + timedelta(hours=48) > now
        )
        .all()
    )
    books = [
        {
            "id": book.id,
            "title": book.title,
            "description": book.description,
            "cover_url": book.cover_url,
            "author": book.author,
            "genre": book.genre,
            "publisher": book.publisher
        }
        for rent, book in active_rents
    ]
    return {
        "username": user.username,
        "books": books
    }

@app.get("/books")
def get_books(
    query: str = None,
    author: str = None,
    genre: str = None,
    publisher: str = None,
    db: Session = Depends(get_db)
):
    q = db.query(Book)
    if query:
        q = q.filter(
            or_(
                Book.author.ilike(f"%{query}%"),
                Book.genre.ilike(f"%{query}%"),
                Book.publisher.ilike(f"%{query}%"),
                Book.title.ilike(f"%{query}%"),
                Book.description.ilike(f"%{query}%")
            )
        )
    if author:
        q = q.filter(Book.author.ilike(f"%{author}%"))
    if genre:
        q = q.filter(Book.genre.ilike(f"%{genre}%"))
    if publisher:
        q = q.filter(Book.publisher.ilike(f"%{publisher}%"))
    books = q.all()
    return [
        {
            "id": book.id,
            "title": book.title,
            "description": book.description,
            "cover_url": book.cover_url,
            "author": book.author,
            "genre": book.genre,
            "publisher": book.publisher
        }
        for book in books
    ]

@app.post("/add_books")
def add_book_with_pdf(
    title: str = Form(...),
    author: str = Form(...),
    genre: str = Form(...),
    publisher: str = Form(...),
    description: str = Form(...),
    cover_url: str = Form(...),
    pdf_file: UploadFile = File(...),  # <-- теперь pdf_file
    db: Session = Depends(get_db)
):
    # Проверяем, что файл действительно PDF
    if not pdf_file.filename.lower().endswith('.pdf') or pdf_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Загрузите файл в формате PDF")
    new_book = Book(
        title=title,
        author=author,
        genre=genre,
        publisher=publisher,
        description=description,
        cover_url=cover_url,
    )
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    os.makedirs("books", exist_ok=True)
    file_path = f"books/{new_book.id}.pdf"
    with open(file_path, "wb") as f:
        f.write(pdf_file.file.read())
    new_book.pdf_path = file_path
    db.commit()
    return {"message": "Книга добавлена с PDF", "book_id": new_book.id}

@app.get("/read/{book_id}")
def read_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book or not book.pdf_path or not os.path.exists(book.pdf_path):
        raise HTTPException(status_code=404, detail="Файл не найден")
    from fastapi.responses import FileResponse
    return FileResponse(book.pdf_path, media_type="application/pdf", filename=os.path.basename(book.pdf_path))

@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.post("/change-role")
def change_role(data: RoleUpdate, db: Session = Depends(get_db)):
    user = get_user_by_username(db, data.username)
    user.role = data.new_role
    db.commit()
    return {"message": f"Роль пользователя {data.username} изменена на {data.new_role}"}

@app.post("/request_rent")
def request_rent(username: str = Body(...), book_id: int = Body(...), db: Session = Depends(get_db)):
    user = get_user_by_username(db, username)
    existing_request = db.query(Request).filter(
        Request.user_id == user.id,
        Request.book_id == book_id,
        Request.status.in_(["pending", "approved"])
    ).first()
    if existing_request:
        return {"message": "У вас уже есть активная бронь или аренда на эту книгу"}
    existing_rent = db.query(Rent).filter(
        Rent.user_id == user.id,
        Rent.book_id == book_id,
        Rent.rented_at + timedelta(hours=48) > datetime.utcnow()
    ).first()
    if existing_rent:
        return {"message": "Книга уже арендована вами"}
    req = Request(user_id=user.id, book_id=book_id)
    db.add(req)
    db.commit()
    return {"message": "Заявка на аренду отправлена библиотекарю"}

@app.get("/requests")
def get_requests(db: Session = Depends(get_db)):
    requests = db.query(Request, User, Book)\
        .join(User, User.id == Request.user_id)\
        .join(Book, Book.id == Request.book_id)\
        .filter(Request.status.in_(["pending", "return_requested"]))\
        .all()
    return [
        {
            "id": req.id,
            "username": user.username,
            "book_id": book.id,
            "book_title": book.title,
            "status": req.status,
            "created_at": req.created_at
        }
        for req, user, book in requests
    ]

@app.post("/process_request")
def process_request(data: ProcessRequestIn, db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == data.request_id).first()
    if not req or req.status != "pending":
        raise HTTPException(status_code=404, detail="Заявка не найдена или уже обработана")
    if data.approve:
        db.query(Request).filter(
            Request.book_id == req.book_id,
            Request.status == "pending",
            Request.id != req.id
        ).update({Request.status: "declined"})
        req.status = "approved"
        rent = Rent(user_id=req.user_id, book_id=req.book_id)
        db.add(rent)
        db.commit()
        return {"message": "Заявка одобрена, остальные заявки отклонены"}
    else:
        req.status = "declined"
        db.commit()
        return {"message": "Заявка отклонена"}

@app.get("/my_requests")
def my_requests(username: str, db: Session = Depends(get_db)):
    user = get_user_by_username(db, username)
    requests = db.query(Request, Book).join(Book, Book.id == Request.book_id).filter(Request.user_id == user.id).all()
    result = []
    for req, book in requests:
        result.append({
            "id": req.id,
            "book_id": book.id,
            "book_title": book.title,
            "status": req.status,
            "created_at": req.created_at,
            "cover_url": book.cover_url,
            "author": book.author,
            "genre": book.genre,
            "publisher": book.publisher,
            "description": book.description
        })
    return result

@app.get("/comments/{book_id}")
def get_comments(book_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment, User).join(User, User.id == Comment.user_id).filter(Comment.book_id == book_id).order_by(Comment.created_at.desc()).all()
    return [
        {
            "username": user.username,
            "text": comment.text,
            "rating": comment.rating,
            "created_at": comment.created_at
        }
        for comment, user in comments
    ]

@app.post("/admin/add_user")
def admin_add_user(user: dict = Body(...), db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user["username"]).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")
    if "email" not in user or not user["email"]:
        raise HTTPException(status_code=400, detail="Email обязателен")
    if db.query(User).filter(User.email == user["email"]).first():
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    hashed_password = bcrypt.hash(user["password"])
    new_user = User(username=user["username"], password=hashed_password, role=user["role"], email=user["email"])
    db.add(new_user)
    db.commit()
    return {"message": "Пользователь добавлен"}

@app.post("/admin/delete_user")
def admin_delete_user(data: UsernameIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    db.query(Comment).filter(Comment.user_id == user.id).delete()

    db.query(Request).filter(Request.user_id == user.id).delete()

    db.delete(user)
    db.commit()
    return {"message": "Пользователь удалён"}

@app.post("/admin/edit_user")
def admin_edit_user(
    username: str = Body(...),
    new_username: str = Body(None),
    new_password: str = Body(None),
    new_role: str = Body(None),
    new_email: str = Body(None),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if new_username:
        user.username = new_username
    if new_password:
        user.password = bcrypt.hash(new_password)
    if new_role:
        user.role = new_role
    if new_email:
        if db.query(User).filter(User.email == new_email, User.id != user.id).first():
            raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
        user.email = new_email
    db.commit()
    return {"message": "Пользователь обновлён"}

@app.post("/admin/delete_book")
def admin_delete_book(data: BookIdIn, db: Session = Depends(get_db)):
    book_id = data.book_id
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    db.query(Rent).filter(Rent.book_id == book_id).delete()
    db.query(Request).filter(Request.book_id == book_id).delete()
    db.query(Comment).filter(Comment.book_id == book_id).delete()
    db.delete(book)
    db.commit()
    if book.pdf_path and os.path.exists(book.pdf_path):
        os.remove(book.pdf_path)
    return {"message": "Книга удалена"}

@app.get("/active_rents")
def get_active_rents(db: Session = Depends(get_db)):
    rents = db.query(Rent, User, Book).join(User, User.id == Rent.user_id).join(Book, Book.id == Rent.book_id).all()
    return [
        {
            "rent_id": rent.id,
            "username": user.username,
            "book_title": book.title,
            "book_id": book.id,
            "rented_at": rent.rented_at,
        }
        for rent, user, book in rents
    ]

@app.post("/librarian/cancel_rent")
def librarian_cancel_rent(data: RentIdIn, db: Session = Depends(get_db)):
    rent = db.query(Rent).filter(Rent.id == data.rent_id).first()
    if not rent:
        raise HTTPException(status_code=404, detail="Аренда не найдена")
    req = db.query(Request).filter(
        Request.user_id == rent.user_id,
        Request.book_id == rent.book_id,
        Request.status == "approved"
    ).first()
    if req:
        req.status = "cancelled"
    db.delete(rent)
    db.commit()
    return {"message": "Бронь удалена"}

@app.post("/librarian/extend_rent")
def librarian_extend_rent(rent_id: int = Body(...), hours: int = Body(...), db: Session = Depends(get_db)):
    rent = db.query(Rent).filter(Rent.id == rent_id).first()
    if not rent:
        raise HTTPException(status_code=404, detail="Аренда не найдена")
    rent.rented_at += timedelta(hours=hours)
    db.commit()
    return {"message": f"Аренда продлена на {hours} часов"}

@app.post("/librarian/give_book")
def librarian_give_book(username: str = Body(...), book_id: int = Body(...), db: Session = Depends(get_db)):
    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")

    existing_rent = db.query(Rent).filter(
        Rent.user_id == user.id,
        Rent.book_id == book_id,
        Rent.rented_at + timedelta(hours=48) > datetime.utcnow()
    ).first()
    if existing_rent:
        return {"message": "У пользователя уже есть активная аренда этой книги"}

    # Исправлено: проверяем только активные заявки
    active_statuses = ["pending", "approved", "return_requested"]
    existing_request = db.query(Request).filter(
        Request.user_id == user.id,
        Request.book_id == book_id,
        Request.status.in_(active_statuses)
    ).first()
    if existing_request:
        return {"message": "У пользователя уже есть активная заявка на эту книгу"}

    rent = Rent(user_id=user.id, book_id=book_id)
    db.add(rent)
    request = Request(user_id=user.id, book_id=book_id, status="approved")
    db.add(request)
    db.commit()
    return {"message": f"Книга '{book.title}' выдана пользователю {username}"}

@app.post("/request_return")
def request_return(data: ReturnRequestIn, db: Session = Depends(get_db)):
    user = get_user_by_username(db, data.username)
    req = db.query(Request).filter(Request.id == data.request_id, Request.user_id == user.id).first()
    if not req or req.status != "approved":
        raise HTTPException(status_code=400, detail="Нельзя вернуть эту книгу")
    comment = Comment(user_id=user.id, book_id=req.book_id, text=data.text, rating=data.rating)
    db.add(comment)
    req.status = "return_requested"
    db.commit()
    return {"message": "Запрос на возврат отправлен библиотекарю"}

@app.post("/librarian/accept_return")
def librarian_accept_return(data: AcceptReturnIn, db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == data.request_id).first()
    if not req or req.status != "return_requested":
        raise HTTPException(status_code=404, detail="Заявка не найдена или не ожидает возврата")
    # Найти и удалить аренду
    rent = db.query(Rent).filter(Rent.user_id == req.user_id, Rent.book_id == req.book_id).first()
    if rent:
        db.delete(rent)
    req.status = "returned"
    db.commit()
    return {"message": "Возврат книги принят"}

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
        # Новое уведомление о доступности книги
        for ws in self.active_connections.values():
            await ws.send_json({
                "type": "book_available",
                "book_id": book_id,
                "book_title": book_title
            })

user_chat_manager = UserChatManager()

@app.websocket("/ws/chat/{username}")
async def websocket_chat(websocket: WebSocket, username: str):
    await user_chat_manager.connect(username, websocket)
    await user_chat_manager.broadcast_user_list()
    try:
        while True:
            data = await websocket.receive_json()
            # data: {type, ...}
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

@app.post("/change_password")
def change_password(data: ChangePasswordIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if not auth.verify_password(data.old_password, user.password):
        raise HTTPException(status_code=400, detail="Старый пароль неверен")
    user.password = auth.get_password_hash(data.new_password)
    db.commit()
    return {"message": "Пароль успешно изменён"}

# In-memory store for reset tokens (for demo; use DB in production)
reset_tokens = {}

@app.post("/request_password_reset")
def request_password_reset(data: EmailIn, db: Session = Depends(get_db)):
    email = data.email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь с таким email не найден")
    token = str(uuid4())
    reset_tokens[token] = user.username
    reset_link = f"http://localhost:3000/reset-password/{token}"
    # Send email via Gmail SMTP
    try:
        smtp_user = os.environ.get("GMAIL_USER")
        smtp_pass = os.environ.get("GMAIL_PASS")
        if not smtp_user or not smtp_pass:
            print("GMAIL_USER or GMAIL_PASS not set in environment")
            raise Exception("GMAIL_USER or GMAIL_PASS not set in environment")
        msg = MIMEText(f"Для сброса пароля перейдите по ссылке: {reset_link}")
        msg["Subject"] = "Сброс пароля"
        msg["From"] = smtp_user
        msg["To"] = email
        # Используем порт 587 и starttls
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, [email], msg.as_string())
    except Exception as e:
        print("Ошибка при отправке email:", e)  # <-- добавьте это
        raise HTTPException(status_code=500, detail=f"Ошибка отправки email: {e}")
    return {"message": "Письмо для сброса пароля отправлено на почту"}

@app.post("/reset_password")
def reset_password(token: str = Body(...), new_password: str = Body(...), db: Session = Depends(get_db)):
    username = reset_tokens.get(token)
    if not username:
        raise HTTPException(status_code=400, detail="Неверный или устаревший токен")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    user.password = auth.get_password_hash(new_password)
    db.commit()
    del reset_tokens[token]
    return {"message": "Пароль успешно сброшен"}

@app.post("/transfer_book")
def transfer_book(
    from_username: str = Body(...),
    to_username: str = Body(...),
    book_id: int = Body(...),
    db: Session = Depends(get_db)
):
    from_user = db.query(User).filter(User.username == from_username).first()
    to_user = db.query(User).filter(User.username == to_username).first()
    book = db.query(Book).filter(Book.id == book_id).first()
    if not from_user or not to_user or not book:
        raise HTTPException(status_code=404, detail="Пользователь или книга не найдены")

    # Удаляем аренду и заявку у отправителя
    rent = db.query(Rent).filter(Rent.user_id == from_user.id, Rent.book_id == book_id).first()
    if rent:
        db.delete(rent)
    req = db.query(Request).filter(Request.user_id == from_user.id, Request.book_id == book_id, Request.status == "approved").first()
    if req:
        req.status = "transferred"
    # Удаляем все заявки получателя на эту книгу (pending/declined)
    db.query(Request).filter(Request.user_id == to_user.id, Request.book_id == book_id).delete()
    # Добавляем аренду и заявку получателю
    new_rent = Rent(user_id=to_user.id, book_id=book_id)
    db.add(new_rent)
    new_req = Request(user_id=to_user.id, book_id=book_id, status="approved")
    db.add(new_req)
    db.commit()
    # Оповестить через WebSocket о доступности книги (если нужно)
    # await user_chat_manager.broadcast_book_available(book_id, book.title) # если нужно уведомление всем
    return {"message": f"Книга '{book.title}' передана от {from_username} к {to_username}"}
