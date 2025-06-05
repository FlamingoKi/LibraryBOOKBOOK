from fastapi import HTTPException
from models import User
from sqlalchemy import select

async def get_user_by_username(db, username):
    result = await db.execute(
        select(User).where(User.username == username)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user
