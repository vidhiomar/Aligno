<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge&logo=render" />
<img src="https://img.shields.io/badge/Vercel-Frontend-black?style=for-the-badge&logo=vercel" />
<img src="https://img.shields.io/badge/FastAPI-Production-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss" />
</p>

<h1 align="center">🎯 Aligno : Performance Management Portal</h1>

<p align="center">
  <strong>Enterprise-grade goal setting, approvals, quarterly check-ins, and analytics.</strong><br/>
  <em>One portal for Employees · Managers · HR Admins</em>
</p>

<p align="center">
  🌐 Live Demo:
  <a href="https://aligno-zeta.vercel.app">Frontend</a> |
  <a href="https://aligno-pc76.onrender.com/docs">API Docs</a>
</p>

## 🖼️ Application Preview
### 🔐 Login Page
![Login](./public/LoginPagePhoto.png)

### 📊 Employee Dashboard
![Dashboard](./public/dashboard.png)

### 👩‍💼 Manager Review Panel
![Manager](./public/manager-review.png)

### 🛡️ Admin Analytics
![Analytics](./public/admin-analytics.png)

<p align="center">
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-user-roles--workflows">Workflows</a> ·
  <a href="#-api-reference">API Reference</a>
</p>

---

## ✨ Features

### Phase 1 — Goal Creation & Approval ✅
| Feature | Status |
|---------|--------|
| Employee goal sheet with Thrust Area, UoM (Numeric, %, Timeline, Zero-based), Targets & Weightage | ✅ |
| System-enforced validation: total weightage = 100%, min 10% per goal, max 8 goals | ✅ |
| Manager (L1) approval workflow with inline editing of targets / weightages | ✅ |
| Return for rework or reject with mandatory manager comments | ✅ |
| Approved goals lock automatically — no edits without Admin unlock | ✅ |
| Shared Goals: Admin/Manager push departmental KPIs to multiple employees | ✅ |

### Phase 2 — Achievement Tracking & Quarterly Check-ins ✅
| Feature | Status |
|---------|--------|
| Quarterly update interface for employees (Q1–Q4) | ✅ |
| Status per goal: Not Started / On Track / Completed | ✅ |
| Manager Check-in module with structured comments | ✅ |
| System-computed progress scores (Min, Max, Timeline, Zero-based formulas) | ✅ |

### Governance & Reporting ✅
| Feature | Status |
|---------|--------|
| Achievement Reports — exportable as CSV / Excel | ✅ |
| Completion Dashboard — real-time check-in completion rates | ✅ |
| Audit Trail — all post-lock goal changes logged (who, what, when) | ✅ |

### Bonus Features ✅
| Feature | Status |
|---------|--------|
| Cycle Management — configurable goal-setting and check-in windows | ✅ |
| User & Hierarchy Management — role assignment, manager mapping | ✅ |
| Goal Unlock Tool — admin can unlock approved goals with reason + audit | ✅ |
| Escalation Module — configurable rules, thresholds, and escalation chains | ✅ |
| Analytics Dashboard — QoQ trends, heatmaps, goal distribution, manager effectiveness | ✅ |

---

## 🏗 Architecture

### System Overview

```mermaid
graph TB
    subgraph Client["🖥️ Frontend — Next.js 16"]
        UI["React Pages & Components"]
        Store["Zustand Stores"]
        Svc["Service Layer (Axios)"]
        UI --> Store --> Svc
    end

    subgraph Server["⚙️ Backend — FastAPI"]
        API["API Routes"]
        BL["Service Layer"]
        Repo["Repositories"]
        DB[("SQLite DB")]
        API --> BL --> Repo --> DB
    end

    Svc -->|"REST / JWT"| API

    style Client fill:#EFF6FF,stroke:#3B82F6,stroke-width:2px
    style Server fill:#F0FDF4,stroke:#22C55E,stroke-width:2px
    style DB fill:#FFF7ED,stroke:#F97316,stroke-width:2px
```



