# EmpAI — AI-Based Employee Performance Analytics System

A production-ready, MERN-stack employee performance tracking and analytics platform. Built with React, Node.js, Express, MongoDB, and OpenRouter AI.

## 🚀 Features

- **Employee Management** — Full CRUD with search, department filtering, and pagination.
- **Algorithmic Evaluation** — Calculate employee performance based on required skills and historical scores.
- **AI Performance Insights** — OpenRouter (GPT-3.5) integration for promotion recommendations, skill gap analysis, and actionable feedback generation.
- **Saved Evaluations** — Save and manage AI performance reports.
- **Analytics Dashboard** — Department distribution, experience breakdowns, and top performers visualization via Recharts.
- **Secure Authentication** — JWT and bcrypt-based role management for HR/Admin users.

## 🛠 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS v4, Framer Motion, Axios, Recharts, React Hot Toast
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
- **AI Integration:** OpenRouter API (GPT-3.5-Turbo)
- **Deployment:** Render (Backend), Vercel (Frontend)

## 📂 Project Structure

```
FSD_ESE/
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Dashboard, EmployeeList, AIPerformance, etc.
│   │   └── services/           # Axios API integrations
├── server/                     # Express/Node.js Backend
│   ├── controllers/            # Auth, Employee, AI, Evaluation, Dashboard
│   ├── models/                 # User, Employee, Evaluation schemas
│   ├── routes/                 # Express routers
│   └── services/               # Algorithmic scoring and OpenRouter integration
└── project_documentation.md    # Detailed exam report
```

## 🔌 API Endpoints

### Employees
- `POST /api/employees` — Create employee
- `GET /api/employees` — List (search, filter, paginate)
- `GET /api/employees/:id` — Get single employee
- `PUT /api/employees/:id` — Update employee metrics
- `DELETE /api/employees/:id` — Delete employee

### AI & Analytics
- `POST /api/ai` — Algorithmic skill and performance matching
- `POST /api/ai/recommend` — AI-powered performance analysis & ranking
- `POST /api/ai/feedback` — Generate actionable training feedback

### Evaluations
- `POST /api/evaluations` — Save evaluation report
- `GET /api/evaluations` — Get all saved reports
- `GET /api/evaluations/:id` — Get single report
- `DELETE /api/evaluations/:id` — Delete report

## ⚙️ Local Development Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd FSD_ESE
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create `server/.env`:
```env
PORT=5001
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0...
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_api_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
Start backend: `npm run dev`

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create `client/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```
Start frontend: `npm run dev`
