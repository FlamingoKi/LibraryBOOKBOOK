from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from dependencies import get_db, require_role
from models import User, Book, Rent, Request, Comment
from schemas import RoleUpdate, UsernameIn, BookIdIn
from passlib.hash import bcrypt
from crud import get_user_by_username
import os
from sqlalchemy import select, delete
import re

router = APIRouter()

@router.post("/admin/add_user")
async def admin_add_user(
    user: dict = Body(...),
    db: AsyncSession = Depends(get_db),
    current=Depends(require_role("admin"))
):
    if not (3 <= len(user["username"]) <= 12) or not re.match(r"^[a-zA-Z0-9_]+$", user["username"]):
        raise HTTPException(status_code=400, detail="Логин должен быть 3-12 символов, только латиница, цифры и _")
    if len(user["password"]) < 8:
        raise HTTPException(status_code=400, detail="минимум 8 символов")
    if not re.search(r"[A-Z]", user["password"]):
        raise HTTPException(status_code=400, detail="хотя бы одну заглавную букву")
    if not re.search(r"[a-z]", user["password"]):
        raise HTTPException(status_code=400, detail="хотя бы одну строчную букву")
    if not re.search(r"\d", user["password"]):
        raise HTTPException(status_code=400, detail="хотя бы одну цифру")
    if not re.search(r"[^A-Za-z0-9]", user["password"]):
        raise HTTPException(status_code=400, detail="хотя бы один специальный символ")
    if not ("email" in user and 5 <= len(user["email"]) <= 64 and re.match(r"^[^@]+@[^@]+\.[^@]+$", user["email"])):
        raise HTTPException(status_code=400, detail="Некорректный email")
    result = await db.execute(select(User).where(User.username == user["username"]))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким именем уже существует.")
    if "email" not in user or not user["email"]:
        raise HTTPException(status_code=400, detail="Поле email обязательно для заполнения.")
    result = await db.execute(select(User).where(User.email == user["email"]))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже зарегистрирован.")
    hashed_password = bcrypt.hash(user["password"])
    new_user = User(username=user["username"], password=hashed_password, role=user["role"], email=user["email"])
    db.add(new_user)
    await db.commit()
    return {"message": "Пользователь добавлен"}

@router.post("/admin/delete_user")
async def admin_delete_user(
    data: UsernameIn,
    db: AsyncSession = Depends(get_db),
    current=Depends(require_role("admin"))
):
    if not isinstance(data.username, str):
        raise HTTPException(status_code=400, detail="Имя пользователя должно быть строкой.")
    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден.")

    await db.execute(delete(Comment).where(Comment.user_id == user.id))
    await db.execute(delete(Request).where(Request.user_id == user.id))
    await db.execute(delete(Rent).where(Rent.user_id == user.id))
    await db.delete(user)
    await db.commit()
    return {"message": "Пользователь удалён"}

@router.post("/admin/edit_user")
async def admin_edit_user(
    username: str = Body(...),
    new_username: str = Body(None),
    new_password: str = Body(None),
    new_role: str = Body(None),
    new_email: str = Body(None),
    db: AsyncSession = Depends(get_db),
    current=Depends(require_role("admin"))
):
    if not isinstance(username, str):
        raise HTTPException(status_code=400, detail="юзер должен быть строкой.")
    if new_username is not None and not isinstance(new_username, str):
        raise HTTPException(status_code=400, detail="Новый юзер должен быть строкой.")
    if new_password is not None and not isinstance(new_password, str):
        raise HTTPException(status_code=400, detail="Новый пароль должен быть строкой.")
    if new_role is not None and not isinstance(new_role, str):
        raise HTTPException(status_code=400, detail="Новая роль должна быть строкой.")
    if new_email is not None and not isinstance(new_email, str):
        raise HTTPException(status_code=400, detail="Новый email должен быть строкой.")
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден.")
    if new_username:
        user.username = new_username
    if new_password:
        user.password = bcrypt.hash(new_password)
    if new_role:
        user.role = new_role
    if new_email:
        result = await db.execute(select(User).where(User.email == new_email, User.id != user.id))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Пользователь с таким email уже зарегистрирован.")
        user.email = new_email
    await db.commit()
    return {"message": "Пользователь обновлён"}

@router.post("/change-role")
async def change_role(data: RoleUpdate, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_username(db, data.username)
    user.role = data.new_role
    await db.commit()
    return {"message": f"Роль пользователя {data.username} изменена на {data.new_role}"}