## ☁️ Production Deployment

```mermaid
graph LR
    A["🌐 User Browser"] --> B["▲ Vercel Frontend"]
    B --> C["⚡ FastAPI Backend"]
    C --> D["🗄️ SQLite Database"]

    subgraph Cloud
        B
        C
        D
    end

    style B fill:#000,color:#fff
    style C fill:#009688,color:#fff
    style D fill:#003B57,color:#fff
```

## 🧠 Engineering Challenges Solved

During production deployment, several real-world engineering issues were solved:

- Configured CORS between Vercel frontend and Render backend
- Fixed environment variable injection for production APIs
- Solved FastAPI + Next.js payload mismatch issues
- Resolved frontend build failures on Vercel
- Fixed dependency resolution and deployment pipeline issues
- Implemented JWT authentication flow end-to-end
- Configured production-ready API communication
- Debugged 422, 404, and CORS deployment errors

This project demonstrates practical full-stack deployment and debugging experience beyond local development.

### Deployment Stack

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| API Docs | Swagger / OpenAPI |
| Database | SQLite |
| Authentication | JWT |

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS | App Router, SSR, responsive UI |
| **State** | Zustand | Lightweight, modular stores |
| **UI Library** | Radix UI + Lucide Icons | Accessible components + icon set |
| **Charts** | Custom SVG components | Lightweight, zero-dependency |
| **Backend** | FastAPI, SQLAlchemy 2.0 (async) | REST API with async ORM |
| **Auth** | JWT (Bearer tokens) | Stateless authentication |
| **Database** | SQLite (aiosqlite) | Local-first, zero-config |
| **Migrations** | Alembic | Schema version control |

### Folder Structure

```
Aligno/
├── frontend/
│   └── src/
│       ├── app/                    # Next.js routes & layouts
│       │   ├── login/              # Auth login page
│       │   ├── dashboard/          # Employee dashboard & analytics
│       │   │   ├── goals/          # Goal sheet creation & editing
│       │   │   ├── checkins/       # Quarterly achievement entry
│       │   │   ├── manager/        # Manager review & team check-ins
│       │   │   └── admin/          # Admin portal
│       │   │       ├── audit/      # Audit log viewer
│       │   │       ├── cycles/     # Cycle management
│       │   │       ├── users/      # User & hierarchy management
│       │   │       ├── unlock/     # Goal unlock tool
│       │   │       ├── reports/    # CSV / Excel export
│       │   │       ├── escalations/# Escalation rules & logs
│       │   │       └── analytics/  # Deep-dive analytics
│       │   ├── employee/           # Employee entry redirect
│       │   ├── manager/            # Manager entry redirect
│       │   └── admin/              # Admin entry redirect
│       ├── components/
│       │   ├── analytics/          # KPI cards, charts, heatmaps
│       │   ├── checkins/           # Achievement tables, review dialogs
│       │   ├── layout/             # Navbar, Sidebar, DashboardShell
│       │   ├── manager/            # Goal review table & dialog
│       │   └── ui/                 # Reusable UI primitives (Radix-based)
│       ├── services/               # API service clients
│       ├── store/                  # Zustand state stores
│       ├── styles/                 # Global CSS & design tokens
│       └── types/                  # TypeScript type definitions
│
├── backend/
│   └── app/
│       ├── api/v1/                 # API routes (auth, goals, manager, etc.)
│       ├── core/                   # Config, security, JWT
│       ├── db/                     # Async session & base model
│       ├── models/                 # SQLAlchemy ORM models
│       ├── repositories/           # Database query layer
│       ├── schemas/                # Pydantic request/response DTOs
│       ├── services/               # Business logic layer
│       └── utils/                  # Seed data & helpers
│
├── .env.example
├── package.json                    # Monorepo workspace config
└── README.md
```

---

## 👥 User Roles & Workflows

### Role Capabilities

