from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from dependencies import get_db, require_roles
from models import User, Rent, Book
from crud import get_user_by_username
from datetime import datetime, timedelta
from sqlalchemy import select

router = APIRouter()

@router.get("/profile/{username}")
async def get_profile(username: str, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_username(db, username)
    now = datetime.utcnow()
    stmt = (
        select(Rent, Book)
        .join(Book, Book.id == Rent.book_id)
        .where(
            Rent.user_id == user.id,
            Rent.rented_at + timedelta(hours=48) > now
        )
    )
    result = await db.execute(stmt)
    active_rents = result.all()
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


@router.get("/users")
async def get_users(
    db: AsyncSession = Depends(get_db),
    user=Depends(require_roles("admin", "librarian"))
):
    result = await db.execute(select(User))
    return result.scalars().all()
