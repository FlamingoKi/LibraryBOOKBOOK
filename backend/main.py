from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from endpontikis import auth, users, books, admin, librarian, requests, chat, utils
from dotenv import load_dotenv

app = FastAPI()

@app.on_event("startup")
async def on_startup():
    await init_db()

load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(books.router)
app.include_router(admin.router)
app.include_router(librarian.router)
app.include_router(requests.router)
app.include_router(chat.router)
app.include_router(utils.router)
