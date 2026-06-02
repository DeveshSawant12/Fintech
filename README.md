# 💰 SmartFinance — Personal Finance Intelligence Platform

> A full-stack FinTech web application that helps Indian users track wealth, plan investments, manage loans, set financial goals, and learn through curated content — all in one place.

---

## 📸 Preview

| Page | Description |
|------|-------------|
| `/` | Landing page with services, testimonials, SIP/lumpsum calculators |
| `/dashboard` | Personalized financial overview — assets, loans, goals, SIP |
| `/onboarding` | Multi-step profile wizard collecting income, risk, goals |
| `/planner` | AI-assisted financial planning with budget breakdown |
| `/insurance` | Insurance coverage checker and gap analyzer |
| `/webinars` | Live & upcoming financial webinar listings |
| `/admin/portal` | Admin dashboard — user analytics, content management |

---

## 🗂️ Project Structure

```
Fintech/
├── src/                          # Frontend (React + TypeScript)
│   └── app/
│       ├── pages/                # All page components
│       │   ├── Home.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Onboarding.tsx
│       │   ├── FinancialPlanner.tsx
│       │   ├── Insurance.tsx
│       │   ├── SIPCalculator.tsx
│       │   ├── LumpsumCalculator.tsx
│       │   ├── Webinars.tsx
│       │   ├── Services.tsx
│       │   ├── Settings.tsx
│       │   ├── Login.tsx
│       │   ├── Signup.tsx
│       │   ├── AdminLogin.tsx
│       │   └── AdminPortal.tsx
│       ├── auth/
│       │   ├── AuthContext.tsx   # Auth state provider (user + admin)
│       │   ├── authService.ts    # Login, register, OTP, admin auth
│       │   └── ProtectedRoute.tsx
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── Footer.tsx
│       │   └── ui/               # Radix UI + shadcn component library
│       ├── data/
│       │   └── mockData.ts       # Financial profiles, content, seeded data
│       ├── routes.tsx            # React Router v7 route definitions
│       └── App.tsx
│
├── backend/                      # Backend (Node.js + Express)
│   ├── server.js                 # App entry point
│   ├── config/
│   │   ├── db.js                 # PostgreSQL pool (pg)
│   │   └── passport.js           # Google OAuth strategy
│   ├── controllers/
│   │   ├── authController.js     # Signup, login, OTP, Google OAuth
│   │   ├── userController.js     # Onboarding, profile, password
│   │   └── adminController.js    # Admin analytics, user management
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── adminRoutes.js
│   │   └── contentRoutes.js
│   ├── middleware/
│   │   ├── auth.js               # JWT verify + requireProfileComplete
│   │   ├── validate.js           # express-validator error handler
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Admin.js
│   │   └── Content.js
│   ├── utils/
│   │   ├── jwt.js                # Sign, verify, revoke tokens
│   │   ├── otp.js                # Generate + verify 6-digit OTPs
│   │   ├── email.js              # Nodemailer (OTP + welcome emails)
│   │   └── response.js           # ok() / fail() helpers
│   └── db/
│       ├── migrate.js            # Create all tables (idempotent)
│       └── seed.js               # Demo data
│
├── index.html
├── vite.config.ts
└── package.json
```

---

## ⚙️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI framework |
| TypeScript | — | Type safety |
| Vite | 6.3 | Build tool & dev server |
| React Router | 7.13 | Client-side routing |
| Tailwind CSS | 4.1 | Utility-first styling |
| Motion (Framer) | 12.x | Animations |
| Recharts | 2.15 | Charts & data visualization |
| Radix UI | various | Accessible headless components |
| shadcn/ui | — | Pre-built component system |
| Lucide React | 0.487 | Icon library |
| React Hook Form | 7.55 | Form state management |
| Sonner | 2.x | Toast notifications |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.18 | HTTP server & routing |
| PostgreSQL | 14+ | Primary database |
| pg / pg-pool | 8.x | Database client & pooling |
| bcryptjs | 2.4 | Password hashing |
| jsonwebtoken | 9.x | JWT auth tokens |
| Passport.js | 0.7 | Google OAuth 2.0 |
| Nodemailer | 6.9 | OTP & transactional emails |
| Helmet | 7.x | HTTP security headers |
| express-rate-limit | 7.x | API rate limiting |
| express-validator | 7.x | Input validation |
| dotenv | 16.x | Environment config |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- PostgreSQL 14 or higher
- A Google Cloud project (for OAuth — optional)
- An SMTP email service (Gmail, Resend, etc. — for OTP emails)

