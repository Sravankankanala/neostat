# NeoConnect – Staff Feedback & Complaint Management

NeoConnect is a full‑stack platform for staff feedback, complaints, polls, and analytics. It is built as a small monorepo:

- `server` – Node.js + Express + MongoDB API (JWT auth, role based access)
- `web` – Next.js app router frontend (React + Tailwind CSS)

## Tech Stack

- **Frontend**: Next.js 16 (app router), React, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT authentication

## Getting started

### 1. Prerequisites

- Node.js 20+
- npm
- MongoDB running locally (e.g. `mongodb://localhost:27017`)

### 2. Configure environment

From the repo root:

1. Copy `.env.example` to `.env` and adjust values if needed.
2. The same `.env` file is used by both the API (`server`) and the frontend (`web`) during local development.

```bash
cp .env.example .env
```

Key variables:

- `MONGO_URI` – connection string to MongoDB
- `JWT_SECRET` – secret key for signing JWTs
- `PORT` – API port (default `4000`)
- `CLIENT_ORIGIN` – frontend origin (default `http://localhost:3000`)
- `NEXT_PUBLIC_API_URL` – base URL the frontend uses to call the API (default `http://localhost:4000`)

### 3. Install dependencies

```bash
cd server
npm install

cd ../web
npm install
```

### 4. Run the API

```bash
cd server
npm run dev
```

The API will start on `http://localhost:4000` and expose routes such as:

- `POST /auth/login` – login and receive JWT
- `GET /auth/me` – current user details
- `POST /cases` – submit a new case (staff)
- `GET /cases/my` – staff submissions
- `GET /cases/inbox` – Secretariat inbox
- `GET /cases/assigned` – Case Manager assigned cases
- `POST /cases/assign` – assign a case (Secretariat/Admin)
- `POST /cases/update` – update case status and impact fields
- `POST /polls` – create poll (Secretariat/Admin)
- `POST /polls/vote` – staff vote once per poll
- `POST /minutes` – upload meeting minutes (Secretariat/Admin)
- `GET /public/digest` – quarterly digest
- `GET /public/impact` – impact tracker
- `GET /public/minutes` – public minutes archive
- `GET /analytics/summary` – analytics dashboard (Secretariat/Admin)

### 5. Run the frontend

In a separate terminal:

```bash
cd web
npm run dev
```

The app will be available at `http://localhost:3000`.

- Root `/` – NeoConnect landing, links to public hub pages
- `/login` – email/password login (JWT stored in `localStorage`)
- `/dashboard` – role‑aware dashboard (Staff, Secretariat, Case Manager, Admin)
- `/cases/new` – staff submission form (with anonymous toggle and file upload)
- `/hub/digest` – quarterly digest page
- `/hub/impact` – impact tracker
- `/hub/minutes` – public minutes archive

### 6. User roles

The system supports four roles:

- **STAFF** – submit feedback/complaints (optionally anonymous), vote in polls, view public hub
- **SECRETARIAT** – see all cases, assign to Case Managers, create polls, upload minutes, view analytics
- **CASE_MANAGER** – view and update assigned cases, add notes, close cases
- **ADMIN** – manage user accounts and has Secretariat privileges via the API

To create initial users, call `POST /auth/register` with an **ADMIN** token or seed users manually in MongoDB.

### 7. Escalation rule

The backend runs a cron job that checks daily for cases that:

- Have been **ASSIGNED/IN_PROGRESS/PENDING** for 7+ days, and
- Have not already been escalated.

Matching cases are marked as `ESCALATED` and a history entry is recorded.

