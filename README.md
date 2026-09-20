# Medha IQ — Bengali IQ Assessment Platform

Adaptive IQ assessment application with a FastAPI backend and React (Vite + TypeScript) frontend. Delivers questions in Bengali with timed sections, scoring algorithms, and an admin panel for question management.

## Architecture

```
medha_iq/
├── backend/
│   ├── main.py            FastAPI app entry point
│   ├── database.py        SQLAlchemy engine + session (SQLite)
│   ├── models.py          ORM models (questions, sessions, scores)
│   ├── schemas.py         Pydantic request/response schemas
│   ├── routers/
│   │   ├── assessment.py  Assessment session endpoints
│   │   └── admin.py       Question CRUD + analytics
│   ├── services/          Business logic (scoring, difficulty adjustment)
│   ├── scripts/           Data seeding and migration helpers
│   └── requirements.txt   Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.tsx        Root component + routing
│   │   ├── pages/         Assessment UI, results, admin dashboard
│   │   └── services/      API client layer
│   ├── package.json       Node dependencies (React, Vite)
│   └── vite.config.ts     Build configuration
└── iq_assessment.db       SQLite database (auto-created)
```

**Data flow**: React UI → REST API (FastAPI) → SQLAlchemy ORM → SQLite. Assessment sessions track per-question timing and adaptive difficulty scaling.

## Setup

### Backend

```powershell
cd medha_iq/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```powershell
cd medha_iq/frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**, backend on **http://localhost:8000**.

## Hardware Requirements

| Component | Minimum |
|-----------|---------|
| CPU | 2 cores |
| RAM | 4 GB |
| Disk | 500 MB |
| OS | Windows / macOS / Linux |
| Browser | Chrome, Edge, or Firefox (modern) |

## 🚧 Works to be Done / Future Roadmap

- [ ] **Newton-Raphson IRT Solver**: Upgrade the candidate theta estimator from a step-heuristic to exact Maximum Likelihood Estimation (MLE) with Newton-Raphson iteration.
- [ ] **Item Parameter Calibration (2PL/3PL)**: Implement discrimination ($a$) and pseudo-guessing ($c$) item parameters in question schemas.
- [ ] **PDF Score Card Generator**: Add a backend service to export signed PDF score certificates containing standard normal percentile curves.
- [ ] **Offline PWA Support**: Enable Service Worker offline assessment taking using IndexedDB for transient state storage.
- [ ] **Internationalization (i18n)**: Add toggleable Bengali / English localization across all assessment instructions and admin interfaces.
