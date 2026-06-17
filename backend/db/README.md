# SmartFinance AI Database Layer

## 📖 Documentation Index

This folder contains the complete database layer implementation for SmartFinance AI Wealth Assistant.

### 📄 Files Overview

| File | Purpose |
|------|---------|
| `migrate_ai.js` | **Migration script** — Creates all 13 tables, indexes, and constraints |
| `SCHEMA.md` | **Complete schema documentation** — All tables, relationships, and design decisions |
| `ERD.md` | **Entity Relationship Diagrams** — Visual representation of database structure |
| `IMPLEMENTATION_SUMMARY.md` | **Implementation details** — What was built, how to use it, next steps |
| `QUICK_REFERENCE.md` | **Developer quick guide** — Common queries, model examples, troubleshooting |
| `README.md` | **This file** — Navigation and overview |

---

## 🚀 Getting Started

### 1. **First Time Setup**
```bash
cd backend
node db/migrate_ai.js
```

### 2. **Verify Installation**
```bash
psql -U postgres -d smartfinance -c "\dt"
# Should show 13 new tables
```

### 3. **Read Documentation**
- Start with: `QUICK_REFERENCE.md` (15 min read)
- Deep dive: `SCHEMA.md` (30 min read)
- Visual: `ERD.md` (diagrams and examples)

---

## 📊 What's Included

### Database Tables (13 total)
✅ `financial_profiles` — Computed financial snapshot  
✅ `income_records` — Income tracking (recurring + one-time)  
✅ `expense_records` — Expense tracking (recurring + one-time)  
✅ `loans` — Loan management with EMI tracking  
✅ `investments` — Investment portfolio  
✅ `sips` — SIP (Systematic Investment Plan) tracking  
✅ `assets` — Non-investment assets (savings, FD, gold, property)  
✅ `goals` — Financial goal tracking  
✅ `retirement_plans` — Retirement corpus planning  
✅ `financial_health_scores` — Health score history  
✅ `alerts` — Smart alerts and notifications  
✅ `ai_conversations` — AI chat conversation threads  
✅ `ai_messages` — AI chat messages with token tracking  

### Model Files (8 total)
✅ `FinancialProfile.js`  
✅ `Income.js`  
✅ `Expense.js`  
✅ `Loan.js`  
✅ `Investment.js`  
✅ `FinancialEntities.js` (SIP, Asset, Goal)  
✅ `PlanningEntities.js` (RetirementPlan, FinancialHealthScore, Alert)  
✅ `AIEntities.js` (AIConversation, AIMessage)  

---

## 🎯 Quick Access

### For Product Managers
📄 Read: `IMPLEMENTATION_SUMMARY.md`  
→ Understand what was built and why

### For Backend Developers
📄 Read: `QUICK_REFERENCE.md` first  
📄 Then: `SCHEMA.md` for details  
→ Start building APIs

### For Database Admins
📄 Read: `SCHEMA.md` for full schema  
📄 Read: `ERD.md` for relationships  
→ Performance tuning and maintenance

### For Frontend Developers
📄 Read: `QUICK_REFERENCE.md`  
→ Understand data models for API integration

### For AI Engineers
📄 Read: `SCHEMA.md` → AI sections  
📄 Focus on: `ai_conversations`, `ai_messages`  
→ Build AI chat features

---

## 📈 Database Statistics

- **Total Tables:** 13
- **Total ENUM Types:** 13
- **Total Indexes:** 24
- **Total Foreign Keys:** 13
- **Total Lines of Code:** ~2,500
- **Estimated Size (10K users):** ~700 MB

---

## 🔗 Relationships Summary

```
users (existing)
  ├─ 1:1  → financial_profiles
  ├─ 1:1  → retirement_plans
  ├─ 1:N  → income_records, expense_records, loans
  ├─ 1:N  → investments → 1:N → sips (optional)
  ├─ 1:N  → sips (standalone)
  ├─ 1:N  → assets, goals
  ├─ 1:N  → financial_health_scores, alerts
  └─ 1:N  → ai_conversations → 1:N → ai_messages
```

---

## ✅ Validation & Constraints

- ✅ All amounts: `>= 0`
- ✅ Percentages: `0-100`
- ✅ Foreign keys with CASCADE delete
- ✅ ENUM types for controlled vocabularies
- ✅ CHECK constraints on all numeric fields
- ✅ NOT NULL on critical fields
- ✅ Auto-update triggers on `updated_at`

---

## 🛠️ Common Tasks

### Run Migration
```bash
node db/migrate_ai.js
```

### Check Tables
```sql
\dt  -- List all tables
\d financial_profiles  -- Describe structure
```

### Test Model
```javascript
const Income = require('../models/Income');
const income = await Income.create({
  userId: 'uuid',
  source: 'Salary',
  amount: 75000,
  frequency: 'monthly'
});
```

---

## 📚 Learn More

1. **Quick Start** → `QUICK_REFERENCE.md`
2. **Full Schema** → `SCHEMA.md`
3. **Visual Diagrams** → `ERD.md`
4. **Implementation** → `IMPLEMENTATION_SUMMARY.md`

---

## 🚦 Status

| Component | Status |
|-----------|--------|
| Database Schema | ✅ Complete |
| Migrations | ✅ Complete |
| Models | ✅ Complete |
| Indexes | ✅ Complete |
| Validations | ✅ Complete |
| Documentation | ✅ Complete |
| APIs | ⏳ Not started |
| AI Integration | ⏳ Not started |
| Frontend | ⏳ Not started |

---

## 🎯 Next Steps

1. **Immediate:** Create API endpoints for CRUD operations
2. **Phase 2:** Implement calculation/sync logic
3. **Phase 3:** Build AI service layer
4. **Phase 4:** Frontend integration

See `IMPLEMENTATION_SUMMARY.md` for detailed implementation plan.

---

## 🤝 Contributing

When adding new features:

1. Update relevant model in `backend/models/`
2. Add migration for schema changes
3. Update `SCHEMA.md` documentation
4. Add examples to `QUICK_REFERENCE.md`
5. Update `ERD.md` if relationships change

---

## 📞 Support

For questions about:
- **Schema design** → See `SCHEMA.md`
- **Model usage** → See `QUICK_REFERENCE.md`
- **Relationships** → See `ERD.md`
- **Implementation** → See `IMPLEMENTATION_SUMMARY.md`

---

**Database layer is production-ready. Ready to build APIs! 🚀**
