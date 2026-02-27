<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Neo4j-4581C3?style=for-the-badge&logo=neo4j&logoColor=white" alt="Neo4j" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Google_Gemini-886FBF?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

<h1 align="center">🏥 MediSync</h1>

<p align="center">
  <strong>GraphRAG Patient Intelligence Platform</strong>
</p>

<p align="center">
  An intelligent healthcare platform that leverages <strong>Graph-based Retrieval Augmented Generation (GraphRAG)</strong> to process medical records, extract clinical entities using <strong>Google Gemini AI</strong>, and build rich patient knowledge graphs in <strong>Neo4j</strong> — all wrapped in a modern, full-stack TypeScript application.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-database-schema">Database Schema</a> •
  <a href="#-security">Security</a>
</p>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📋 Medical Record Processing
Upload and process clinical notes, lab results, prescriptions, and imaging reports. Supports drag-and-drop file upload with real-time progress tracking.

</td>
<td width="50%">

### 🧠 AI-Powered Entity Extraction
Leverages **Google Gemini AI** to extract medical entities — conditions, medications, procedures, allergies, lab results, and vital signs — with confidence scoring and medical coding (SNOMED CT, RxNorm, LOINC).

</td>
</tr>
<tr>
<td width="50%">

### 🕸️ Graph-Based Patient Intelligence
Builds interconnected patient knowledge graphs in **Neo4j**, enabling relationship discovery, timeline visualization, and holistic patient views that traditional RDBMS cannot offer.

</td>
<td width="50%">

### 📊 Patient Dashboard
Interactive dashboard with **Summary**, **Timeline**, and **Entities** tabs — providing a 360° view of patient health data with counts, details, and chronological event tracking.

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Secure Authentication
JWT-based authentication with Passport.js, input validation, rate limiting, Helmet.js security headers, and CORS configuration.

</td>
<td width="50%">

### 📖 Swagger API Docs
Auto-generated interactive API documentation accessible at `/api`, making it easy to explore and test all endpoints.

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                    Next.js 14 + Tailwind CSS                    │
│  ┌──────────┐  ┌───────────────────┐  ┌──────────────────────┐  │
│  │  Auth UI │  │  Record Upload UI │  │  Patient Dashboard   │  │
│  └──────────┘  └───────────────────┘  └──────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │  HTTP / REST (JWT Bearer Token)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API SERVER (NestJS)                          │
│  ┌──────────┐  ┌───────────────────┐  ┌──────────────────────┐  │
│  │ Auth     │  │ Medical Records   │  │ Entity Recognizer    │  │
│  │ Module   │  │ Module            │  │ (Google Gemini AI)   │  │
│  └──────────┘  └───────────────────┘  └──────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │  Bolt Protocol
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NEO4J GRAPH DATABASE                        │
│                                                                 │
│   (Patient)──[:HAS_RECORD]──▶(Record)                          │
│       │                          │                              │
│       │──[:HAS_TIMELINE_EVENT]──▶(TimelineEvent)               │
│       │                          │                              │
│       │──[:HAS_ENTITY]──────────▶(MedicalEntity)               │
│                                  ▲                              │
│              (Record)──[:CONTAINS_ENTITY]──┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Frontend** | Next.js 14, React 18, TypeScript | Server-side rendered UI with App Router |
| **Styling** | Tailwind CSS 3 | Utility-first responsive design |
| **UI Components** | Headless UI, Heroicons, Recharts | Accessible components, icons & charts |
| **File Upload** | React Dropzone | Drag-and-drop medical record uploads |
| **Backend** | NestJS 9, TypeScript | Modular, scalable REST API server |
| **Database** | Neo4j 5 (Graph DB) | Knowledge graph for patient relationships |
| **AI / NLP** | Google Generative AI (Gemini) | Medical entity extraction from text |
| **Auth** | JWT, Passport.js, bcrypt | Token-based secure authentication |
| **API Docs** | Swagger / OpenAPI | Interactive API documentation |
| **Security** | Helmet.js, express-rate-limit, class-validator | Headers, rate limiting, input validation |
| **Cloud (Optional)** | AWS Bedrock | Alternative LLM provider |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|:------------|:--------|
| Node.js | 16+ |
| Neo4j | 4.4+ (Desktop, Docker, or Aura Cloud) |
| npm or yarn | Latest |
| Google Cloud API Key | For Gemini AI entity recognition |

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/AIMedSync/medi-sync.git
cd medi-sync
```

### 2️⃣ Backend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure your `.env` file:

```env
# ── Server ──────────────────────────────
PORT=3000
NODE_ENV=development

