# Legacy Data Extractor AI (Full Stack)

This contains everything you need to run your app locally with a backend API and MongoDB.

## Stack
- Client: Vite + React + TypeScript
- Server: Express + TypeScript + Mongoose
- Database: MongoDB (`mongodb://localhost:27017/legacy-data-extractor-ai`)

## Run Locally

**Prerequisites:** Node.js 18+, MongoDB accessible on port `27018`.

1. Install both:
   `npm run install:all`
2. Configure client AI (optional):
   - No API key required. By default the app uses an offline parser.
   - To enable online AI, set `USE_AI=true`  in `frontend/.env.local`.
3. Configure server env (already seeded):
   - `backend/.env` has `MONGODB_URI`, `PORT`, and `JWT_SECRET` (edit to a secure value)
4. Start the backend API:
   `npm run dev:back`
5. Start the frontend:
   `npm run dev:front`
6. Or start both:
   `npm run dev:full`

The client proxies API requests from `/api` to `http://localhost:5000`.
MongoDB example start:
`mongod --port 27018 --dbpath .\\backend\\data27017`

## Authentication & Storage
- Register and login with email/password (6+ chars). JWT token is stored in `sessionStorage` as `authToken`.
- Extraction history is stored per user in MongoDB and loaded in the dashboard.

## Security
- Backend includes Helmet, rate limiting, request logging, and MongoDB input sanitization.
- Database connection uses retry logic to handle temporary outages without crashing.
