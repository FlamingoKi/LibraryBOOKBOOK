from fastapi import HTTPException
from models import User

def get_user_by_username(db, username):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user
