# Hotel Complex — веб-приложение гостиничного комплекса

Курсовой проект по дисциплине «Технология разработки программного обеспечения»  
React SPA + Django REST API + AJAX + JWT + WebSocket

[Пояснительная записка](./Пояснительная%20записка%20обновленная.docx)

---

## Содержание

1. [О проекте](#1-о-проекте)
2. [Технологический стек](#2-технологический-стек)
3. [Структура проекта](#3-структура-проекта)
4. [Требования к окружению](#4-требования-к-окружению)
5. [Установка и настройка Backend](#5-установка-и-настройка-backend)
6. [Установка и настройка Frontend](#6-установка-и-настройка-frontend)
7. [Запуск приложения](#7-запуск-приложения)
8. [Переменные окружения](#8-переменные-окружения)
9. [API — эндпоинты](#9-api--эндпоинты)
10. [Функциональность](#10-функциональность)
11. [WebSocket-уведомления](#11-websocket-уведомления)
12. [Работа с базой данных](#12-работа-с-базой-данных)
13. [Администрирование](#13-администрирование)
14. [Тестирование](#14-тестирование)
15. [Статистика разработки](#15-статистика-разработки)

---

## 1. О проекте

**Hotel Complex** — веб-приложение для гостиничного комплекса, которое позволяет пользователю просматривать каталог номеров, выбирать подходящий вариант, оформлять бронирование, добавлять номера в избранное и оставлять отзывы.

Приложение состоит из двух частей:

- **Backend** — Django REST API, подключенный к готовой базе данных MySQL.
- **Frontend** — React SPA, которое получает данные через API и обновляет интерфейс без полной перезагрузки страницы.

Основная особенность проекта — работа с заранее созданной базой данных `hotel_db`. Таблицы были подготовлены в MySQL Workbench, а backend обращается к ним через SQL-запросы.

---

## 2. Технологический стек

### Backend

| Компонент | Технология |
|---|---|
| Язык | Python |
| Фреймворк | Django + Django REST Framework |
| Аутентификация | JWT (`djangorestframework-simplejwt`) |
| WebSocket | Django Channels + Daphne |
| База данных | MySQL |
| Работа с БД | SQL-запросы + Django connection |
| CORS | `django-cors-headers` |
| Изображения | Pillow |

### Frontend

| Компонент | Технология |
|---|---|
| Язык | JavaScript + JSX |
| Фреймворк | React |
| Сборщик | Vite |
| Маршрутизация | React Router |
| HTTP-клиент | Axios |
| Кэширование | TanStack React Query |
| Иконки | Lucide React |
| Real-time | WebSocket client |

---

## 3. Структура проекта

```text
kyrs/
├── back/                         # Backend Django
│   ├── .venv/                    # Виртуальное окружение Python
│   │
│   ├── config/                   # Конфигурация Django-проекта
│   │   ├── settings.py           # Основные настройки проекта
│   │   ├── urls.py               # Главные URL-маршруты
│   │   ├── asgi.py               # ASGI-приложение для HTTP и WebSocket
│   │   └── wsgi.py               # WSGI-приложение
│   │
│   ├── hotel/                    # Логика гостиничного комплекса
│   │   ├── migrations/
│   │   │   ├── 0001_initial.py
│   │   │   └── __init__.py
│   │   ├── __init__.py
│   │   ├── admin.py              # Регистрация моделей в админке
│   │   ├── apps.py               # Конфигурация приложения hotel
│   │   ├── consumers.py          # WebSocket consumer для отзывов
│   │   ├── models.py             # RoomCategory, Room, Booking, Review, Favorite
│   │   ├── routing.py            # WebSocket-маршруты приложения
│   │   ├── sql.py                # SQL-запросы к готовой базе MySQL
│   │   ├── tests.py              # Тесты приложения
│   │   ├── urls.py               # REST API маршруты hotel
│   │   └── views.py              # Представления REST API
│   │
│   └── users/                    # Приложение пользователей
│       ├── migrations/
│       │   ├── 0001_initial.py
│       │   └── __init__.py
│       ├── __init__.py
│       ├── admin.py              # Настройка пользователя в админке
│       ├── apps.py               # Конфигурация приложения users
│       ├── models.py             # Кастомная модель User
│       ├── serializers.py        # Сериализаторы регистрации, входа и профиля
│       ├── tests.py              # Тесты пользователей
│       ├── urls.py               # API маршруты auth/profile
│       └── views.py              # Регистрация, вход, профиль
│
├── front/                        # Frontend React + Vite
│   ├── .idea/                    # Настройки IDE
│   ├── node_modules/             # Установленные npm-зависимости
│   │
│   ├── public/
│   │   ├── media/
│   │   │   └── categories/        # Изображения категорий номеров
│   │   │       ├── comfort.jpg
│   │   │       ├── econom.jpg
│   │   │       ├── family.jpg
│   │   │       ├── lux.jpg
│   │   │       └── standard.jpg
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   ├── src/
│   │   ├── api/                  # Axios-запросы к backend API
│   │   ├── assets/               # Дополнительные ресурсы frontend
│   │   ├── pages/                # Страницы приложения
│   │   │   ├── AdminPage.jsx     # Административная страница
│   │   │   ├── BookingsPage.jsx  # Мои бронирования
│   │   │   ├── FavoritesPage.jsx # Избранные номера
│   │   │   ├── LoginPage.jsx     # Вход и регистрация
│   │   │   ├── ProfilePage.jsx   # Профиль пользователя
│   │   │   ├── RoomDetailPage.jsx# Детальная страница номера
│   │   │   └── RoomsPage.jsx     # Каталог номеров
│   │   │
│   │   ├── App.css
│   │   ├── App.jsx               # Главный компонент приложения
│   │   ├── index.css
│   │   ├── main.jsx              # Точка входа React
│   │   └── styles.css            # Основные стили интерфейса
│   │
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── vite.config.js
│
└── README.md
```

---

## 4. Требования к окружению

| Инструмент | Версия |
|---|---|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |
| MySQL | 8.0+ |
| Git | 2.40+ |

---

## 5. Установка и настройка Backend

### 5.1. Переход в папку backend

```bash
cd C:\доки\kyrs\back
```

### 5.2. Создание виртуального окружения

```bash
python -m venv .venv
```

Активация на Windows:

```bash
.venv\Scripts\activate
```

### 5.3. Установка зависимостей

```bash
pip install django
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install channels
pip install daphne
pip install pymysql
pip install python-dotenv
pip install pillow
```

Пример `requirements.txt`:

```text
django
djangorestframework
djangorestframework-simplejwt
django-cors-headers
channels
daphne
pymysql
python-dotenv
pillow
```

### 5.4. Настройка MySQL

Перед запуском backend должна быть создана база данных:

```sql
CREATE DATABASE IF NOT EXISTS hotel_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Основные таблицы проекта:

- `users_user`
- `hotel_roomcategory`
- `hotel_room`
- `hotel_booking`
- `hotel_review`
- `hotel_favorite`

### 5.5. Проверка Django

```bash
python manage.py check
```

### 5.6. Миграции служебных таблиц

Если служебные таблицы Django еще не созданы:

```bash
python manage.py migrate
```

Если бизнес-таблицы уже созданы вручную в MySQL, их не нужно пересоздавать миграциями.

### 5.7. Создание администратора

```bash
python manage.py createsuperuser
```

---

## 6. Установка и настройка Frontend

### 6.1. Переход в папку frontend

```bash
cd C:\доки\kyrs\front
```

### 6.2. Установка зависимостей

```bash
npm install
```

Если зависимости устанавливаются вручную:

```bash
npm install react-router-dom axios @tanstack/react-query lucide-react
```

### 6.3. Изображения номеров

Изображения категорий размещаются в папке:

```text
front/public/media/categories/
```

Примеры файлов:

```text
standard.jpg
comfort.jpg
lux.jpg
family.jpg
econom.jpg
```

В базе данных путь хранится в формате:

```text
categories/standard.jpg
```

На frontend он преобразуется в:

```text
/media/categories/standard.jpg
```

---

## 7. Запуск приложения

### Backend

```bash
cd C:\доки\kyrs\back
.venv\Scripts\activate
python manage.py runserver 8001
```

Backend будет доступен по адресу:

```text
http://127.0.0.1:8001/
```

Django Admin:

```text
http://127.0.0.1:8001/admin/
```

### Frontend

```bash
cd C:\доки\kyrs\front
npm run dev
```

Frontend будет доступен по адресу:

```text
http://localhost:5173/
```

---

## 8. Переменные окружения

### `back/.env`

```env
SECRET_KEY=django-insecure-your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=hotel_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=127.0.0.1
DB_PORT=3306

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### `front/.env`

```env
VITE_API_URL=http://127.0.0.1:8001/api
VITE_WS_URL=ws://127.0.0.1:8001
```

---

## 9. API — эндпоинты

### Аутентификация (`/api/auth/`)

| Метод | Эндпоинт | Доступ | Описание |
|---|---|---|---|
| POST | `/api/auth/register/` | Все | Регистрация пользователя |
| POST | `/api/auth/login/` | Все | Получение JWT access/refresh |
| POST | `/api/auth/token/refresh/` | Все | Обновление access-токена |
| GET | `/api/auth/profile/` | Авторизован | Получение профиля |
| PUT/PATCH | `/api/auth/profile/` | Авторизован | Обновление профиля |

### Категории номеров (`/api/hotel/categories/`)

| Метод | Эндпоинт | Доступ | Описание |
|---|---|---|---|
| GET | `/api/hotel/categories/` | Все | Список категорий |
| POST | `/api/hotel/categories/` | Администратор | Создать категорию |
| GET | `/api/hotel/categories/{id}/` | Все | Детали категории |
| PUT/PATCH | `/api/hotel/categories/{id}/` | Администратор | Изменить категорию |
| DELETE | `/api/hotel/categories/{id}/` | Администратор | Удалить категорию |

### Номера (`/api/hotel/rooms/`)

| Метод | Эндпоинт | Доступ | Описание |
|---|---|---|---|
| GET | `/api/hotel/rooms/` | Все | Каталог номеров |
| GET | `/api/hotel/rooms/?available=true` | Все | Только доступные номера |
| GET | `/api/hotel/rooms/?search=101` | Все | Поиск по номеру/описанию |
| GET | `/api/hotel/rooms/?category_id=1` | Все | Фильтр по категории |
| GET | `/api/hotel/rooms/?page=1&page_size=6` | Все | Пагинация |
| POST | `/api/hotel/rooms/` | Администратор | Создать номер |
| GET | `/api/hotel/rooms/{id}/` | Все | Детальная информация |
| PUT/PATCH | `/api/hotel/rooms/{id}/` | Администратор | Изменить номер |
| DELETE | `/api/hotel/rooms/{id}/` | Администратор | Удалить номер |

### Бронирования (`/api/hotel/bookings/`)

| Метод | Эндпоинт | Доступ | Описание |
|---|---|---|---|
| GET | `/api/hotel/bookings/` | Авторизован | Список своих бронирований |
| POST | `/api/hotel/bookings/` | Авторизован | Создать бронирование |
| GET | `/api/hotel/bookings/{id}/` | Авторизован | Детали бронирования |
| PATCH | `/api/hotel/bookings/{id}/` | Авторизован | Изменить статус |
| DELETE | `/api/hotel/bookings/{id}/` | Авторизован | Отменить бронирование |

Пример создания бронирования:

```json
{
  "room_id": 2,
  "check_in": "2026-07-01",
  "check_out": "2026-07-05"
}
```

### Избранное (`/api/hotel/favorites/`)

| Метод | Эндпоинт | Доступ | Описание |
|---|---|---|---|
| GET | `/api/hotel/favorites/` | Авторизован | Список избранных номеров |
| POST | `/api/hotel/favorites/` | Авторизован | Добавить номер |
| DELETE | `/api/hotel/favorites/{id}/` | Авторизован | Удалить из избранного |

Пример добавления:

```json
{
  "room_id": 2
}
```

### Отзывы (`/api/hotel/rooms/{room_id}/reviews/`)

| Метод | Эндпоинт | Доступ | Описание |
|---|---|---|---|
| GET | `/api/hotel/rooms/{room_id}/reviews/` | Все | Отзывы номера |
| POST | `/api/hotel/rooms/{room_id}/reviews/` | Авторизован | Добавить отзыв |
| PUT/PATCH | `/api/hotel/reviews/{id}/` | Авторизован | Изменить отзыв |
| DELETE | `/api/hotel/reviews/{id}/` | Авторизован | Удалить отзыв |

Пример отзыва:

```json
{
  "rating": 5,
  "text": "Отличный номер, чисто и удобно"
}
```

---

## 10. Функциональность

### Неавторизованный пользователь

- Просмотр каталога номеров
- Поиск по номеру, категории и описанию
- Фильтрация по категории
- Фильтрация только доступных номеров
- Пагинация каталога
- Просмотр подробной страницы номера
- Просмотр отзывов
- Переход на страницу входа и регистрации

### Авторизованный пользователь

- Все возможности гостя
- Создание бронирований
- Просмотр своих бронирований
- Отмена бронирований
- Добавление номеров в избранное
- Удаление номеров из избранного
- Добавление отзывов
- Редактирование профиля
- Получение real-time уведомлений о новых отзывах

### Администратор

- Управление категориями номеров
- Управление номерами
- Просмотр пользователей
- Контроль бронирований
- Работа через Django Admin и API

---

## 11. WebSocket-уведомления

WebSocket используется для уведомлений о новых отзывах.

URL подключения:

```text
ws://127.0.0.1:8001/ws/rooms/{room_id}/reviews/
```

Пример:

```text
ws://127.0.0.1:8001/ws/rooms/2/reviews/
```

Формат сообщения:

```json
{
  "type": "review_created",
  "review": {
    "id": 4,
    "rating": 5,
    "text": "Проверка WebSocket уведомления",
    "room_id": 2,
    "room_number": "102",
    "user_id": 3,
    "username": "ivan"
  }
}
```

Проверка в консоли браузера:

```js
const socket = new WebSocket('ws://127.0.0.1:8001/ws/rooms/2/reviews/');

socket.onopen = () => console.log('WebSocket connected');

socket.onmessage = (event) => {
  console.log('WebSocket message:', JSON.parse(event.data));
};

socket.onclose = (event) => {
  console.log('WebSocket closed:', event.code, event.reason);
};
```

---

## 12. Работа с базой данных

В проекте используется готовая база данных `hotel_db`, созданная в MySQL Workbench.

Основные таблицы:

| Таблица | Назначение |
|---|---|
| `users_user` | Пользователи |
| `hotel_roomcategory` | Категории номеров |
| `hotel_room` | Номера гостиницы |
| `hotel_booking` | Бронирования |
| `hotel_review` | Отзывы |
| `hotel_favorite` | Избранные номера |

Особенность реализации:

- Django подключается к готовой базе.
- Бизнес-таблицы не пересоздаются миграциями.
- Основные CRUD-операции выполняются через SQL-запросы.
- Для связей используются внешние ключи MySQL.
- Для поиска и фильтрации используются параметры API.

Пример SQL-запроса для получения номеров:

```sql
SELECT r.id, r.room_number, r.floor, r.has_ac, r.has_wifi,
       r.is_available, r.description,
       c.title AS category_title,
       c.price_per_night,
       c.capacity,
       c.image
FROM hotel_room r
JOIN hotel_roomcategory c ON r.category_id = c.id
WHERE r.is_available = 1
ORDER BY r.room_number;
```

---

## 13. Администрирование

Django Admin доступен по адресу:

```text
http://127.0.0.1:8001/admin/
```

Создание администратора:

```bash
python manage.py createsuperuser
```

Администратор может:

- добавлять категории номеров;
- изменять описание и цену категории;
- добавлять номера;
- менять доступность номера;
- просматривать пользователей;
- контролировать бронирования и отзывы.

---

## 14. Тестирование

### Проверка backend

```bash
cd C:\доки\kyrs\back
python manage.py check
python manage.py runserver 8001
```

### Проверка авторизации через PowerShell

```powershell
$response = Invoke-RestMethod `
  -Uri "http://127.0.0.1:8001/api/auth/login/" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"ivan","password":"ivan12345"}'

$access = $response.access
```

### Проверка защищенного API

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:8001/api/hotel/bookings/" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $access" }
```

### Проверенные сценарии

- Загрузка каталога номеров
- Фильтрация и поиск
- Регистрация и вход
- Получение JWT-токена
- Создание бронирования
- Отмена бронирования
- Добавление в избранное
- Удаление из избранного
- Добавление отзыва
- Получение WebSocket-уведомления

---

## 15. Статистика разработки

<img width="1200" height="256" alt="IsIt-Me&#39;s Commits" src="https://github.com/user-attachments/assets/60fb73f2-5e14-463e-9168-3afa15fc8ee7" />

---

Проект выполнен в рамках дисциплины «Технология разработки программного обеспечения».
