# SmartFinance AI Database Schema Documentation

## Overview

Complete database layer for SmartFinance AI Wealth Assistant with 13 new tables designed to support AI-powered financial planning, tracking, and insights.

---

## Database Schema

### 1. **financial_profiles**
Computed financial snapshot for each user (performance optimization).

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id, UNIQUE)
- `total_assets` (NUMERIC) — Sum of all assets
- `total_liabilities` (NUMERIC) — Sum of all loans
- `net_worth` (NUMERIC) — Assets - Liabilities
- `total_monthly_income` (NUMERIC)
- `total_monthly_expense` (NUMERIC)
- `monthly_savings` (NUMERIC)
- `savings_rate_pct` (NUMERIC) — Percentage
- `total_invested` (NUMERIC)
- `total_investment_value` (NUMERIC)
- `investment_returns` (NUMERIC)
- `investment_return_pct` (NUMERIC)
- `monthly_sip_amount` (NUMERIC)
- `monthly_emi_amount` (NUMERIC)
- `life_insurance_cover` (NUMERIC)
- `health_insurance_cover` (NUMERIC)
- `emergency_fund_target` (NUMERIC)
- `emergency_fund_current` (NUMERIC)
- `last_calculated_at` (TIMESTAMPTZ)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Relationships:**
- 1:1 with `users` (CASCADE delete)

**Indexes:**
- `idx_financial_profiles_user` on `user_id`

---

### 2. **income_records**
Track all income sources (recurring and one-time).

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `source` (VARCHAR) — e.g., "Salary", "Freelance", "Rental"
- `amount` (NUMERIC)
- `frequency` (ENUM) — monthly, quarterly, annual, one_time
- `start_date`, `end_date` (DATE) — For recurring income
- `is_active` (BOOLEAN)
- `received_date` (DATE) — For one-time income
- `category` (VARCHAR) — e.g., "salary", "bonus", "gift"
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Relationships:**
- N:1 with `users` (CASCADE delete)

**Indexes:**
- `idx_income_records_user` on `user_id`
- `idx_income_records_active` on `(user_id, is_active)` WHERE `is_active = TRUE`

---

### 3. **expense_records**
Track all expenses (recurring and one-time).

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `category` (VARCHAR) — e.g., "Rent", "Utilities", "Food"
- `amount` (NUMERIC)
- `frequency` (ENUM) — daily, weekly, monthly, quarterly, annual, one_time
- `start_date`, `end_date` (DATE) — For recurring
- `is_active` (BOOLEAN)
- `expense_date` (DATE) — For one-time
- `subcategory` (VARCHAR)
- `merchant` (VARCHAR)
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Relationships:**
- N:1 with `users` (CASCADE delete)

**Indexes:**
- `idx_expense_records_user` on `user_id`
- `idx_expense_records_active` on `(user_id, is_active)` WHERE `is_active = TRUE`
- `idx_expense_records_category` on `category`

---

### 4. **loans**
Loan management with EMI tracking.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `loan_type` (ENUM) — home, car, personal, education, credit_card, other
- `lender` (VARCHAR)
- `principal_amount` (NUMERIC)
- `outstanding_amount` (NUMERIC)
- `interest_rate_pct` (NUMERIC)
- `emi` (NUMERIC)
- `tenure_months` (INT)
- `remaining_months` (INT)
- `start_date`, `end_date` (DATE)
- `status` (ENUM) — active, paid_off, foreclosed
- `account_number` (VARCHAR)
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Relationships:**
- N:1 with `users` (CASCADE delete)

**Indexes:**
- `idx_loans_user` on `user_id`
- `idx_loans_status` on `(user_id, status)`

---

### 5. **investments**
Investment portfolio tracking.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `investment_type` (ENUM) — mutual_fund, stock, bond, ppf, nps, real_estate, gold, crypto, fd, other
- `name` (VARCHAR)
- `invested_amount` (NUMERIC)
- `current_value` (NUMERIC)
- `returns` (NUMERIC) — Auto-calculated
- `return_pct` (NUMERIC) — Auto-calculated
- `purchase_date`, `maturity_date` (DATE)
- `quantity` (NUMERIC)
- `average_price` (NUMERIC)
- `platform` (VARCHAR) — e.g., "Zerodha", "Groww"
- `folio_number` (VARCHAR)
- `notes` (TEXT)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Relationships:**
- N:1 with `users` (CASCADE delete)
- 1:N with `sips` (optional link)

**Indexes:**
- `idx_investments_user` on `user_id`
- `idx_investments_type` on `investment_type`
- `idx_investments_active` on `(user_id, is_active)` WHERE `is_active = TRUE`

---

### 6. **sips** (Systematic Investment Plans)
SIP tracking with performance monitoring.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `investment_id` (UUID, FK → investments.id, nullable)
- `fund_name` (VARCHAR)
- `amount` (NUMERIC)
- `frequency` (VARCHAR) — e.g., "monthly", "weekly"
- `sip_date` (INT) — Day of month (1-31)
- `start_date`, `end_date` (DATE)
- `status` (ENUM) — active, paused, stopped, completed
- `total_invested` (NUMERIC)
- `current_value` (NUMERIC)
- `returns` (NUMERIC)
- `platform` (VARCHAR)
- `folio_number` (VARCHAR)
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Relationships:**
- N:1 with `users` (CASCADE delete)
- N:1 with `investments` (SET NULL on delete)