```mermaid
graph LR
    subgraph Employee["🧑‍💼 Employee"]
        E1["Create Goals"]
        E2["Submit for Approval"]
        E3["Log Quarterly Actuals"]
        E4["View Locked Goals"]
    end

    subgraph Manager["👩‍💼 Manager (L1)"]
        M1["Review Team Goals"]
        M2["Inline Edit Targets"]
        M3["Approve / Rework / Reject"]
        M4["Conduct Check-ins"]
        M5["Push Shared KPIs"]
    end

    subgraph Admin["🛡️ Admin / HR"]
        A1["Configure Cycles"]
        A2["Manage User Hierarchy"]
        A3["Unlock Locked Goals"]
        A4["View Audit Logs"]
        A5["Export Reports"]
        A6["Manage Escalation Rules"]
        A7["Org-wide Analytics"]
    end

    style Employee fill:#DBEAFE,stroke:#3B82F6,stroke-width:2px
    style Manager fill:#F3E8FF,stroke:#8B5CF6,stroke-width:2px
    style Admin fill:#D1FAE5,stroke:#10B981,stroke-width:2px
```

### Goal Lifecycle Workflow

```mermaid
stateDiagram-v2
    [*] --> Draft : Employee creates goal
    Draft --> Submitted : Employee submits sheet
    Submitted --> Approved : Manager approves
    Submitted --> Rework : Manager returns for rework
    Submitted --> Rejected : Manager rejects
    Rework --> Draft : Employee revises
    Approved --> Locked : System auto-locks
    Locked --> Draft : Admin unlocks (audit logged)

    note right of Approved
        Goals are locked after approval.
        No edits without Admin intervention.
    end note
```

### Quarterly Check-in Flow

```mermaid
sequenceDiagram
    participant E as 👤 Employee
    participant S as 🖥️ System
    participant M as 👩‍💼 Manager

    Note over E,M: Quarterly Window Opens (Q1/Q2/Q3/Q4)

    E->>S: Log actual achievement value
    E->>S: Select status (Not Started / On Track / Completed)
    S->>S: Compute progress score using UoM formula
    S->>M: Notify manager of update
    M->>S: Review planned vs. actual
    M->>S: Add structured check-in comment
    S->>E: Check-in recorded ✅

    Note over E,M: Cycle repeats each quarter
```

### Escalation Flow

```mermaid
flowchart TD
    A["⏰ Cycle Opens"] --> B{"Employee submits within N days?"}
    B -->|Yes| C["✅ Normal Flow"]
    B -->|No| D["📧 Remind Employee"]
    D --> E{"Still no submission?"}
    E -->|Yes| F["📧 Escalate to Manager"]
    F --> G{"Still pending?"}
    G -->|Yes| H["📧 Escalate to HR"]
    H --> I["📋 Logged in Escalation Trail"]

    style A fill:#DBEAFE,stroke:#3B82F6
    style C fill:#D1FAE5,stroke:#10B981
    style I fill:#FEF3C7,stroke:#F59E0B
```

### Score Calculation Formulas

| UoM Type | Description | Formula | Example |
|----------|-------------|---------|---------|
| **Min (Numeric / %)** | Higher is better | `Achievement ÷ Target` | Sales Revenue |
| **Max (Numeric / %)** | Lower is better | `Target ÷ Achievement` | TAT, Cost |
| **Timeline** | Date-based completion | `Completion date vs. Deadline` | Project Deadline |
| **Zero-based** | Zero = Success | `If 0 → 100%, else 0%` | Safety Incidents |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **Git**

### 1. Clone & Install

```bash
git clone <repository-url>
cd GoalSync

# Frontend
npm install

# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
copy .env.example .env
copy frontend\.env.example frontend\.env.local
```

Default values work out-of-the-box for local development:

| Variable | Default Value |
|----------|--------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` |
| `DATABASE_URL` | `sqlite+aiosqlite:///./goalsync.db` |
| `JWT_SECRET_KEY` | `change-me-in-production` |

### 3. Setup Database

