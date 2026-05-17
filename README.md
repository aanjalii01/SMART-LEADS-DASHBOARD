# 🚀 Smart Leads Dashboard


> A full-stack **Lead Management Dashboard** built with the MERN stack (MongoDB, Express, React, Node.js) using TypeScript throughout — featuring JWT auth, RBAC, advanced filtering, pagination, CSV export, and dark mode.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 JWT Authentication | Register, Login, Protected routes, bcrypt hashing |
| 👥 Role-Based Access Control | `admin` sees all leads; `sales` sees only own leads |
| 📋 Lead CRUD | Create, Read, Update, Delete with validation |
| 🔍 Advanced Filtering | Filter by Status, Source, search by Name/Email, sort Latest/Oldest |
| 🔎 Debounced Search | 400ms debounce to reduce API calls |
| 📄 Backend Pagination | 10 records/page with full metadata |
| 📊 Stats Dashboard | Per-status and per-source counts |
| 📥 CSV Export | Export filtered leads as `.csv` |
| 🌙 Dark Mode | System preference + manual toggle, persisted in localStorage |
| 🐳 Docker | Full Docker + Docker Compose setup for one-command startup |

---

## 🗂 Project Structure

```
smart-leads-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/        # Database connection
│   │   ├── controllers/   # authController, leadsController
│   │   ├── middleware/     # auth, errorHandler, validate
│   │   ├── models/        # User, Lead (Mongoose)
│   │   ├── routes/        # authRoutes, leadsRoutes
│   │   ├── types/         # All TypeScript interfaces & types
│   │   └── index.ts       # Express app entry point
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/        # Button, Input, Select, Modal, Spinner, Pagination, StatusBadge
│   │   │   ├── leads/     # LeadCard, LeadForm, FilterBar, StatsCards
│   │   │   └── layout/    # Navbar, ProtectedRoute
│   │   ├── hooks/         # useLeads, useDebounce, useDarkMode
│   │   ├── pages/         # LoginPage, RegisterPage, DashboardPage
│   │   ├── services/      # api (axios), authService, leadsService
│   │   ├── store/         # Zustand authStore
│   │   ├── types/         # Shared TypeScript types
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
├── docker-compose.dev.yml
└── README.md
```

---

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js** (TypeScript)
- **MongoDB** + **Mongoose**
- **JWT** (`jsonwebtoken`) + **bcryptjs**
- **express-validator** for input validation
- **json2csv** for CSV export

### Frontend
- **React 18** + **TypeScript**
- **TailwindCSS** for styling
- **@tanstack/react-query** for server state
- **Zustand** for client auth state
- **Axios** for HTTP
- **react-router-dom** v6 for routing
- **react-hot-toast** for notifications
- **lucide-react** for icons

---

## 🚀 Quick Start

### Option 1 — Docker (Recommended)

```bash
# Clone the repo
git clone https://github.com/anjalisinha/smart-leads-dashboard.git
cd smart-leads-dashboard

# Start all services
docker compose up --build

# App runs at:
# Frontend → http://localhost
# Backend  → http://localhost:5000
# MongoDB  → localhost:27017
```

### Option 2 — Local Development

**Prerequisites:** Node.js ≥ 18, MongoDB running locally

#### Backend

```bash
cd backend
cp .env.example .env       # Edit values as needed
npm install
npm run dev                # Runs on http://localhost:5000
```

#### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # Runs on http://localhost:3000
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smart-leads?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

> **Note:** Replace `<username>`, `<password>`, and `cluster0.xxxxx` with your actual MongoDB Atlas credentials. If your password contains special characters like `@`, encode them — e.g. `@` becomes `%40`.

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔑 Default Demo Credentials

Register a new account via `/register` and choose **Admin** role to see all leads.

---

## 📡 API Reference

See [`API_DOCS.md`](./API_DOCS.md) for full documentation.

### Base URL
```
http://localhost:5000/api
```

### Auth Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login |
| GET | `/auth/me` | ✅ | Get current user |

### Leads Endpoints
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/leads` | ✅ | admin, sales | List leads with filters & pagination |
| GET | `/leads/:id` | ✅ | admin, sales | Get single lead |
| POST | `/leads` | ✅ | admin, sales | Create lead |
| PUT | `/leads/:id` | ✅ | admin, sales | Update lead |
| DELETE | `/leads/:id` | ✅ | admin, sales | Delete lead |
| GET | `/leads/stats` | ✅ | admin, sales | Aggregated stats |
| GET | `/leads/export` | ✅ | admin, sales | Download CSV |

---

## 📊 Lead Schema

```typescript
{
  name:      string           // required, min 2 chars
  email:     string           // required, valid email
  status:    'New' | 'Contacted' | 'Qualified' | 'Lost'
  source:    'Website' | 'Instagram' | 'Referral'
  notes:     string           // optional, max 1000 chars
  createdBy: ObjectId (ref User)
  createdAt: Date
  updatedAt: Date
}
```

---

## 🐳 Docker Notes

```bash
# Production
docker compose up --build -d

# Development (with hot reload)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Tear down
docker compose down -v
```

---

## 🧪 Code Quality Notes

- All TypeScript — zero `any` usage
- Interfaces defined for every model, request body, and API response
- Centralized error handling middleware
- Mongoose indexes on `status`, `source`, `createdAt`, and text fields
- Debounced search (400ms) to reduce unnecessary API calls
- React Query for caching, background refetch, and optimistic states
- Zustand for minimal, predictable auth state
- Role-based data scoping: sales users only touch their own leads

---

## 📬 Submission

**Name:** Anjali Sinha  
**Email:** ritik.yadav@servicehive.tech  
**Subject:** `MERN Internship Assignment Submission - Anjali Sinha`