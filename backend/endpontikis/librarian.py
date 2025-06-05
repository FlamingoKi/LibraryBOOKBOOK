from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from dependencies import get_db, require_role
from models import Rent, Request, Book, User, Comment
from schemas import RentIdIn, AcceptReturnIn, BookIdIn
import os
from sqlalchemy import select, delete
from datetime import timedelta, datetime

router = APIRouter()

@router.post("/librarian/cancel_rent")
async def librarian_cancel_rent(
    data: RentIdIn,
    db: AsyncSession = Depends(get_db),
    current=Depends(require_role("librarian"))
):
    if not isinstance(data.rent_id, int):
        raise HTTPException(status_code=400, detail="ID аренды должен быть целым числом.")
    rent = (await db.execute(select(Rent).where(Rent.id == data.rent_id))).scalars().first()
    if not rent:
        raise HTTPException(status_code=404, detail="Аренда не найдена.")
    req = (await db.execute(
        select(Request).where(
            Request.user_id == rent.user_id,
            Request.book_id == rent.book_id,
            Request.status == "approved"
        )
    )).scalars().first()
    if req:
        req.status = "cancelled"
    await db.delete(rent)
    await db.commit()
    return {"message": "Бронь удалена"}

@router.post("/librarian/extend_rent")
async def librarian_extend_rent(
    rent_id: int = Body(...),
    hours: int = Body(...),
    db: AsyncSession = Depends(get_db),
    current=Depends(require_role("librarian"))
):
    if not isinstance(rent_id, int):
        raise HTTPException(status_code=400, detail="ID аренды должен быть целым числом.")
    if not isinstance(hours, int):
        raise HTTPException(status_code=400, detail="Количество часов должно быть целым числом.")
    rent = (await db.execute(select(Rent).where(Rent.id == rent_id))).scalars().first()
    if not rent:
        raise HTTPException(status_code=404, detail="Аренда не найдена.")
    rent.rented_at += timedelta(hours=hours)
    await db.commit()
    return {"message": f"Аренда продлена на {hours} часов"}

@router.post("/librarian/give_book")
async def librarian_give_book(
    username: str = Body(...),
    book_id: int = Body(...),
    db: AsyncSession = Depends(get_db),
    current=Depends(require_role("librarian"))
):
    if not isinstance(username, str):
        raise HTTPException(status_code=400, detail="Имя пользователя должно быть строкой.")
    if not isinstance(book_id, int):
        raise HTTPException(status_code=400, detail="ID книги должен быть целым числом.")

    stmt = (
        select(User, Book)
        .join(Book, Book.id == book_id)
        .where(User.username == username)
    )
    result = await db.execute(stmt)
    user_book = result.first()
    if not user_book:
        raise HTTPException(status_code=404, detail="Пользователь или книга не найдены.")
    user, book = user_book

    existing_rent = (await db.execute(
        select(Rent).where(
            Rent.user_id == user.id,
            Rent.book_id == book_id,
            Rent.rented_at + timedelta(hours=48) > datetime.utcnow()
        )
    )).scalars().first()
    if existing_rent:
        return {"message": "У пользователя уже есть активная аренда этой книги."}

    active_statuses = ["pending", "approved", "return_requested"]
    existing_request = (await db.execute(
        select(Request).where(
            Request.user_id == user.id,
            Request.book_id == book_id,
            Request.status.in_(active_statuses)
        )
    )).scalars().first()
    if existing_request:
        return {"message": "У пользователя уже есть активная заявка на эту книгу."}

    rent = Rent(user_id=user.id, book_id=book_id)
    db.add(rent)
    request = Request(user_id=user.id, book_id=book_id, status="approved")
    db.add(request)
    await db.commit()
    return {"message": f"Книга '{book.title}' выдана пользователю {username}"}

@router.post("/librarian/accept_return")
async def librarian_accept_return(
    data: AcceptReturnIn,
    db: AsyncSession = Depends(get_db),
    current=Depends(require_role("librarian"))
):
    if not isinstance(data.request_id, int):
        raise HTTPException(status_code=400, detail="ID заявки должен быть целым числом.")
    req = (await db.execute(select(Request).where(Request.id == data.request_id))).scalars().first()
    if not req or req.status != "return_requested":
        raise HTTPException(status_code=404, detail="Заявка не найдена или не ожидает возврата.")
    rent = (await db.execute(
        select(Rent).where(Rent.user_id == req.user_id, Rent.book_id == req.book_id)
    )).scalars().first()
    if rent:
        await db.delete(rent)
    req.status = "returned"
    await db.commit()
    return {"message": "Возврат книги принят"}

@router.post("/librarian/delete_book")
async def librarian_delete_book(
    data: BookIdIn,
    db: AsyncSession = Depends(get_db),
    current=Depends(require_role("librarian"))
):
    book_id = data.book_id
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalars().first()
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена.")
    await db.execute(delete(Rent).where(Rent.book_id == book_id))
    await db.execute(delete(Request).where(Request.book_id == book_id))
    await db.execute(delete(Comment).where(Comment.book_id == book_id))
    await db.delete(book)
    await db.commit()
    if book.pdf_path and os.path.exists(book.pdf_path):
        os.remove(book.pdf_path)
    return {"message": "Книга удалена"}
