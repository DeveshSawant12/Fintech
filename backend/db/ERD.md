# SmartFinance AI Database — Entity Relationship Diagram

## Visual Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EXISTING TABLE                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                         users                                 │  │
│  │  ─────────────────────────────────────────────────────────   │  │
│  │  • id (UUID, PK)                                             │  │
│  │  • email, password_hash, google_id                          │  │
│  │  • full_name, mobile, profile_picture                       │  │
│  │  • is_email_verified, is_profile_complete, role            │  │
│  │  • Basic financial data (JSONB): expenses, investments,     │  │
│  │    goals, loans                                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ (All new tables reference users.id)
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
  
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ PROFILE (1:1)│    │ TRANSACTIONS (1:N)│    │ PLANNING (1:1/1:N)│
└──────────────┘    └──────────────────┘    └──────────────────┘
        │                    │                        │
        │                    │                        │
        ▼                    ▼                        ▼

┌─────────────────────────┐
│ financial_profiles      │  (1:1 with users)
│ ───────────────────────│
│ Computed snapshot:      │
│ • total_assets          │
│ • total_liabilities     │
│ • net_worth             │
│ • monthly_income        │
│ • monthly_expense       │
│ • monthly_savings       │
│ • savings_rate_pct      │
│ • investment totals     │
│ • SIP/EMI amounts       │
│ • insurance coverage    │
│ • emergency fund        │
└─────────────────────────┘

┌─────────────────────────┐
│ income_records          │  (N per user)
│ ───────────────────────│
│ • source, amount        │
│ • frequency (enum)      │
│ • start_date, end_date  │
│ • is_active             │
│ • received_date         │
│ • category, notes       │
└─────────────────────────┘

┌─────────────────────────┐
│ expense_records         │  (N per user)
│ ───────────────────────│
│ • category, amount      │
│ • frequency (enum)      │
│ • start_date, end_date  │
│ • is_active             │
│ • expense_date          │
│ • subcategory, merchant │
│ • notes                 │
└─────────────────────────┘

┌─────────────────────────┐
│ loans                   │  (N per user)
│ ───────────────────────│
│ • loan_type (enum)      │
│ • lender, account_num   │
│ • principal_amount      │
│ • outstanding_amount    │
│ • interest_rate_pct     │
│ • emi, tenure_months    │
│ • remaining_months      │
│ • start_date, end_date  │
│ • status (enum)         │
└─────────────────────────┘

┌─────────────────────────┐         ┌─────────────────────────┐
│ investments             │◄────┐   │ sips                    │
│ ───────────────────────│     │   │ ───────────────────────│
│ • investment_type (enum)│     │   │ • fund_name, amount     │
│ • name                  │     │   │ • frequency, sip_date   │
│ • invested_amount       │     │   │ • start_date, end_date  │
│ • current_value         │     │   │ • status (enum)         │
│ • returns, return_pct   │     │   │ • total_invested        │
│ • purchase_date         │     │   │ • current_value, returns│
│ • quantity, avg_price   │     │   │ • investment_id (FK)────┘
│ • platform, folio_num   │     │   │   (optional link)       │
│ • is_active             │     │   │ • platform, folio_num   │
└─────────────────────────┘     │   └─────────────────────────┘
         (1:N per user)          │            (N per user)
                                 │
                                 └─ ON DELETE SET NULL

┌─────────────────────────┐
│ assets                  │  (N per user)
│ ───────────────────────│
│ • asset_type (enum)     │
│ • name, current_value   │
│ • purchase_value        │
│ • purchase_date         │
│ • location, account_num │
│ • is_liquid (boolean)   │
└─────────────────────────┘

┌─────────────────────────┐
│ goals                   │  (N per user)
│ ───────────────────────│
│ • name, category (enum) │
│ • target_amount         │
│ • current_amount        │
│ • target_date, priority │
│ • status (enum)         │
│ • monthly_contribution  │
│ • expected_return_pct   │
│ • icon, description     │
│ • achieved_at           │
└─────────────────────────┘

┌─────────────────────────┐
│ retirement_plans        │  (1:1 with users)
│ ───────────────────────│
│ • current_age           │
│ • retirement_age        │
│ • life_expectancy       │
│ • current_corpus        │
│ • target_corpus         │
│ • monthly_contribution  │
│ • expected_return_pct   │
│ • inflation_pct         │
│ • monthly_expense_post  │
│ • projected_corpus      │
│ • corpus_gap            │
└─────────────────────────┘

