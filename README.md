# GrowEasy AI CSV Importer

---

## 📖 Overview

An AI-powered CSV Importer that intelligently extracts CRM lead information from **any** valid CSV format — regardless of column names, layout, or structure.

Works with:
- Facebook Lead Exports
- Google Ads Exports
- Excel / manually created spreadsheets
- Real Estate CRM exports
- Sales reports & marketing agency CSVs

Built with:
- **Frontend:** Next.js 14 (App Router) + TypeScript + Vanilla CSS
- **Backend:** Node.js + Express
- **AI:** Groq API (`llama-3.1-8b-instant` — open-source LLM)
- **Deployment:** Vercel (frontend) + Render (backend)

---

## ✨ Features

| Feature | Status |
|---|---|
| Drag & Drop + File Picker upload | ✅ |
| Client-side CSV preview (no AI yet) | ✅ |
| Sticky headers + horizontal/vertical scroll tables | ✅ |
| 4-step guided flow (Upload → Preview → Confirm → Results) | ✅ |
| AI batch processing (15 rows/batch) | ✅ |
| Retry logic with exponential back-off (3 retries) | ✅ |
| Progress indicator during AI processing | ✅ |
| Imported / Skipped tabs with skip reasons | ✅ |
| Success rate dashboard | ✅ |
| CRM status badges (color-coded) | ✅ |
| Dark mode (full dark theme, blue accent) | ✅ |
| Fully responsive design | ✅ |
| Unit tests (Jest) — 9/9 passing | ✅ |
| Docker + Docker Compose | ✅ |
| Deployed on Vercel + Render | ✅ |

---

## 🏗️ Project Structure

```
GrowEasy/
├── frontend/                   # Next.js 14 app (Vercel)
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css     # Full design system (dark theme, blue palette)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx        # Main 4-step orchestrator
│   │   ├── components/
│   │   │   ├── UploadZone/     # Drag & Drop file picker
│   │   │   ├── PreviewTable/   # Raw CSV preview table
│   │   │   ├── ResultsTable/   # Imported/Skipped result tabs
│   │   │   ├── SummaryCard/    # Stats dashboard
│   │   │   └── StepIndicator/  # Progress step nav
│   │   ├── lib/
│   │   │   └── csvUtils.ts     # PapaParse + API call utilities
│   │   └── types/
│   │       └── index.ts        # TypeScript interfaces
│   ├── vercel.json
│   └── .gitignore
│
├── backend/                    # Express API (Render)
│   ├── src/
│   │   ├── app.js              # Express app + CORS config
│   │   ├── index.js            # Entry point
│   │   ├── routes/
│   │   │   └── import.routes.js    # POST /api/import
│   │   ├── controllers/
│   │   │   └── import.controller.js
│   │   ├── services/
│   │   │   ├── csv.service.js  # Stream-based CSV parser
│   │   │   └── ai.service.js   # Groq LLM + batching + retry
│   │   ├── utils/
│   │   │   └── helpers.js      # chunkArray, sleep
│   │   └── middleware/
│   │       └── error.middleware.js
│   ├── tests/
│   │   ├── helpers.test.js
│   │   └── csv.service.test.js
│   ├── Dockerfile
│   ├── .env.example
│   └── .gitignore
│
├── render.yaml                 # Render deployment config
├── docker-compose.yml          # Full-stack Docker setup
└── README.md
```

---

## 🤖 How the AI Works

1. The uploaded CSV is parsed into raw JSON objects (preserving original column names as-is)
2. Records are chunked into **batches of 15** to stay within LLM context limits
3. Each batch is sent to Groq (`llama3-70b-8192`) with a carefully engineered system prompt that:
   - Semantically maps any column name → CRM field (e.g. `"Phone Number"` → `mobile_without_country_code`)
   - Enforces strict enum values for `crm_status` and `data_source`
   - Moves extra emails/phones into `crm_note`
   - Skips records with no email AND no phone
   - Returns strict JSON — no markdown, no extra text
4. Failed batches are **retried up to 3 times** with exponential back-off
5. All batch results are merged and returned as a structured JSON response

---

## 📋 CRM Fields Extracted

| Field | Description |
|---|---|
| `created_at` | Lead creation date (JS `new Date()` compatible) |
| `name` | Full name |
| `email` | Primary email |
| `country_code` | Phone country code (e.g. `+91`) |
| `mobile_without_country_code` | Mobile digits only |
| `company` | Company name |
| `city` | City |
| `state` | State / Province |
| `country` | Country |
| `lead_owner` | Lead owner email or name |
| `crm_status` | `GOOD_LEAD_FOLLOW_UP` \| `DID_NOT_CONNECT` \| `BAD_LEAD` \| `SALE_DONE` |
| `crm_note` | Notes, extra contacts, remarks |
| `data_source` | `leads_on_demand` \| `meridian_tower` \| `eden_park` \| `varah_swamy` \| `sarjapur_plots` |
| `possession_time` | Property possession timeline |
| `description` | Additional description |

---

## 🚀 Local Setup

### Prerequisites
- Node.js ≥ 18
- Groq API key — get one free at [console.groq.com](https://console.groq.com)

### 1. Clone the repo
```bash
git clone https://github.com/rishii100/GrowEasy-AI-CSV-Importer.git
cd GrowEasy-AI-CSV-Importer
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Open .env and paste your GROQ_API_KEY
npm install
npm run dev
# Runs on http://localhost:8080
```

### 3. Frontend
```bash
cd frontend
# .env.local already has NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
npm install
npm run dev
# Runs on http://localhost:3000
```

### 4. Run Tests
```bash
cd backend
npm test
# 9 tests, 2 suites — all passing ✅
```

---

## 🐳 Docker (One-command setup)

```bash
# From the project root
GROQ_API_KEY=your_key_here docker compose up --build
```
- Frontend → http://localhost:3000
- Backend → http://localhost:8080

---

## 🌐 Deployment

| Service | Platform | Config File |
|---|---|---|
| Frontend | Vercel | `frontend/vercel.json` |
| Backend | Render | `render.yaml` |

### Backend env vars on Render

| Variable | Value |
|---|---|
| `GROQ_API_KEY` | Your Groq API key |
| `NODE_ENV` | `production` |
| `BATCH_SIZE` | `15` |
| `MAX_RETRIES` | `3` |

### Frontend env vars on Vercel

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `https://groweasy-ai-csv-importer-mcn6.onrender.com` |

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `GROQ_API_KEY` | Groq API key | _required_ |
| `PORT` | Server port | `8080` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | CORS allowed origins (comma-separated) | `http://localhost:3000` |
| `BATCH_SIZE` | Rows per AI batch | `15` |
| `MAX_RETRIES` | AI retry attempts | `3` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API base URL | `http://localhost:8080` |
