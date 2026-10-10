# NoorPath Backend

REST API for [NoorPath](https://github.com/), an all-in-one Islamic website. It handles accounts, bookmarks and a small admin dashboard. Quran, hadith, dua and prayer-time content is served by the frontend from public datasets, not by this API.

## Tech stack

- Node.js and Express 5
- MongoDB with Mongoose (MongoDB Atlas)
- JWT in an HttpOnly cookie, passwords hashed with bcrypt
- helmet, cors, express-rate-limit

## Requirements

- Node.js 18.11 or newer (developed on Node 22)
- A MongoDB database, for example a free MongoDB Atlas M0 cluster

## Setup

```bash
npm install
cp .env.example .env     # on Windows: copy .env.example .env
```

Fill in `.env`:

| Variable | Description |
|---|---|
| `PORT` | Port to listen on (default `5000`) |
| `MONGODB_URI` | MongoDB connection string, including the database name |
| `JWT_SECRET` | Long random secret, at least 32 characters |
| `CLIENT_URL` | Exact origin of the frontend, for CORS (for example `http://localhost:3000`) |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Never commit `.env`. It is listed in `.gitignore`.

## Run

```bash
npm run dev     # development, restarts on file changes
npm start       # production
```

Check it is running: `GET /api/health`

## API

All routes are under `/api`. Request and response bodies are JSON.

### Public

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Server and database status |
| POST | `/auth/register` | Create an account (`name`, `email`, `password`) |
| POST | `/auth/login` | Log in (`email`, `password`, optional `remember`), sets the cookie |
| POST | `/auth/logout` | Clear the cookie |

### Logged-in users

| Method | Route | Description |
|---|---|---|
| GET | `/auth/me` | Current user |
| GET | `/me/bookmarks` | List bookmarks (optional `?type=quran\|hadith\|dua`) |
| POST | `/me/bookmarks` | Add a bookmark (`type`, `target`, optional `label`) |
| DELETE | `/me/bookmarks?type=...&target=...` | Remove a bookmark |
| GET | `/me/last-read` | Last-read position in the Quran |
| PUT | `/me/last-read` | Save last-read position (`surah`, `ayah`) |

Bookmark `target` formats:

| Type | Format | Example |
|---|---|---|
| `quran` | `surah:ayah` | `2:255` |
| `hadith` | `book:chapter:number` | `bukhari:1:1` |
| `dua` | `category:section:id` | `travel:12:345` |

### Admin only

| Method | Route | Description |
|---|---|---|
| GET | `/admin/stats` | Aggregate statistics and a list of regular users |

The admin routes respond with `404 Not found` to anyone who is not an admin, so their existence is not revealed. Accounts get the `admin` role only by changing the `role` field directly in the database. It cannot be set through the API.

## Security notes

- Passwords are stored only as bcrypt hashes and are never returned by the API.
- The login cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` when `NODE_ENV=production`.
- Login and register are rate limited per IP (20 attempts per 15 minutes).
- Login returns the same error for an unknown email and a wrong password.
- CORS only allows the origin set in `CLIENT_URL`.
- Request bodies are limited to 100 KB.

## Project structure

```
src/
  config/        environment and database connection
  controllers/   request handlers
  middleware/    authentication and admin checks
  models/        Mongoose models (User, Bookmark)
  routes/        route definitions
  utils/         token and cookie helpers
  app.js         Express app
  server.js      entry point
```