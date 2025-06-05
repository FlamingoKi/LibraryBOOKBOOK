from pydantic import BaseModel, conint, constr

class UserIn(BaseModel):
    username: constr(min_length=3, max_length=12, pattern=r"^[a-zA-Z0-9_]+$")
    password: constr(min_length=4, max_length=8)
    email: constr(min_length=5, max_length=64, pattern=r"^[^@]+@[^@]+\.[^@]+$")

class RoleUpdate(BaseModel):
    username: constr(min_length=3, max_length=12, pattern=r"^[a-zA-Z0-9_]+$")
    new_role: constr(min_length=3, max_length=16)

class BookCreate(BaseModel):
    title: constr(min_length=1, max_length=128)
    author: constr(min_length=1, max_length=128)
    genre: constr(min_length=1, max_length=64)
    publisher: constr(min_length=1, max_length=128)
    description: constr(min_length=1, max_length=256)
    cover_url: constr(min_length=1, max_length=256)

class CommentIn(BaseModel):
    book_id: int
    text: constr(min_length=1, max_length=512)
    rating: conint(ge=1, le=5)
    username: constr(min_length=3, max_length=12, pattern=r"^[a-zA-Z0-9_]+$")

class CancelRequestIn(BaseModel):
    request_id: int
    username: constr(min_length=3, max_length=12, pattern=r"^[a-zA-Z0-9_]+$")
    text: constr(min_length=1, max_length=512) = None
    rating: int = None

class AdminUserIn(BaseModel):
    username: constr(min_length=3, max_length=12, pattern=r"^[a-zA-Z0-9_]+$")
    password: constr(min_length=4, max_length=8)
    role: constr(min_length=3, max_length=16) = "reader"

class UsernameIn(BaseModel):
    username: constr(min_length=3, max_length=12, pattern=r"^[a-zA-Z0-9_]+$")

class BookIdIn(BaseModel):
    book_id: int

class RentIdIn(BaseModel):
    rent_id: int

class ChangePasswordIn(BaseModel):
    username: constr(min_length=3, max_length=12, pattern=r"^[a-zA-Z0-9_]+$")
    old_password: constr(min_length=4)
    new_password: constr(min_length=4)

class EmailIn(BaseModel):
    email: constr(min_length=5, max_length=64, pattern=r"^[^@]+@[^@]+\.[^@]+$")

class ProcessRequestIn(BaseModel):
    request_id: int
    approve: bool

class ReturnRequestIn(BaseModel):
    request_id: int
    username: constr(min_length=3, max_length=12, pattern=r"^[a-zA-Z0-9_]+$")
    text: constr(min_length=1, max_length=512)
    rating: int

class AcceptReturnIn(BaseModel):
    request_id: int

class CancelPendingRequestIn(BaseModel):
    request_id: int
    username: constr(min_length=3, max_length=12, pattern=r"^[a-zA-Z0-9_]+$")
