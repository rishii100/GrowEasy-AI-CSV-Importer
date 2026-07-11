# GrowEasy AI CSV Importer

**Position Applied For:** Software Developer Intern  
**Live Demo:** _coming soon after deployment_  
**GitHub:** _your-repo-url_

---

## 📖 Overview

An AI-powered CSV Importer that intelligently extracts CRM lead information from **any** valid CSV format — regardless of column names, layout, or structure.

Built with:
- **Frontend:** Next.js 14 (App Router) + TypeScript + Vanilla CSS
- **Backend:** Node.js + Express
- **AI:** Groq API (`llama3-70b-8192` — open-source LLM)

---

## 🏗️ Architecture

```
GrowEasy/
├── frontend/          # Next.js app (port 3000)
│   ├── src/
│   │   ├── app/       # Routes & global styles
│   │   ├── components/
│   │   │   ├── UploadZone/      # Drag & Drop
│   │   │   ├── PreviewTable/    # Raw CSV preview
│   │   │   ├── ResultsTable/    # Imported/Skipped tabs
│   │   │   ├── SummaryCard/     # Stats dashboard
│   │   │   └── StepIndicator/  # Progress steps
│   │   ├── lib/       # CSV parsing + API utilities
│   │   └── types/     # TypeScript interfaces
│
├── backend/           # Express API (port 5000)
│   ├── src/
│   │   ├── routes/    # POST /api/import
│   │   ├── controllers/
│   │   ├── services/  # csv.service + ai.service
│   │   ├── utils/     # chunkArray, sleep
│   │   └── middleware/
│   └── tests/         # Jest unit tests
│
└── docker-compose.yml
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js ≥ 18
- Groq API key ([get one free](https://console.groq.com))

### 1. Clone the repo
```bash
git clone <repo-url>
cd GrowEasy
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env and paste your GROQ_API_KEY
npm install
npm run dev       # Starts on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
# .env.local already contains NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
npm install
npm run dev       # Starts on http://localhost:3000
```

### 4. Run Tests
```bash
cd backend
npm test
```

---

## 🐳 Docker (One-command start)

```bash
# From the project root
GROQ_API_KEY=your_key_here docker compose up --build
```
Visit http://localhost:3000

---

## 🤖 How the AI Works

1. The CSV is parsed into raw JSON objects (preserving original column names).
2. Records are sent in **batches of 15** to the Groq LLM.
3. A carefully engineered **system prompt** instructs the model to:
   - Map any column name → CRM field using semantic understanding
   - Enforce enum constraints on `crm_status` and `data_source`
   - Move extra contact details to `crm_note`
   - Skip records with no email AND no phone
   - Return strict JSON — no markdown, no prose
4. Failed batches are **retried up to 3 times** with exponential back-off.
5. Results are aggregated and returned as a structured JSON response.

---

## 📋 CRM Fields Extracted

| Field | Description |
|---|---|
| `created_at` | Lead creation date |
| `name` | Lead name |
| `email` | Primary email |
| `country_code` | Phone country code |
| `mobile_without_country_code` | Mobile number |
| `company` | Company name |
| `city` | City |
| `state` | State |
| `country` | Country |
| `lead_owner` | Lead owner |
| `crm_status` | One of: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE` |
| `crm_note` | Notes, extra contacts, remarks |
| `data_source` | One of: `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots` |
| `possession_time` | Property possession timeline |
| `description` | Additional description |

---

## ✨ Features

- ✅ Drag & Drop + File Picker upload
- ✅ Client-side CSV preview (no AI yet)
- ✅ Sticky headers + horizontal/vertical scroll tables
- ✅ Confirm step before AI processing
- ✅ AI batch processing with retry logic
- ✅ Progress indicator during AI processing
- ✅ Imported / Skipped tabs with skip reasons
- ✅ Success rate dashboard
- ✅ Dark mode (full dark theme)
- ✅ Fully responsive design
- ✅ Unit tests (Jest)
- ✅ Docker + Docker Compose

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
|---|---|---|
| `GROQ_API_KEY` | Your Groq API key | _required_ |
| `PORT` | Server port | `5000` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` |
| `BATCH_SIZE` | Rows per AI batch | `15` |
| `MAX_RETRIES` | AI retry attempts | `3` |

### Frontend (`frontend/.env.local`)
| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API base URL | `http://localhost:5000` |