---

### 1. Clone the repository

```bash
git clone https://github.com/gau-rav-001/Fintech-App.git
```

---

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at → **http://localhost:5173**

> The frontend has a built-in mock auth layer (localStorage-based) that works out of the box without running the backend. Demo accounts are seeded automatically on first load.

**Demo credentials (frontend mock):**
```
User:  demo@smartfinance.in  /  demo1234
Admin: admin@smartfinance.in /  admin2024
```

---

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartfinance
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

# JWT
JWT_SECRET=your_super_secret_key_minimum_32_chars
JWT_EXPIRES_IN=7d

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Email / OTP (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=SmartFinance <your@gmail.com>
```

---

### 4. Database Setup

```bash
# Create the database in PostgreSQL
psql -U postgres -c "CREATE DATABASE smartfinance;"

# Run migrations (creates all tables)
npm run db:migrate

# Seed demo data (optional)
npm run db:seed
```

---

### 5. Start the backend

```bash
npm run dev       # development (nodemon, auto-restart)
# or
npm start         # production
```

Backend API runs at → **http://localhost:5000**
Health check → **http://localhost:5000/health**

---

## 🔑 Authentication Flow

```
User enters email + password
        ↓
Backend verifies credentials
        ↓
6-digit OTP sent to email (via Nodemailer)
        ↓
User enters OTP → verified
        ↓
JWT token issued → stored in localStorage
        ↓
Protected routes accessible
```

**Google OAuth flow:**
```
User clicks "Sign in with Google"
        ↓
Redirected to Google consent screen
        ↓
Google redirects to /api/auth/google/callback
        ↓
One-time code generated (60s expiry)
        ↓
Frontend calls POST /api/auth/exchange-code
        ↓
JWT token returned
```

---

## 📡 API Reference

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signup` | Register new user | — |
| POST | `/login` | Login with email + password | — |
| POST | `/verify-otp` | Verify 6-digit OTP | — |
| POST | `/resend-otp` | Resend OTP (5/15min limit) | — |
| POST | `/exchange-code` | Exchange Google OAuth code for JWT | — |
| GET | `/google` | Initiate Google OAuth | — |
| GET | `/google/callback` | Google OAuth callback | — |
| GET | `/me` | Get current user | ✅ JWT |
| POST | `/logout` | Revoke token + logout | ✅ JWT |

### User — `/api/user`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/onboarding` | Submit full financial profile | ✅ JWT |
| GET | `/profile` | Get user profile | ✅ JWT |
| PUT | `/update` | Update profile fields | ✅ JWT |
| POST | `/change-password` | Change password | ✅ JWT |
| GET | `/dashboard/summary` | Get dashboard data | ✅ JWT + Profile |

### Admin — `/api/admin`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | List all users | ✅ Admin |
| GET | `/users/:id` | Get user detail | ✅ Admin |
| GET | `/analytics` | Platform analytics | ✅ Admin |

### Content — `/api/content`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/webinars` | List webinars | — |
| POST | `/webinars` | Create webinar | ✅ Admin |
| PUT | `/webinars/:id` | Update webinar | ✅ Admin |
| DELETE | `/webinars/:id` | Delete webinar | ✅ Admin |
| GET | `/news` | List news updates | — |
| POST | `/news` | Publish article | ✅ Admin |
| GET | `/videos` | List video resources | — |
| POST | `/videos` | Add video | ✅ Admin |

---

## 🖥️ Pages & Features

### 🏠 Home (`/`)
- Hero section with animated CTAs
- Services overview carousel
- SIP & Lumpsum calculator widgets
- Testimonials section
- Financial webinar previews

### 📊 Dashboard (`/dashboard`)
- Net worth summary card
- Asset breakdown: savings, mutual funds, stocks, real estate, gold, PPF
- Liabilities: home loan, car loan, personal loan, credit card
- Active SIP funds with returns
- Financial goals with progress bars
- Monthly income vs expense chart
- Insurance coverage status

### 🧭 Onboarding (`/onboarding`)
- Multi-step wizard:
  1. Personal info (DOB, gender, city, occupation)
  2. Income details (monthly, source, growth %)
  3. Risk profile (tolerance, experience, investment style, time horizon)
  4. Assets & investments
  5. Loans & liabilities
  6. Insurance coverage
  7. Financial goals

### 📋 Financial Planner (`/planner`)
- Monthly budget allocation
- Expense category breakdown with icons
- Savings rate calculator
- Goal-based investment suggestions

### 🛡️ Insurance (`/insurance`)
- Life insurance coverage checker
- Health insurance gap analysis
- Vehicle & home insurance status
- Recommended coverage calculator

### 🧮 Calculators
- **SIP Calculator** (`/sip-calculator`) — Monthly investment → future value
- **Lumpsum Calculator** (`/lumpsum-calculator`) — One-time investment projector

### 📹 Webinars (`/webinars`)
- Live, upcoming, and past webinar listings
- Speaker info, date, time, registration link
- Filter by status

### 🔐 Admin Portal (`/admin/portal`)
- **Overview tab** — KPI cards, platform health, asset distribution, recent users
- **Users tab** — Searchable user list, full financial profile viewer (collapsible sections: financial overview, loans, insurance, goals, SIP funds, expenses)
- **Webinars tab** — Create / edit / delete webinars with status management
- **News tab** — Publish / edit / delete articles with category & urgency flags
- **Videos tab** — Add / edit / delete YouTube video resources with auto-thumbnail

---

## 🗄️ Database Schema (Key Tables)

```sql
users              -- Core auth + profile data
user_profiles      -- Extended financial onboarding data
user_goals         -- Financial goals with targets
user_investments   -- SIP funds, stocks, real estate
user_loans         -- Home, car, personal loan records
user_insurance     -- Life, health, vehicle, home coverage
content_items      -- Webinars, news articles, videos
admin_users        -- Separate admin accounts
otp_records        -- Temporary OTP store (TTL via cron)
revoked_tokens     -- JWT revocation list
```

---

## 🔒 Security

- **Passwords** hashed with `bcryptjs` (12 salt rounds)
- **JWT tokens** signed with `HS256`, revoked on logout
- **OTP** expires in 5 minutes, max 3 attempts
- **Rate limiting**: 300 req/15min global, 20 req/15min auth, 5 req/15min OTP
- **Helmet** sets `X-Content-Type-Options`, `X-Frame-Options`, HSTS, CSP
- **CORS** locked to `CLIENT_URL` in production
- **Input validation** on every route via `express-validator`
- **Timing-safe** login (constant-time bcrypt compare prevents user enumeration)

---

## 🌍 Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Backend port (default: 5000) |
| `CLIENT_URL` | Yes (prod) | Frontend origin for CORS |
| `DB_HOST` | Yes | PostgreSQL host |
| `DB_NAME` | Yes | Database name |
| `DB_USER` | Yes | DB user |
| `DB_PASSWORD` | Yes | DB password |
| `JWT_SECRET` | Yes | Min 32 character secret |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth |
| `SMTP_HOST` | Optional | Email server for OTP |
| `SMTP_USER` | Optional | Email sender address |
| `SMTP_PASS` | Optional | Email app password |

---

## 📦 Scripts

### Frontend
```bash
npm run dev        # Start dev server (Vite HMR)
npm run build      # Production build → dist/
```

### Backend
```bash
npm run dev        # nodemon dev server
npm start          # Production start
npm run db:migrate # Create all tables
npm run db:seed    # Insert demo data
```

---

## 🐛 Known Issues Fixed

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `authController.js` | `bcrypt` used but never imported → `ReferenceError` on every login | Added `require("bcryptjs")` |
| 2 | `authController.js` | Timing-attack vulnerability in login comparison | Constant-time comparison restructured |
| 3 | `authController.js` | `tempCodes` map populated but no exchange endpoint | Added `exchangeCode` handler |
| 4 | `userRoutes.js` | `router.put("/update")` defined after `module.exports` (dead code, no validation) | Merged into single correct definition |
| 5 | `authRoutes.js` | Missing `POST /exchange-code` route | Registered exchange-code endpoint |
| 6 | `authService.ts` | Passwords stored as plaintext strings in localStorage | SHA-256 hashing via `crypto.subtle` |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m "Add: your feature"`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is for educational and portfolio purposes.
See [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) for third-party library credits.

---

## 👨‍💻 Author

Built with ❤️ using React, Node.js, and PostgreSQL.

> SmartFinance — making personal finance simple, visual, and actionable for every Indian household.