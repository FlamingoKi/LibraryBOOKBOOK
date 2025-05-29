"""SQLAlchemy models for library system."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timedelta
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()


class User(Base):
    """User model."""
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="reader")
    email = Column(String, unique=True, index=True)  # новое поле email

class Book(Base):
    """Book model."""
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    author = Column(String)
    genre = Column(String)
    publisher = Column(String)
    cover_url = Column(String)
    pdf_path = Column(String)  # <--- новое поле для PDF

class Rent(Base):
    """Rent model."""
    __tablename__ = "rents"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"))  # <--- добавлено ondelete
    rented_at = Column(DateTime, default=datetime.utcnow)

class Request(Base):
    """Request model."""
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"))  # <--- добавлено ondelete
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

class Comment(Base):
    """Comment model."""
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"))  # <--- добавлено ondelete
    text = Column(String)
    rating = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