```bash
cd backend
alembic upgrade head
python -m app.utils.seed_demo
```

### 4. Start Servers

```bash
# Terminal 1 — Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2 — Frontend
npm run dev
```

### 5. Open in Browser

| URL | Purpose |
|-----|---------|
| `http://localhost:3000` | Aligno Portal |
| `http://localhost:8000/docs` | Swagger API Docs |

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 🧑‍💼 Employee | `employee@demo.com` | `Employee123` |
| 👩‍💼 Manager | `manager@demo.com` | `Manager123` |
| 🛡️ Admin | `admin@demo.com` | `Admin123` |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login → JWT tokens |
| `GET` | `/api/v1/auth/me` | Current user profile |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/goals` | Create a new goal |
| `GET` | `/api/v1/goals` | List my goals |
| `PATCH` | `/api/v1/goals/{id}` | Update a goal |
| `DELETE` | `/api/v1/goals/{id}` | Delete a draft goal |

### Manager Review
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/manager/goals` | All team goals |
| `GET` | `/api/v1/manager/goals/{employee_id}` | Goals for specific employee |
| `POST` | `/api/v1/manager/goals/{id}/approve` | Approve → lock goal |
| `POST` | `/api/v1/manager/goals/{id}/rework` | Return for rework |
| `POST` | `/api/v1/manager/goals/{id}/reject` | Reject goal |

### Check-ins & Achievements
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/achievements` | My achievements |
| `POST` | `/api/v1/achievements` | Submit quarterly update |
| `PUT` | `/api/v1/achievements/{id}` | Edit achievement |
| `GET` | `/api/v1/checkins/team` | Team progress (manager) |
| `POST` | `/api/v1/checkins/{id}` | Add check-in comment |

### Analytics & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/analytics/me` | My performance analytics |
| `GET` | `/api/v1/analytics/team` | Team analytics (manager) |
| `GET` | `/api/v1/analytics/org` | Org-wide analytics (admin) |
| `GET` | `/api/v1/reports/export?format=csv` | Export report as CSV |
| `GET` | `/api/v1/reports/export?format=xlsx` | Export report as Excel |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/admin/users` | List all users |
| `PATCH` | `/api/v1/admin/users/{id}` | Update user role/manager |
| `GET` | `/api/v1/admin/audit-logs` | View audit trail |
| `GET` | `/api/v1/admin/locked-goals` | List locked goals |
| `POST` | `/api/v1/admin/goals/{id}/unlock` | Unlock a goal |
| `GET` | `/api/v1/admin/cycles` | Get cycle config |
| `PATCH` | `/api/v1/admin/cycles/{id}` | Update cycle dates/status |
| `GET` | `/api/v1/admin/escalation-rules` | List escalation rules |
| `PATCH` | `/api/v1/admin/escalation-rules/{id}` | Update rule threshold |
| `GET` | `/api/v1/admin/escalation-logs` | View escalation log |

---

## 🔧 Development Commands

```bash
# Frontend
npm run dev                          # Dev server (port 3000)
npm run build                        # Production build
npm run lint --workspace frontend    # ESLint
npm run typecheck --workspace frontend # TypeScript check

# Backend
uvicorn app.main:app --reload        # Dev server (port 8000)
alembic upgrade head                 # Run migrations
python -m app.utils.seed_demo        # Seed demo data
python -m compileall backend\app     # Syntax check
```

---

## 🔒 Validation Rules

The system enforces the following business rules at both UI and API levels:

- ✅ **Total weightage** across all goals must equal **100%**
- ✅ **Minimum weightage** per individual goal: **10%**
- ✅ **Maximum goals** per employee: **8**
- ✅ Approved goals are **automatically locked** — no further edits without Admin unlock
- ✅ Manager comment is **mandatory** for rework and rejection actions
- ✅ Locked goals cannot be updated or deleted via API


---



## 📄 License

Aligno is a full-stack enterprise performance management platform designed to streamline goal setting, approvals, quarterly reviews, and organizational analytics.
