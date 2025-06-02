# Book Book — Электронная библиотека

## Описание

Веб-приложение для управления электронной библиотекой с ролями пользователей (читатель, библиотекарь, администратор), бронированием и выдачей книг, чатом и системой отзывов.

---

## Используемые технологии

### Backend
- **Python 3.12+**
- **FastAPI** — backend-фреймворк
- **SQLAlchemy** — ORM для работы с PostgreSQL
- **Alembic** — миграции БД
- **Passlib** — хеширование паролей
- **JWT (python-jose)** — аутентификация
- **dotenv** — переменные окружения
- **smtplib** — отправка email
- **psycopg2-binary** — драйвер PostgreSQL
- **python-multipart** — для загрузки файлов
- **pydantic** — для валидации данных

### Frontend
- **React (Create React App)**
- **Material UI (MUI)** — UI-компоненты
- **zustand** — глобальное хранилище состояния
- **react-router-dom** — маршрутизация

---

## Инструкция по запуску

### Backend

1. **Установите зависимости:**
    ```sh
    cd backend
    pip install -r requirements.txt
    ```

2. **Настройте .env:**  
    Проверьте файл [.env](backend/.env) — укажите параметры подключения к БД и email.
    DATABASE_URL=postgresql://postgres:пароль@localhost:5432/название базы
    SECRET_KEY=ваш секретный ключ
    GMAIL_USER=ваша почта от гугла
    GMAIL_PASS=ваш пароль приложения(не пароль от аккаунта гугл!!!)

3. **Создайте базу в PostgresSQL:**
    ```
    Назовите ее library_db
    ```

4. **Запустите сервер:**
    ```sh
    uvicorn main:app --reload
    ```

### Frontend

1. **Установите зависимости:**
    ```sh
    cd frontend
    npm install
    ```

2. **Запустите приложение:**
    ```sh
    npm start
    ```
    Откройте [http://localhost:3000](http://localhost:3000) в браузере.

---

## Скриншоты

> ![страница входа](screenshots/1.png)
> ![страница регистрации](screenshots/2.png)
> ![страница профиля](screenshots/3.png)
> ![странциа каталога](screenshots/4.png)
> ![страница чатов](screenshots/5.png)
> ![Панель админа](screenshots/6.png)
> ![Панель библиотекаря](screenshots/7.png)
> ![Панель библиотекаря 2](screenshots/8.png)

---

## Примеры API-запросов

### Регистрация пользователя

```http
POST /register
Content-Type: application/json

{
  "username": "user1",
  "password": "pass123",
  "email": "user1@example.com"
}
```

### Получение токена (логин)

```http
POST /token
Content-Type: application/x-www-form-urlencoded

username=user1&password=pass123
```

### Получение списка книг

```http
GET /books
Authorization: Bearer <token>
```

### Бронирование книги

```http
POST /request_rent
Content-Type: application/json

{
  "username": "user1",
  "book_id": 5
}
```

### Отправка комментария (отзыва)

```http
POST /request_return
Content-Type: application/json

{
  "request_id": 12,
  "username": "user1",
  "text": "Отличная книга!",
  "rating": 5
}
```

### Получение комментариев к книге

```http
GET /comments/5
Authorization: Bearer <token>
```

---

## Контакты

- Автор: [FlamingoKI]
- Репозиторий: [https://github.com/FlamingoKi/LibraryBOOKBOOK]

---

_Для подробностей смотрите исходный код и документацию к FastAPI/React._