┌─────────────────────────┐
│ financial_health_scores │  (N per user - time series)
│ ───────────────────────│
│ • overall_score (0-100) │
│ Component scores:       │
│   - net_worth_score     │
│   - savings_rate_score  │
│   - debt_score          │
│   - investment_score    │
│   - emergency_fund_score│
│   - insurance_score     │
│   - goal_progress_score │
│ • strengths (TEXT[])    │
│ • weaknesses (TEXT[])   │
│ • recommendations ([])  │
│ • calculated_at         │
└─────────────────────────┘

┌─────────────────────────┐
│ alerts                  │  (N per user)
│ ───────────────────────│
│ • alert_type (enum)     │
│ • priority (enum)       │
│ • title, message        │
│ • action_url, label     │
│ • is_read, is_dismissed │
│ • expires_at            │
│ • metadata (JSONB)      │
└─────────────────────────┘

┌─────────────────────────┐         ┌─────────────────────────┐
│ ai_conversations        │────1:N──│ ai_messages             │
│ ───────────────────────│         │ ───────────────────────│
│ • user_id (FK)          │         │ • conversation_id (FK)  │
│ • title                 │         │ • role (enum)           │
│ • message_count         │         │   - user                │
│ • token_count           │         │   - assistant           │
│ • created_at            │         │   - system              │
│ • updated_at            │         │ • content (TEXT)        │
└─────────────────────────┘         │ • prompt_tokens         │
         (N per user)                │ • completion_tokens     │
                                     │ • total_tokens          │
                                     │ • tool_calls (JSONB)    │
                                     │ • tool_results (JSONB)  │
                                     │ • model (VARCHAR)       │
                                     │ • created_at            │
                                     └─────────────────────────┘
                                              (N per conversation)
```

---

## Cascade Delete Flow

```
DELETE users WHERE id = 'xxx'
    │
    ├─► CASCADE DELETE → financial_profiles
    ├─► CASCADE DELETE → income_records
    ├─► CASCADE DELETE → expense_records
    ├─► CASCADE DELETE → loans
    ├─► CASCADE DELETE → investments
    │                       └─► SET NULL → sips.investment_id
    ├─► CASCADE DELETE → sips (user-owned)
    ├─► CASCADE DELETE → assets
    ├─► CASCADE DELETE → goals
    ├─► CASCADE DELETE → retirement_plans
    ├─► CASCADE DELETE → financial_health_scores
    ├─► CASCADE DELETE → alerts
    └─► CASCADE DELETE → ai_conversations
                            └─► CASCADE DELETE → ai_messages
```

---

## Data Flow: New User Onboarding

```
1. User signs up
   └─► users table (existing)

2. First financial data entry
   └─► Creates financial_profiles (computed snapshot)
   └─► Creates income_records (salary, etc.)
   └─► Creates expense_records (rent, utilities, etc.)

3. Adds investment portfolio
   └─► Creates investments (stocks, MFs)
   └─► Creates sips (monthly SIPs)
       └─► Optional: Link to investments

4. Adds liabilities
   └─► Creates loans (home, car, personal)

5. Sets financial goals
   └─► Creates goals (retirement, home, education)

6. Retirement planning
   └─► Creates retirement_plans (1:1)

7. System calculates health
   └─► Creates financial_health_scores
   └─► Creates alerts (if warnings)

8. Uses AI assistant
   └─► Creates ai_conversations
       └─► Creates ai_messages (chat history)
```

---

## Query Pattern Examples

### 1. Dashboard Summary Query
```sql
SELECT 
  fp.*,
  (SELECT COUNT(*) FROM goals WHERE user_id = u.id AND status = 'active') as active_goals,
  (SELECT COUNT(*) FROM loans WHERE user_id = u.id AND status = 'active') as active_loans,
  (SELECT COUNT(*) FROM alerts WHERE user_id = u.id AND is_read = FALSE) as unread_alerts
FROM users u
LEFT JOIN financial_profiles fp ON fp.user_id = u.id
WHERE u.id = 'user-uuid';
```

### 2. Goal Progress Query
```sql
SELECT 
  id, name, category, target_amount, current_amount,
  ROUND((current_amount / target_amount * 100)::numeric, 2) as progress_pct,
  target_date,
  EXTRACT(YEAR FROM AGE(target_date, CURRENT_DATE)) as years_remaining
FROM goals
WHERE user_id = 'user-uuid' AND status = 'active'
ORDER BY priority DESC, target_date ASC;
```

### 3. Monthly Cash Flow Query
```sql
-- Total monthly income
SELECT 
  SUM(
    CASE frequency
      WHEN 'monthly' THEN amount
      WHEN 'annual' THEN amount / 12
      WHEN 'quarterly' THEN amount / 3
      ELSE 0
    END
  ) as total_monthly_income
