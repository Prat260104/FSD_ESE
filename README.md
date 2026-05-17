# HireAI — Candidate Profile Shortlisting System

AI-powered candidate shortlisting platform built with React, Node.js, Express, MongoDB, and OpenRouter AI.

## 🚀 Features

- **JWT Authentication** — Secure login/register with token-based auth
- **Candidate Management** — Full CRUD with search, filter, and pagination
- **Smart Matching** — Algorithm-based skill overlap and experience scoring
- **AI Shortlisting** — OpenRouter AI-powered candidate analysis and ranking
- **AI Interview Questions** — Auto-generated tailored interview questions
- **Saved Shortlists** — Save and manage match results
- **PDF Export** — Export shortlist reports as PDF
- **Dashboard Analytics** — Charts for skill distribution and experience breakdown
- **Dark/Light Mode** — System-aware theme with manual toggle
- **Glassmorphism UI** — Professional frosted-glass design with Framer Motion animations

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React, Vite, Tailwind CSS v4        |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB with Mongoose               |
| AI         | OpenRouter API                      |
| Charts     | Recharts                            |
| Animations | Framer Motion                       |
| Auth       | JWT (jsonwebtoken + bcryptjs)        |
| PDF        | jsPDF + jspdf-autotable             |

## 📁 Project Structure

```
FSD_ESE/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/         # Sidebar, Navbar, Layout
│   │   ├── context/            # Auth, Theme contexts
│   │   ├── pages/              # All 9 pages
│   │   ├── services/           # API + data services
│   │   └── index.css           # Design system
│   └── vite.config.js
├── server/                     # Express Backend
│   ├── config/                 # DB connection
│   ├── controllers/            # Auth, Candidate, Match, Shortlist, Dashboard
│   ├── middleware/             # Auth, Validation, Error handling
│   ├── models/                 # User, Candidate, Shortlist schemas
│   ├── routes/                 # API route definitions
│   ├── services/               # Matching engine, AI service
│   └── index.js
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login user
- `GET /api/auth/me` — Get current profile

### Candidates
- `POST /api/candidates` — Create candidate
- `GET /api/candidates` — List (search, filter, paginate)
- `GET /api/candidates/:id` — Get single
- `PUT /api/candidates/:id` — Update
- `DELETE /api/candidates/:id` — Delete

### Matching
- `POST /api/match` — Algorithm-based matching
- `POST /api/match/ai/shortlist` — AI-powered shortlisting
- `POST /api/match/ai/interview-questions` — Generate interview questions

### Shortlists
- `POST /api/shortlists` — Save shortlist
- `GET /api/shortlists` — Get all shortlists
- `GET /api/shortlists/:id` — Get single shortlist
- `DELETE /api/shortlists/:id` — Delete shortlist

### Dashboard
- `GET /api/dashboard/stats` — Dashboard statistics

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- OpenRouter API key

### 1. Clone and setup

```bash
cd FSD_ESE
```

### 2. Configure environment

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.qdvakns.mongodb.net/candidate-shortlisting
JWT_SECRET=your_secret_key
OPENROUTER_API_KEY=your_openrouter_key
CLIENT_URL=http://localhost:5173
```

### 3. Start backend

```bash
cd server
npm install
npm run dev
```

### 4. Start frontend (new terminal)

```bash
cd client
npm install
npm run dev
```

### 5. Open browser

Visit `http://localhost:5173`

## 🚢 Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set root directory to `server`
4. Build command: `npm install`
5. Start command: `node index.js`
6. Add environment variables in Render dashboard

### Frontend (Vercel)
1. Import project on Vercel
2. Set root directory to `client`
3. Framework preset: Vite
4. Add environment variable: `VITE_API_URL=https://your-render-backend.onrender.com/api`

### Database (MongoDB Atlas)
1. Create free cluster at mongodb.com
2. Create database user
3. Whitelist IPs (0.0.0.0/0 for Render)
4. Get connection string and add to backend env

## 📋 Environment Variables

| Variable           | Location | Description                   |
|--------------------|----------|-------------------------------|
| `PORT`             | Server   | Server port (default: 5000)   |
| `MONGODB_URI`      | Server   | MongoDB connection string     |
| `JWT_SECRET`       | Server   | JWT signing secret            |
| `OPENROUTER_API_KEY` | Server | OpenRouter API key            |
| `CLIENT_URL`       | Server   | Frontend URL for CORS         |
| `VITE_API_URL`     | Client   | Backend API base URL          |

## 📄 License

MIT
