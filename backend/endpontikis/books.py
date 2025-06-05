from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_, select
from dependencies import get_db, require_role
from models import Book
import os

router = APIRouter()

@router.get("/books")
async def get_books(
    query: str = None,
    author: str = None,
    genre: str = None,
    publisher: str = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Book)
    filters = []
    if query:
        filters.append(
            or_(
                Book.author.ilike(f"%{query}%"),
                Book.genre.ilike(f"%{query}%"),
                Book.publisher.ilike(f"%{query}%"),
                Book.title.ilike(f"%{query}%"),
                Book.description.ilike(f"%{query}%")
            )
        )
    if author:
        filters.append(Book.author.ilike(f"%{author}%"))
    if genre:
        filters.append(Book.genre.ilike(f"%{genre}%"))
    if publisher:
        filters.append(Book.publisher.ilike(f"%{publisher}%"))
    if filters:
        stmt = stmt.where(*filters)
    result = await db.execute(stmt)
    books = result.scalars().all()
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

@router.post("/add_books")
async def add_book_with_pdf(
    title: str = Form(...),
    author: str = Form(...),
    genre: str = Form(...),
    publisher: str = Form(...),
    description: str = Form(...),
    cover_url: str = Form(...),
    pdf_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current=Depends(require_role("librarian"))
):
    for field, value in [
        ("title", title), ("author", author), ("genre", genre),
        ("publisher", publisher), ("description", description), ("cover_url", cover_url)
    ]:
        if not isinstance(value, str):
            raise HTTPException(status_code=400, detail=f"Поле '{field}' должно быть строкой.")
    if not pdf_file.filename.lower().endswith('.pdf') or pdf_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Пожалуйста, загрузите файл в формате PDF.")
    new_book = Book(
        title=title,
        author=author,
        genre=genre,
        publisher=publisher,
        description=description,
        cover_url=cover_url,
    )
    db.add(new_book)
    await db.commit()
    await db.refresh(new_book)
    os.makedirs("books", exist_ok=True)
    file_path = f"books/{new_book.id}.pdf"
    with open(file_path, "wb") as f:
        f.write(await pdf_file.read())
    new_book.pdf_path = file_path
    await db.commit()
    return {"message": "Книга добавлена с PDF", "book_id": new_book.id}

@router.get("/read/{book_id}")
async def read_book(book_id: int, db: AsyncSession = Depends(get_db)):
    if not isinstance(book_id, int):
        raise HTTPException(status_code=400, detail="ID книги должен быть целым числом.")
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalars().first()
    if not book or not book.pdf_path or not os.path.exists(book.pdf_path):
        raise HTTPException(status_code=404, detail="Файл книги не найден.")
    from fastapi.responses import FileResponse
    return FileResponse(book.pdf_path, media_type="application/pdf", filename=os.path.basename(book.pdf_path))