**Indexes:**
- `idx_sips_user` on `user_id`
- `idx_sips_status` on `(user_id, status)`
- `idx_sips_investment` on `investment_id` WHERE `investment_id IS NOT NULL`

---

### 7. **assets**
Non-investment assets (savings accounts, FDs, gold, real estate, vehicles).

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `asset_type` (ENUM) — savings_account, fd, ppf, nps, real_estate, gold, vehicle, other
- `name` (VARCHAR)
- `current_value` (NUMERIC)
- `purchase_value` (NUMERIC)
- `purchase_date` (DATE)
- `location` (VARCHAR) — For real estate
- `account_number` (VARCHAR)
- `notes` (TEXT)
- `is_liquid` (BOOLEAN) — Quick access to cash
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Relationships:**
- N:1 with `users` (CASCADE delete)

**Indexes:**
- `idx_assets_user` on `user_id`
- `idx_assets_type` on `asset_type`

---

### 8. **goals**
Financial goal tracking with progress monitoring.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `name` (VARCHAR) — e.g., "Home Down Payment"
- `category` (ENUM) — retirement, home, education, wealth, emergency, travel, wedding, other
- `target_amount` (NUMERIC)
- `current_amount` (NUMERIC)
- `target_date` (DATE)
- `priority` (INT) — 1-10 scale
- `status` (ENUM) — planning, active, achieved, abandoned
- `monthly_contribution` (NUMERIC)
- `expected_return_pct` (NUMERIC)
- `icon` (VARCHAR) — Emoji or icon identifier
- `description` (TEXT)
- `achieved_at` (TIMESTAMPTZ)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Relationships:**
- N:1 with `users` (CASCADE delete)

**Indexes:**
- `idx_goals_user` on `user_id`
- `idx_goals_status` on `(user_id, status)`
- `idx_goals_target_date` on `target_date`

---

### 9. **retirement_plans**
Retirement planning data with corpus calculations.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id, UNIQUE)
- `current_age` (INT)
- `retirement_age` (INT)
- `life_expectancy` (INT)
- `current_corpus` (NUMERIC)
- `target_corpus` (NUMERIC)
- `monthly_contribution` (NUMERIC)
- `expected_return_pct` (NUMERIC)
- `inflation_pct` (NUMERIC)
- `monthly_expense_post_retirement` (NUMERIC)
- `projected_corpus` (NUMERIC) — AI-calculated
- `corpus_gap` (NUMERIC) — Target - Projected
- `last_calculated_at` (TIMESTAMPTZ)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Relationships:**
- 1:1 with `users` (CASCADE delete)

**Indexes:**
- `idx_retirement_plans_user` on `user_id`

---

### 10. **financial_health_scores**
Financial health score history.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `overall_score` (INT) — 0-100
- Component scores (0-100 each):
  - `net_worth_score`
  - `savings_rate_score`
  - `debt_score`
  - `investment_score`
  - `emergency_fund_score`
  - `insurance_score`
  - `goal_progress_score`
- `strengths` (TEXT[]) — Array of positive insights
- `weaknesses` (TEXT[]) — Array of areas to improve
- `recommendations` (TEXT[]) — Array of action items
- `calculated_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

**Relationships:**
- N:1 with `users` (CASCADE delete)

**Indexes:**
- `idx_financial_health_user` on `user_id`
- `idx_financial_health_calculated` on `calculated_at DESC`

---

### 11. **alerts**
Smart alerts and notifications for users.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `alert_type` (ENUM) — savings_warning, goal_deadline, investment_rebalance, tax_saving, debt_warning, milestone, emergency_fund, other
- `priority` (ENUM) — low, medium, high, critical
- `title` (VARCHAR)
- `message` (TEXT)
- `action_url` (VARCHAR) — Deep link to relevant page
- `action_label` (VARCHAR) — Button text
- `is_read` (BOOLEAN)
- `is_dismissed` (BOOLEAN)
- `expires_at` (TIMESTAMPTZ) — Auto-expire after date
- `metadata` (JSONB) — Additional context
- `created_at` (TIMESTAMPTZ)

**Relationships:**
- N:1 with `users` (CASCADE delete)

**Indexes:**
- `idx_alerts_user` on `user_id`
- `idx_alerts_unread` on `(user_id, is_read)` WHERE `is_read = FALSE`
- `idx_alerts_created` on `created_at DESC`

---

### 12. **ai_conversations**
AI chat conversation threads.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `title` (VARCHAR) — Auto-generated or user-defined
- `message_count` (INT) — Auto-incremented
- `token_count` (INT) — Total tokens used
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Relationships:**
- N:1 with `users` (CASCADE delete)
- 1:N with `ai_messages`

**Indexes:**
- `idx_ai_conversations_user` on `user_id`
- `idx_ai_conversations_updated` on `updated_at DESC`

---

### 13. **ai_messages**
Individual messages within AI conversations.

**Columns:**
- `id` (UUID, PK)
- `conversation_id` (UUID, FK → ai_conversations.id)
- `role` (ENUM) — user, assistant, system
- `content` (TEXT) — Message text
- `prompt_tokens` (INT)
- `completion_tokens` (INT)
- `total_tokens` (INT)
- `tool_calls` (JSONB) — Function calls made by AI
- `tool_results` (JSONB) — Function call results
- `model` (VARCHAR) — e.g., "gpt-4", "claude-3"
- `created_at` (TIMESTAMPTZ)

**Relationships:**
- N:1 with `ai_conversations` (CASCADE delete)

**Indexes:**
- `idx_ai_messages_conversation` on `conversation_id`
- `idx_ai_messages_created` on `created_at DESC`

---

## Relationship Diagram

```
users (existing)
  │
  ├─1:1─→ financial_profiles
  ├─1:1─→ retirement_plans
  │
  ├─1:N─→ income_records
  ├─1:N─→ expense_records
  ├─1:N─→ loans
  ├─1:N─→ assets
  ├─1:N─→ goals
  │
  ├─1:N─→ investments
  │        └─1:N─→ sips (optional FK)
  │
  ├─1:N─→ sips (can exist independently)
  │
  ├─1:N─→ financial_health_scores
  ├─1:N─→ alerts
  │
  └─1:N─→ ai_conversations
           └─1:N─→ ai_messages