# ── Neo4j ───────────────────────────────
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_secure_password

# ── Authentication ──────────────────────
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# ── Google Gemini AI ────────────────────
GOOGLE_API_KEY=your_google_api_key

# ── AWS Bedrock (Optional) ──────────────
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

```bash
# Initialize the database
npm run db:init
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Optionally create a `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4️⃣ Run the Application

```bash
# Terminal 1 — Start the backend
npm run start:dev

# Terminal 2 — Start the frontend
cd frontend
npm run dev
```

| Service | URL |
|:--------|:----|
| 🌐 Frontend | [http://localhost:3001](http://localhost:3001) |
| ⚡ Backend API | [http://localhost:3000](http://localhost:3000) |
| 📖 Swagger UI | [http://localhost:3000/api](http://localhost:3000/api) |

> **Default dev credentials** — Username: `admin` / Password: `admin123`
>
> ⚠️ *Change these immediately in production!*

---

## 📡 API Reference

All endpoints (except login) require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/auth/login` | Authenticate and receive a JWT token |

### Medical Records

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/medical/records` | Process a medical record (JSON body) |
| `POST` | `/medical/upload` | Upload and process a medical record file |
| `GET` | `/medical/patients/:id/records` | Retrieve all records for a patient |
| `GET` | `/medical/patients/:id/timeline` | Get patient event timeline |
| `GET` | `/medical/patients/:id/entities` | Get all extracted medical entities |
| `GET` | `/medical/patients/:id/summary` | Get comprehensive patient summary |

> 💡 Full interactive documentation available at **[/api](http://localhost:3000/api)** when the server is running.

---

## 🗄️ Database Schema

MediSync uses a **Neo4j graph database** to model rich, interconnected patient data.

### Node Labels

| Node | Description |
|:-----|:------------|
| `Patient` | Patient demographic and identification data |
| `Record` | Medical records — clinical notes, lab results, prescriptions, imaging |
| `TimelineEvent` | Chronological events in a patient's medical history |
| `MedicalCondition` | Diagnoses and medical conditions |
| `Medication` | Prescribed medications with dosage & frequency |
| `Procedure` | Surgical and clinical procedures |
| `Allergy` | Allergies and adverse reactions |
| `LabResult` | Laboratory test results with values |
| `VitalSign` | Vital sign measurements |

### Relationships

```
(Patient) ──[:HAS_RECORD]──────────▶ (Record)
(Patient) ──[:HAS_TIMELINE_EVENT]──▶ (TimelineEvent)
(Patient) ──[:HAS_ENTITY]──────────▶ (MedicalEntity)
(Record)  ──[:CONTAINS_ENTITY]────▶ (MedicalEntity)
```

### Recognized Medical Entity Types

| Type | Description | Example Codes |
|:-----|:------------|:--------------|
| `CONDITION` | Diagnoses and conditions | SNOMED CT |
| `MEDICATION` | Prescribed drugs | RxNorm |
| `PROCEDURE` | Procedures and surgeries | SNOMED CT |
| `ALLERGY` | Allergies & adverse reactions | SNOMED CT |
| `LAB_RESULT` | Lab test results | LOINC |
| `VITAL_SIGN` | Vital signs & measurements | LOINC |

---

## 📁 Project Structure

```
medi-sync/
├── src/                                 # NestJS backend source
│   ├── app.module.ts                    # Root application module
│   ├── main.ts                          # Entry point — server bootstrap
│   └── modules/
│       ├── auth/                        # 🔐 Authentication module
│       │   ├── auth.controller.ts       #    Login endpoint
│       │   ├── auth.module.ts           #    Module definition
│       │   ├── auth.service.ts          #    Auth business logic
│       │   └── jwt.strategy.ts          #    Passport JWT strategy
│       ├── database/                    # 🗄️ Neo4j database module
│       │   ├── neo4j-config.interface.ts
│       │   ├── neo4j.constants.ts
│       │   └── neo4j.module.ts
│       └── medical/                     # 🏥 Medical records module
│           ├── types/
│           │   └── medical.types.ts     #    TypeScript interfaces
│           ├── medical.controller.ts    #    REST API endpoints
│           ├── medical.module.ts        #    Module definition
│           ├── medical.service.ts       #    Core business logic
│           ├── medical-entity.recognizer.ts  # AI entity extraction
│           └── medical-record.processor.ts   # Record processing
│
├── frontend/                            # Next.js 14 frontend
│   ├── src/
│   │   ├── app/                         # App Router pages
│   │   │   ├── layout.tsx               #    Root layout
│   │   │   ├── page.tsx                 #    Home page
│   │   │   └── globals.css              #    Global styles
│   │   └── components/                  # React components
│   │       ├── Navbar.tsx               #    Navigation bar
│   │       ├── MedicalRecordUpload.tsx  #    Drag-and-drop upload
│   │       └── PatientDashboard.tsx     #    Dashboard with tabs
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── package.json
│
├── scripts/
│   └── init-db.ts                       # Database initialization
│
├── test/                                # Unit & E2E tests
├── .env.example                         # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔐 Security

| Feature | Implementation |
|:--------|:---------------|
| **Authentication** | JWT tokens via `@nestjs/jwt` + Passport.js |
| **Password Hashing** | bcrypt with salt rounds |
| **Rate Limiting** | 100 requests / 15 min via `express-rate-limit` |
| **Security Headers** | Helmet.js (XSS, HSTS, CSP, etc.) |
| **Input Validation** | `class-validator` decorators on all DTOs |
| **CORS** | Configurable origin whitelist |
| **Token Storage** | Frontend `localStorage` with automatic validation |

---

## 🧪 Development

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov

# Lint the codebase
npm run lint

# Format code
npm run format

# Production build
npm run build
npm run start:prod
```

---

## ⚙️ Environment Variables

<details>
<summary><strong>Backend (<code>.env</code>)</strong></summary>

| Variable | Description | Required |
|:---------|:------------|:--------:|
| `PORT` | Server port | No *(default: 3000)* |
| `NODE_ENV` | Environment mode | No *(default: development)* |
| `NEO4J_URI` | Neo4j Bolt connection URI | ✅ |
| `NEO4J_USER` | Neo4j username | ✅ |
| `NEO4J_PASSWORD` | Neo4j password | ✅ |
| `JWT_SECRET` | Secret key for signing JWT tokens | ✅ |
| `JWT_EXPIRES_IN` | Token expiration duration | No *(default: 1d)* |
| `GOOGLE_API_KEY` | Google Generative AI (Gemini) API key | ✅ |
| `AWS_REGION` | AWS region for Bedrock | No |
| `AWS_ACCESS_KEY_ID` | AWS access key for Bedrock | No |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for Bedrock | No |

</details>

<details>
<summary><strong>Frontend (<code>frontend/.env.local</code>)</strong></summary>

| Variable | Description | Required |
|:---------|:------------|:--------:|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | No *(default: http://localhost:3000)* |

</details>

---

## 🐛 Troubleshooting

<details>
<summary><strong>Neo4j Connection Issues</strong></summary>

- Ensure Neo4j is running and accessible at the configured URI
- Verify username/password in your `.env` file
- Check firewall rules if connecting to a remote instance
- Run `npm run db:init` to initialize the database schema

</details>

<details>
<summary><strong>Google Gemini API Issues</strong></summary>

- Verify your `GOOGLE_API_KEY` is valid and has Generative AI API enabled
- Ensure billing is active on your Google Cloud project
- Check API quota limits if entity extraction is failing

</details>

<details>
<summary><strong>Authentication Issues</strong></summary>

- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration (`JWT_EXPIRES_IN`)
- Include the token as `Authorization: Bearer <token>` in API requests
- Clear `localStorage` in the browser for stale token issues

</details>

<details>
<summary><strong>Frontend ↔ Backend Connection</strong></summary>

- Confirm the backend is running on the expected port
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Verify CORS settings allow the frontend origin
- Inspect the browser console for detailed error messages

</details>

---

## 📋 Roadmap

- [x] Core medical record processing pipeline
- [x] AI-powered medical entity recognition (Google Gemini)
- [x] Neo4j graph-based patient knowledge graph
- [x] RESTful API with JWT authentication
- [x] Database initialization script
- [x] Next.js 14 frontend with modern UI
- [x] Medical record drag-and-drop upload
- [x] Patient dashboard (Summary, Timeline, Entities)
- [ ] Advanced analytics and reporting dashboards
- [ ] Clinical decision support features
- [ ] Drug interaction checking
- [ ] Multi-tenant support
- [ ] FHIR standard compliance

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

<p align="center">
  Built with ❤️ using NestJS, Next.js, Neo4j & Google Gemini AI
</p>
