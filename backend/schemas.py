from pydantic import BaseModel, conint

class UserIn(BaseModel):
    username: str
    password: str
    email: str

class RoleUpdate(BaseModel):
    username: str
    new_role: str

class BookCreate(BaseModel):
    title: str
    author: str
    genre: str
    publisher: str
    description: str
    cover_url: str

class CommentIn(BaseModel):
    book_id: int
    text: str
    rating: conint(ge=1, le=5)
    username: str

class CancelRequestIn(BaseModel):
    request_id: int
    username: str
    text: str = None
    rating: int = None

class AdminUserIn(BaseModel):
    username: str
    password: str 
    role: str = "reader"

class UsernameIn(BaseModel):
    username: str

class BookIdIn(BaseModel):
    book_id: int

class RentIdIn(BaseModel):
    rent_id: int

class ChangePasswordIn(BaseModel):
    username: str
    old_password: str
    new_password: str

class EmailIn(BaseModel):
    email: str

class ProcessRequestIn(BaseModel):
    request_id: int
    approve: bool

class ReturnRequestIn(BaseModel):
    request_id: int
    username: str
    text: str
    rating: int

class AcceptReturnIn(BaseModel):
    request_id: int

class CancelPendingRequestIn(BaseModel):
    request_id: int
    username: str