```

---

## Key Design Decisions

### 1. **Computed vs. Raw Data**
- `financial_profiles` stores computed totals for performance
- Updated via application logic or database triggers
- Reduces need for complex JOINs on dashboard queries

### 2. **Recurring vs. One-Time Records**
- Both `income_records` and `expense_records` support:
  - Recurring: `start_date`, `end_date`, `is_active`
  - One-time: `received_date` / `expense_date`
- Enables accurate monthly projections

### 3. **SIP-Investment Relationship**
- `sips.investment_id` is optional
- Allows standalone SIP tracking or linking to portfolio investment
- ON DELETE SET NULL prevents cascade deletion

### 4. **Historical Health Scores**
- Multiple scores per user for trend analysis
- No UNIQUE constraint on `user_id` — allows time series

### 5. **AI Message Token Tracking**
- Tracks usage per message for cost control
- Conversation-level rollup via `token_count`

### 6. **Alert Expiration**
- `expires_at` enables auto-cleanup via cron job
- `is_dismissed` vs. `is_read` for different UX states

---

## Validation Constraints

All tables include:
- **CHECK constraints** on numeric fields (e.g., `amount >= 0`)
- **ENUM types** for controlled vocabularies
- **NOT NULL** on critical fields
- **Foreign key constraints** with CASCADE delete where appropriate
- **Unique constraints** on 1:1 relationships

---

## Indexes Strategy

1. **User-scoped queries** → Index on `user_id`
2. **Filtered queries** → Composite indexes (e.g., `user_id + status`)
3. **Time-series queries** → Index on timestamp columns
4. **Partial indexes** → WHERE clauses for active records only

---

## Models Overview

| Model | File | Purpose |
|-------|------|---------|
| FinancialProfile | `FinancialProfile.js` | Computed financial snapshot |
| Income | `Income.js` | Income tracking CRUD |
| Expense | `Expense.js` | Expense tracking CRUD |
| Loan | `Loan.js` | Loan management CRUD |
| Investment | `Investment.js` | Investment portfolio CRUD |
| SIP | `FinancialEntities.js` | SIP tracking CRUD |
| Asset | `FinancialEntities.js` | Asset management CRUD |
| Goal | `FinancialEntities.js` | Goal tracking CRUD |
| RetirementPlan | `PlanningEntities.js` | Retirement planning CRUD |
| FinancialHealthScore | `PlanningEntities.js` | Health score CRUD |
| Alert | `PlanningEntities.js` | Alert management CRUD |
| AIConversation | `AIEntities.js` | AI chat conversation CRUD |
| AIMessage | `AIEntities.js` | AI message CRUD |

---

## Migration Usage

```bash
# Run AI database migration
cd backend
node db/migrate_ai.js
```

**Output:**
- Creates all 13 tables
- Creates 13 ENUM types
- Creates 20+ indexes
- Sets up auto-update triggers
- Idempotent (safe to re-run)

---

## Next Steps

1. ✅ Database schema created
2. ✅ Models implemented
3. ⏳ **Next:** Create API endpoints (userRoutes, adminRoutes)
4. ⏳ Implement calculation/sync logic (update financial_profiles)
5. ⏳ Create AI service layer
6. ⏳ Build frontend components

---

## Notes

- All monetary values use `NUMERIC(15,2)` for precision
- All dates use `DATE` type (no time component needed)
- All timestamps use `TIMESTAMPTZ` (timezone-aware)
- UUIDs used for all primary keys
- Auto-update triggers maintain `updated_at` consistency
- Models use camelCase (JS) → snake_case (SQL) mapping
- All models include `format()` helper for row transformation
