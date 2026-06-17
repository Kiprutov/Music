# 🎵 Music App

A full-stack music streaming web application built with Vue 2 and Node.js/Express.

> **Note:** This project was originally built in 2019 and has been updated to complete the missing features. The stack is intentionally kept on its original versions (Vue 2, Vuetify 1.x, Sequelize 5) — no breaking upgrades applied.

## Features

- 🔐 User registration and login (JWT authentication)
- 🎶 Browse songs list
- ▶️ Audio player with play/pause, next/prev, seek, and volume controls
- ➕ Add songs (logged-in users only)
- 🗑️ Delete songs (logged-in users only)
- 💾 SQLite database (no setup required)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 2, Vuetify 1.x, Vuex, Vue Router, Axios |
| Backend | Node.js, Express 4, Sequelize 5, SQLite3 |
| Auth | JWT (jsonwebtoken), bcrypt |

## Project Structure

```
Music/
├── client/         # Vue 2 frontend
│   └── src/
│       ├── components/   # Header, Login, Register, Songs, Panel
│       ├── services/     # Api, AuthenticationService, SongService
│       ├── store/        # Vuex store (auth state)
│       └── router/       # Vue Router
└── server/         # Express backend
    └── src/
        ├── controllers/  # AuthenticationController, SongController
        ├── models/       # User, Song (Sequelize/SQLite)
        ├── policies/     # Validation middleware
        └── routes.js     # API routes
```

## Getting Started

### Requirements

- Node.js >= 6.0.0
- npm >= 3.0.0

### 1. Start the backend

```bash
cd server
npm install
npm start
# Runs on http://localhost:8081
```

### 2. Start the frontend

```bash
cd client
npm install
npm start
# Runs on http://localhost:8080
```

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/register` | Register a new user | No |
| POST | `/login` | Login and get JWT token | No |
| GET | `/songs` | List all songs | No |
| POST | `/songs` | Add a new song | No* |
| GET | `/songs/:id` | Get a single song | No |
| DELETE | `/songs/:id` | Delete a song | No* |

> *Authentication middleware can be added to POST/DELETE routes as a future improvement.

## Adding Songs

Songs are added via the UI (when logged in) or directly via the API:

```json
POST /songs
{
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "url": "https://example.com/song.mp3",
  "coverUrl": "https://example.com/cover.jpg"
}
```

The `url` field should be a publicly accessible `.mp3` or audio file URL.

## Bugs Fixed (2024 update)

- ✅ Login endpoint was not returning the JWT token after successful authentication
- ✅ Logout in Header component was calling `this.route.dispatch` instead of `this.$store.dispatch` (crashed on logout)
- ✅ `Songs.vue` was an empty placeholder — now a full working music player
- ✅ Song model and CRUD API routes added

## Roadmap / Future Improvements

- [ ] File upload support (upload mp3 directly instead of URL)
- [ ] Protect add/delete routes with JWT middleware
- [ ] Search and filter songs
- [ ] Playlists
- [ ] Migrate to Vue 3 + Vuetify 3
