from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from dependencies import get_db, require_role
from models import Request, Rent, Book, Comment, User
from schemas import ProcessRequestIn, ReturnRequestIn
from crud import get_user_by_username
from datetime import timedelta, datetime
from sqlalchemy import select, update

router = APIRouter()

@router.post("/request_rent")
async def request_rent(username: str = Body(...), book_id: int = Body(...), db: AsyncSession = Depends(get_db)):
    if not isinstance(username, str):
        raise HTTPException(status_code=400, detail="логин должен быть строкой.")
    if not isinstance(book_id, int):
        raise HTTPException(status_code=400, detail="ID книги должен быть целым числом.")
    
    user = await get_user_by_username(db, username)
    q = select(Request, Rent).outerjoin(
        Rent, (Rent.user_id == user.id) & (Rent.book_id == book_id) & (Rent.rented_at + timedelta(hours=48) > datetime.utcnow())
    ).where(
        Request.user_id == user.id,
        Request.book_id == book_id,
        Request.status.in_(["pending", "approved"])
    )
    result = await db.execute(q)
    req_rent = result.first()
    if req_rent:
        existing_request, existing_rent = req_rent
        if existing_request:
            return {"message": "У вас уже есть активная бронь или аренда на эту книгу"}
        if existing_rent:
            return {"message": "Книга уже арендована вами"}
    req = Request(user_id=user.id, book_id=book_id)
    db.add(req)
    await db.commit()
    return {"message": "Заявка на аренду отправлена библиотекарю"}

@router.get("/requests")
async def get_requests(
    db: AsyncSession = Depends(get_db),
    current=Depends(require_role("librarian"))
):
    stmt = select(Request, User, Book)\
        .join(User, User.id == Request.user_id)\
        .join(Book, Book.id == Request.book_id)\
        .where(Request.status.in_(["pending", "return_requested"]))
    result = await db.execute(stmt)
    requests = result.all()
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


@router.post("/process_request")
async def process_request(
    data: ProcessRequestIn,
    db: AsyncSession = Depends(get_db),
    current=Depends(require_role("librarian"))
):
    if not isinstance(data.request_id, int):
        raise HTTPException(status_code=400, detail="ID заявки должен быть целым числом.")
    if not isinstance(data.approve, bool):
        raise HTTPException(status_code=400, detail="approve должен быть булевым значением (True или False).")
    
    req = (await db.execute(select(Request).where(Request.id == data.request_id))).scalars().first()
    if not req or req.status != "pending":
        raise HTTPException(status_code=404, detail="Заявка не найдена или уже обработана.")
    if data.approve:
        await db.execute(
            update(Request)
            .where(Request.book_id == req.book_id, Request.status == "pending", Request.id != req.id)
            .values(status="declined")
        )
        req.status = "approved"
        rent = Rent(user_id=req.user_id, book_id=req.book_id)
        db.add(rent)
        await db.commit()
        return {"message": "Заявка одобрена, остальные заявки отклонены"}
    else:
        req.status = "declined"
        await db.commit()
        return {"message": "Заявка отклонена"}

@router.get("/my_requests")
async def my_requests(username: str, db: AsyncSession = Depends(get_db)):
    if not isinstance(username, str):
        raise HTTPException(status_code=400, detail="Юзер должно быть строкой.")
    
    user = await get_user_by_username(db, username)
    user_id = user.id if hasattr(user, "id") else user
    stmt = select(Request, Book).join(Book, Book.id == Request.book_id).where(Request.user_id == user_id)
    result = await db.execute(stmt)
    requests = result.all()
    return [
        {
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
        }
        for req, book in requests
    ]

@router.get("/comments/{book_id}")
async def get_comments(book_id: int, db: AsyncSession = Depends(get_db)):
    if not isinstance(book_id, int):
        raise HTTPException(status_code=400, detail="ID книги должен быть целым числом.")
    
    stmt = select(Comment, User).join(User, User.id == Comment.user_id).where(Comment.book_id == book_id).order_by(Comment.created_at.desc())
    result = await db.execute(stmt)
    comments = result.all()
    return [
        {
            "username": user.username,
            "text": comment.text,
            "rating": comment.rating,
            "created_at": comment.created_at
        }
        for comment, user in comments
    ]

@router.post("/request_return")
async def request_return(data: ReturnRequestIn, db: AsyncSession = Depends(get_db)):
    if not isinstance(data.request_id, int):
        raise HTTPException(status_code=400, detail="ID заявки должен быть целым числом.")
    if not isinstance(data.username, str):
        raise HTTPException(status_code=400, detail="юзер должно быть строкой.")
    if not isinstance(data.text, str):
        raise HTTPException(status_code=400, detail="Текст должен быть строкой.")
    if not isinstance(data.rating, int):
        raise HTTPException(status_code=400, detail="Рейтинг должен быть целым числом.")
    
    user = await get_user_by_username(db, data.username)
    stmt = select(Request).where(Request.id == data.request_id, Request.user_id == user.id)
    req = (await db.execute(stmt)).scalars().first()
    if not req or req.status != "approved":
        raise HTTPException(status_code=400, detail="Нельзя вернуть эту книгу.")
    comment = Comment(user_id=user.id, book_id=req.book_id, text=data.text, rating=data.rating)
    db.add(comment)
    req.status = "return_requested"
    await db.commit()
    return {"message": "Запрос на возврат отправлен библиотекарю"}

@router.get("/active_rents")
async def get_active_rents(db: AsyncSession = Depends(get_db)):
    stmt = select(Rent, User, Book).join(User, User.id == Rent.user_id).join(Book, Book.id == Rent.book_id)
    result = await db.execute(stmt)
    rents = result.all()
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