FROM income_records
WHERE user_id = 'user-uuid' AND is_active = TRUE;

-- Total monthly expense
SELECT 
  SUM(
    CASE frequency
      WHEN 'monthly' THEN amount
      WHEN 'annual' THEN amount / 12
      WHEN 'quarterly' THEN amount / 3
      WHEN 'weekly' THEN amount * 4.33
      WHEN 'daily' THEN amount * 30
      ELSE 0
    END
  ) as total_monthly_expense
FROM expense_records
WHERE user_id = 'user-uuid' AND is_active = TRUE;
```

### 4. Investment Performance Query
```sql
SELECT 
  investment_type,
  COUNT(*) as count,
  SUM(invested_amount) as total_invested,
  SUM(current_value) as total_value,
  SUM(returns) as total_returns,
  ROUND(AVG(return_pct)::numeric, 2) as avg_return_pct
FROM investments
WHERE user_id = 'user-uuid' AND is_active = TRUE
GROUP BY investment_type
ORDER BY total_value DESC;
```

### 5. AI Conversation History Query
```sql
SELECT 
  c.id, c.title, c.message_count, c.token_count, c.updated_at,
  (
    SELECT content 
    FROM ai_messages 
    WHERE conversation_id = c.id AND role = 'user'
    ORDER BY created_at DESC 
    LIMIT 1
  ) as last_user_message
FROM ai_conversations c
WHERE c.user_id = 'user-uuid'
ORDER BY c.updated_at DESC
LIMIT 10;
```

---

## Index Usage Scenarios

| Query Pattern | Index Used | Performance |
|---------------|------------|-------------|
| Find all user records | `idx_*_user` | O(log n) |
| Find active loans | `idx_loans_status` (composite) | O(log n) |
| Find unread alerts | `idx_alerts_unread` (partial) | O(log n) |
| Find active expenses | `idx_expense_records_active` (partial) | O(log n) |
| Latest health score | `idx_financial_health_calculated` | O(1) |
| Recent conversations | `idx_ai_conversations_updated` | O(log n) |

---

## Storage Estimates

Assuming 10,000 active users:

| Table | Records/User | Total Records | Est. Size |
|-------|--------------|---------------|-----------|
| financial_profiles | 1 | 10,000 | ~2 MB |
| income_records | 5 | 50,000 | ~10 MB |
| expense_records | 30 | 300,000 | ~60 MB |
| loans | 2 | 20,000 | ~4 MB |
| investments | 10 | 100,000 | ~20 MB |
| sips | 5 | 50,000 | ~10 MB |
| assets | 3 | 30,000 | ~6 MB |
| goals | 5 | 50,000 | ~10 MB |
| retirement_plans | 1 | 10,000 | ~2 MB |
| financial_health_scores | 12 | 120,000 | ~30 MB |
| alerts | 5 | 50,000 | ~15 MB |
| ai_conversations | 10 | 100,000 | ~5 MB |
| ai_messages | 100 | 1,000,000 | ~500 MB |
| **TOTAL** | | **1,900,000** | **~674 MB** |

*Note: Estimates assume text compression and exclude indexes (~30% overhead).*

---

## Migration Compatibility

### ✅ Safe Operations
- Adding new tables (no impact on existing)
- Adding indexes (minimal lock time)
- Adding columns with defaults (instant in PostgreSQL 11+)
- Creating ENUM types

### ⚠️ Caution Required
- Modifying existing `users` table
- Changing existing JSONB structure
- Backfilling historical data (use batches)

### Current Status
- **Zero modifications** to existing tables
- **Zero data migrations** required for existing users
- **Opt-in usage** — tables populate as features are used
- **Backward compatible** — old JSONB data still works

---

## Summary

This ERD represents a **comprehensive, normalized, and scalable** database design for SmartFinance AI Wealth Assistant. Key highlights:

✅ **Clear separation of concerns** — Transactions vs. Planning vs. AI  
✅ **Optimized for queries** — 24 strategic indexes  
✅ **Data integrity** — Foreign keys, CHECK constraints, ENUMs  
✅ **Audit trail ready** — Timestamps on all tables  
✅ **AI-first design** — Token tracking, tool call storage, conversation memory  
✅ **Performance-oriented** — Computed profiles, partial indexes  
✅ **Future-proof** — Extensible JSONB fields for metadata  

**Ready for production deployment and API integration.**
