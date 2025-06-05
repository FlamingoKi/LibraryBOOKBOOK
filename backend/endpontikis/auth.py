from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm
import auth
from models import User
from dependencies import get_db
from passlib.hash import bcrypt
from schemas import ChangePasswordIn, EmailIn
from uuid import uuid4
import os
import smtplib
from email.mime.text import MIMEText
from sqlalchemy import select
import re

router = APIRouter()
reset_tokens = {}

@router.post("/register")
async def register(
    username: str = Body(...),
    password: str = Body(...),
    email: str = Body(...),
    db: AsyncSession = Depends(get_db)
):
    if not (3 <= len(username) <= 12) or not re.match(r"^[a-zA-Z0-9_]+$", username):
        raise HTTPException(status_code=400, detail="Логин должен быть 3-12 символов, только латиница, цифры и _")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="минимум 8 символов")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="хотя бы одну заглавную букву")
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="хотя бы одну строчную букву")
    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="хотя бы одну цифру")
    if not re.search(r"[^A-Za-z0-9]", password):
        raise HTTPException(status_code=400, detail="хотя бы один специальный символ")
    if not (5 <= len(email) <= 64) or not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        raise HTTPException(status_code=400, detail="Некорректный email")
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    if user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")
    result = await db.execute(select(User).where(User.email == email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    hashed_password = auth.get_password_hash(password)
    new_user = User(username=username, password=hashed_password, role="reader", email=email)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"message": "Пользователь создан"}

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalars().first()
    if not user or not auth.verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Неверные учетные данные")
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@router.post("/change_password")
async def change_password(data: ChangePasswordIn, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if not auth.verify_password(data.old_password, user.password):
        raise HTTPException(status_code=400, detail="Старый пароль неверен")
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="минимум 8 символов")
    if not re.search(r"[A-Z]", data.new_password):
        raise HTTPException(status_code=400, detail="хотя бы одну заглавную букву")
    if not re.search(r"[a-z]", data.new_password):
        raise HTTPException(status_code=400, detail="хотя бы одну строчную букву")
    if not re.search(r"\d", data.new_password):
        raise HTTPException(status_code=400, detail="хотя бы одну цифру")
    if not re.search(r"[^A-Za-z0-9]", data.new_password):
        raise HTTPException(status_code=400, detail="хотя бы один специальный символ")
    user.password = auth.get_password_hash(data.new_password)
    await db.commit()
    return {"message": "Пароль успешно изменён"}

reset_tokens = {}

@router.post("/request_password_reset")
async def request_password_reset(data: EmailIn, db: AsyncSession = Depends(get_db)):
    email = data.email
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь с таким email не найден")
    token = str(uuid4())
    reset_tokens[token] = user.username
    reset_link = f"http://localhost:3000/reset-password/{token}"
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
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, [email], msg.as_string())
    except Exception as e:
        print("Ошибка при отправке email:", e)
        raise HTTPException(status_code=500, detail=f"Ошибка отправки email: {e}")
    return {"message": "Письмо для сброса пароля отправлено на почту"}

@router.post("/reset_password")
async def reset_password(token: str = Body(...), new_password: str = Body(...), db: AsyncSession = Depends(get_db)):
    username = reset_tokens.get(token)
    if not username:
        raise HTTPException(status_code=400, detail="Неверный или устаревший токен")
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="минимум 8 символов")
    if not re.search(r"[A-Z]", new_password):
        raise HTTPException(status_code=400, detail="хотя бы одну заглавную букву")
    if not re.search(r"[a-z]", new_password):
        raise HTTPException(status_code=400, detail="хотя бы одну строчную букву")
    if not re.search(r"\d", new_password):
        raise HTTPException(status_code=400, detail="хотя бы одну цифру")
    if not re.search(r"[^A-Za-z0-9]", new_password):
        raise HTTPException(status_code=400, detail="хотя бы один специальный символ")
    user.password = auth.get_password_hash(new_password)
    await db.commit()
    del reset_tokens[token]
    return {"message": "Пароль успешно сброшен"}