from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import AsyncSessionLocal
from models import User
from jose import JWTError, jwt
from auth import oauth2_scheme
import auth

async def get_db():
    async with AsyncSessionLocal() as db:
        yield db

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    from sqlalchemy import select
    result = await db.execute(
        select(User).where(User.username == username)
    )
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

def require_role(required_role: str):
    async def role_checker(user=Depends(get_current_user)):
        if user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Доступ запрещён: требуется роль {required_role}"
            )
        return user
    return role_checker

def require_roles(*roles):
    async def role_checker(user=Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Доступ запрещён: требуется роль {' или '.join(roles)}"
            )
        return user
    return role_checker
