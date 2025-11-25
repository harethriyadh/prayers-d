# Prayers API (server)

A small Express + SQLite backend providing a simple REST API for the prayers SPA.

Features
- GET /api/prayers - return all stored prayer data
- GET /api/prayers/:dateKey - return prayer statuses for a date (YYYY-MM-DD)
- POST /api/prayers - upsert a single prayer status
- POST /api/prayers/batch - retrieve multiple dates in one call
- DELETE /api/prayers/:dateKey - optional helper to delete a day's data

Requirements
- Node.js >= 18

Quick start

1. Install dependencies

```bash
cd server
npm install
```

2. Run in development (auto-restart)

```bash
npm run dev
```

3. Start for production

```bash
npm start
```

Server listens on port defined by env `SERVER_PORT` (default 3000). The API base is `/api/prayers` so during frontend development set `VITE_API_URL=http://localhost:3000/api`.

Database (MongoDB)

This server uses MongoDB as its primary data store. Configure your MongoDB connection by setting the `MONGO_URL` environment variable. Example (do NOT commit credentials):

```bash
export MONGO_URL="mongodb+srv://prayer:tozNnlcrgsiuLOFW@cluster0.6cpzc.mongodb.net/?appName=Cluster0"
export MONGO_DB=prayers_db
```

If `MONGO_URL` is not set, the server will raise an error on first request that requires DB access. For local development you can use a free MongoDB Atlas cluster or a local MongoDB instance.

Run tests

The integration tests use an in-memory MongoDB (`mongodb-memory-server`) where possible. In some environments (CI or minimal containers) the in-memory server may fail to start due to missing native system libraries (e.g. `libcrypto`). When that happens you can run the tests against a real MongoDB instance by setting `MONGO_URL`.

Run tests using an external MongoDB (example):

```bash
export MONGO_URL="mongodb+srv://..."
npm test
```

Or run normally (attempts to use in-memory MongoDB first):

```bash
npm test
```

Docker

Build and run the image:

```bash
docker build -t prayers-server .
docker run -p 3000:3000 -e SERVER_PORT=3000 prayers-server
```

Examples (curl)

Save a prayer status (upsert)

```bash
curl -X POST http://localhost:3000/api/prayers \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-11-24","prayer":"الفجر","status":1}'
```

Get a single date

```bash
curl http://localhost:3000/api/prayers/2025-11-24
```

Get many dates

```bash
curl -X POST http://localhost:3000/api/prayers/batch \
  -H "Content-Type: application/json" \
  -d '{"dates": ["2025-11-24","2025-11-23"]}'
```

Get all

```bash
curl http://localhost:3000/api/prayers
```

Notes & security
- Body size limited to 10kb.
- Input validated with `zod` returning 400 on invalid payloads.
- CORS enabled to allow frontend dev server access.
- For production, configure `SQLITE_FILE` to a persistent path and set `NODE_ENV=production` to avoid stack traces.

Next steps
- Add rate limiting (express-rate-limit) for production.
- Add more extensive tests and lints (ESLint/Prettier).

