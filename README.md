# Task Manager

Role-based task manager with a FastAPI backend and Vite React frontend.

## Local Setup

Backend:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
npm install
npm run dev
```

Create `.env` from `.env.example`. For local development, keep:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=task_manager
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:5173
```

## Workflow

1. Signup as an `admin`.
2. Signup member accounts.
3. Login as admin and create a project.
4. Open Tasks, choose a project and member, then allocate a task.
5. Login as the member to see the task on the member dashboard.

## Deploy Backend To Railway

Railway will use the existing `Procfile`:

```Procfile
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Set these Railway variables:

```env
MONGO_URI=your-mongodb-atlas-uri
MONGO_DB_NAME=task_manager
JWT_SECRET=your-long-random-production-secret
JWT_EXPIRE_HOURS=24
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

After Railway deploys, copy the public backend URL.

## Deploy Frontend To Vercel

Set the Vercel project root to this repository root.

Build settings:

```text
Build command: npm run build
Output directory: dist
Install command: npm install
```

Set this Vercel variable:

```env
VITE_API_BASE_URL=https://your-railway-backend.up.railway.app
```

Redeploy after changing environment variables.
