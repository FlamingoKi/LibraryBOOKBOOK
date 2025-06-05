from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from dependencies import get_db
from models import User, Book, Rent, Request
from sqlalchemy import select, delete

router = APIRouter()

@router.post("/transfer_book")
async def transfer_book(
    from_username: str = Body(...),
    to_username: str = Body(...),
    book_id: int = Body(...),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(from_username, str):
        raise HTTPException(status_code=400, detail="Имя отправителя должно быть строкой.")
    if not isinstance(to_username, str):
        raise HTTPException(status_code=400, detail="Имя получателя должно быть строкой.")
    if not isinstance(book_id, int):
        raise HTTPException(status_code=400, detail="ID книги должен быть целым числом.")

    stmt = (
        select(User, Book)
        .join(Book, Book.id == book_id)
        .where(User.username.in_([from_username, to_username]))
    )
    result = await db.execute(stmt)
    users_books = result.all()
    from_user = to_user = book = None
    for user, b in users_books:
        if user.username == from_username:
            from_user = user
        elif user.username == to_username:
            to_user = user
        book = b

    if not from_user or not to_user or not book:
        raise HTTPException(status_code=404, detail="Пользователь или книга не найдены.")

    rent_result = await db.execute(select(Rent).where(Rent.user_id == from_user.id, Rent.book_id == book_id))
    rent = rent_result.scalars().first()
    if rent:
        await db.delete(rent)
    req_result = await db.execute(select(Request).where(Request.user_id == from_user.id, Request.book_id == book_id, Request.status == "approved"))
    req = req_result.scalars().first()
    if req:
        req.status = "transferred"
    await db.execute(delete(Request).where(Request.user_id == to_user.id, Request.book_id == book_id))
    new_rent = Rent(user_id=to_user.id, book_id=book_id)
    db.add(new_rent)
    new_req = Request(user_id=to_user.id, book_id=book_id, status="approved")
    db.add(new_req)
    await db.commit()
    return {"message": f"Книга '{book.title}' передана от {from_username} к {to_username}"}

