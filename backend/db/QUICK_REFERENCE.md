# SmartFinance AI Database — Quick Reference

## 🚀 Quick Start

```bash
# 1. Navigate to backend
cd backend

# 2. Run migration
node db/migrate_ai.js

# 3. Verify
psql -U postgres -d smartfinance -c "\dt"
```

---

## 📁 Files Created

```
backend/
├── db/
│   ├── migrate_ai.js              # Migration script (run once)
│   ├── SCHEMA.md                  # Complete schema documentation
│   ├── ERD.md                     # Entity relationship diagrams
│   └── IMPLEMENTATION_SUMMARY.md  # Implementation details
└── models/
    ├── FinancialProfile.js        # Computed snapshot
    ├── Income.js                  # Income CRUD
    ├── Expense.js                 # Expense CRUD
    ├── Loan.js                    # Loan CRUD
    ├── Investment.js              # Investment CRUD
    ├── FinancialEntities.js       # SIP, Asset, Goal
    ├── PlanningEntities.js        # Retirement, Health, Alert
    └── AIEntities.js              # Conversation, Message
```

---

## 🗄️ Tables at a Glance

| Table | Type | Purpose | Key Fields |
|-------|------|---------|------------|
| `financial_profiles` | 1:1 | Computed totals | net_worth, savings_rate_pct |
| `income_records` | 1:N | Income tracking | source, amount, frequency |
| `expense_records` | 1:N | Expense tracking | category, amount, frequency |
| `loans` | 1:N | Loan management | loan_type, emi, outstanding |
| `investments` | 1:N | Portfolio | investment_type, returns |
| `sips` | 1:N | SIP tracking | amount, frequency, status |
| `assets` | 1:N | Assets | asset_type, current_value |
| `goals` | 1:N | Financial goals | target_amount, progress |
| `retirement_plans` | 1:1 | Retirement | corpus_gap, projected_corpus |
| `financial_health_scores` | 1:N | Health score | overall_score, components |
| `alerts` | 1:N | Notifications | priority, is_read |
| `ai_conversations` | 1:N | Chat threads | title, message_count |
| `ai_messages` | 1:N | Chat messages | role, content, tokens |

---

## 💻 Model Usage Examples

### Create Financial Profile
```javascript
const FinancialProfile = require('./models/FinancialProfile');

const profile = await FinancialProfile.create(userId);
```

### Add Income Record
```javascript
const Income = require('./models/Income');

const income = await Income.create({
  userId: 'uuid',
  source: 'Salary',
  amount: 75000,
  frequency: 'monthly',
  startDate: '2024-01-01',
  isActive: true,
  category: 'salary'
});
```

### Add Expense Record
```javascript
const Expense = require('./models/Expense');

const expense = await Expense.create({
  userId: 'uuid',
  category: 'Rent',
  amount: 15000,
  frequency: 'monthly',
  startDate: '2024-01-01',
  isActive: true
});
```

### Add Loan
```javascript
const Loan = require('./models/Loan');

const loan = await Loan.create({
  userId: 'uuid',
  loanType: 'home',
  lender: 'HDFC Bank',
  principalAmount: 5000000,
  outstandingAmount: 4500000,
  interestRatePct: 8.5,
  emi: 45000,
  tenureMonths: 240,
  startDate: '2020-01-01'
});
```

### Add Investment
```javascript
const Investment = require('./models/Investment');

const investment = await Investment.create({
  userId: 'uuid',
  investmentType: 'mutual_fund',
  name: 'HDFC Balanced Advantage Fund',
  investedAmount: 100000,
  currentValue: 125000,
  purchaseDate: '2023-01-01',
  platform: 'Groww'
});
```

### Add SIP
```javascript
const { SIP } = require('./models/FinancialEntities');

const sip = await SIP.create({
  userId: 'uuid',
  fundName: 'Axis Bluechip Fund',
  amount: 5000,
  frequency: 'monthly',
  sipDate: 5,
  startDate: '2024-01-05',
  status: 'active'
});
```

### Add Goal
```javascript
const { Goal } = require('./models/FinancialEntities');

const goal = await Goal.create({
  userId: 'uuid',
  name: 'House Down Payment',
  category: 'home',
  targetAmount: 2000000,
  currentAmount: 500000,
  targetDate: '2027-12-31',
  priority: 8,
  monthlyContribution: 20000
});
```

### Create Retirement Plan
```javascript
const { RetirementPlan } = require('./models/PlanningEntities');

const plan = await RetirementPlan.create({
  userId: 'uuid',
  currentAge: 35,
  retirementAge: 60,
  lifeExpectancy: 85,
  currentCorpus: 500000,
  targetCorpus: 50000000,
  monthlyContribution: 10000,
  expectedReturnPct: 12,
  inflationPct: 6,
  monthlyExpensePostRetirement: 50000
});
```

### Create Alert
```javascript
const { Alert } = require('./models/PlanningEntities');

const alert = await Alert.create({
  userId: 'uuid',
  alertType: 'savings_warning',
  priority: 'high',
  title: 'Low Savings Rate',
  message: 'Your savings rate is below 20%. Consider reducing expenses.',
  actionUrl: '/planner',
  actionLabel: 'Review Budget'
});
```

### Start AI Conversation
```javascript
const { AIConversation, AIMessage } = require('./models/AIEntities');

// Create conversation
const conv = await AIConversation.create(userId, 'Financial Planning Help');

// Add user message
const userMsg = await AIMessage.create({
  conversationId: conv.id,
  role: 'user',
  content: 'How much should I save for retirement?'
});

// Add assistant response
const aiMsg = await AIMessage.create({
  conversationId: conv.id,
  role: 'assistant',
  content: 'Based on your profile, I recommend...',
  totalTokens: 150,
  model: 'gpt-4'
});
```

---

## 🔍 Common Queries

### Get User Financial Snapshot
```javascript
const profile = await FinancialProfile.findByUserId(userId);
const activeLoans = await Loan.findByUserId(userId, { status: 'active' });
const activeGoals = await Goal.findByUserId(userId, { status: 'active' });
```

### Calculate Monthly Cash Flow
```javascript
const activeIncome = await Income.findByUserId(userId, { activeOnly: true });
const activeExpenses = await Expense.findByUserId(userId, { activeOnly: true });

const monthlyIncome = activeIncome.reduce((sum, i) => {
  if (i.frequency === 'monthly') return sum + i.amount;
  if (i.frequency === 'annual') return sum + (i.amount / 12);
  return sum;
}, 0);

const monthlyExpense = activeExpenses.reduce((sum, e) => {
  if (e.frequency === 'monthly') return sum + e.amount;
  if (e.frequency === 'annual') return sum + (e.amount / 12);
  return sum;
}, 0);

const monthlySavings = monthlyIncome - monthlyExpense;
```

### Get Investment Portfolio Summary
```javascript
const investments = await Investment.findByUserId(userId, { activeOnly: true });

const summary = investments.reduce((acc, inv) => {
  acc.totalInvested += inv.investedAmount;
  acc.totalValue += inv.currentValue;
  acc.totalReturns += inv.returns;
  return acc;
}, { totalInvested: 0, totalValue: 0, totalReturns: 0 });

summary.returnPct = (summary.totalReturns / summary.totalInvested) * 100;
```

### Get Latest Health Score
```javascript
const { FinancialHealthScore } = require('./models/PlanningEntities');
const latestScore = await FinancialHealthScore.findLatestByUserId(userId);
```

### Get Unread Alerts
```javascript
const { Alert } = require('./models/PlanningEntities');
const unreadAlerts = await Alert.findByUserId(userId, { unreadOnly: true });
```

---

## 🎯 ENUM Values Reference

### income_frequency
`monthly`, `quarterly`, `annual`, `one_time`

### expense_frequency
`daily`, `weekly`, `monthly`, `quarterly`, `annual`, `one_time`

### loan_type_enum
`home`, `car`, `personal`, `education`, `credit_card`, `other`

### loan_status
`active`, `paid_off`, `foreclosed`

### investment_type_enum
`mutual_fund`, `stock`, `bond`, `ppf`, `nps`, `real_estate`, `gold`, `crypto`, `fd`, `other`

### sip_status
`active`, `paused`, `stopped`, `completed`

### asset_type_enum
`savings_account`, `fd`, `ppf`, `nps`, `real_estate`, `gold`, `vehicle`, `other`

### goal_category_enum
`retirement`, `home`, `education`, `wealth`, `emergency`, `travel`, `wedding`, `other`

### goal_status
`planning`, `active`, `achieved`, `abandoned`

### alert_type_enum
`savings_warning`, `goal_deadline`, `investment_rebalance`, `tax_saving`, `debt_warning`, `milestone`, `emergency_fund`, `other`

### alert_priority
`low`, `medium`, `high`, `critical`

### message_role
`user`, `assistant`, `system`

---

## 🛠️ Maintenance Tasks

### Cleanup Expired Alerts
```javascript
const { Alert } = require('./models/PlanningEntities');
await Alert.cleanupExpired();
```

### Update Financial Profile (Recalculate)
```javascript
// After adding/updating income, expenses, investments, loans
const profile = await FinancialProfile.update(userId, {
  totalAssets: computedAssets,
  totalLiabilities: computedLiabilities,
  netWorth: computedAssets - computedLiabilities,
  totalMonthlyIncome: computedIncome,
  totalMonthlyExpense: computedExpense,
  monthlySavings: computedIncome - computedExpense,
  savingsRatePct: (computedSavings / computedIncome) * 100
});
```

---

## 📊 Validation Rules

### Numeric Constraints
- All amounts: `>= 0`
- Percentages: `0-100`
- Ages: `1-99`
- Priority: `1-10`
- Health scores: `0-100`

### Required Fields
- `user_id` on all tables
- `amount` on income/expense/loan/investment
- `name` on goals/investments
- `role` and `content` on AI messages

### Optional Relationships
- `sips.investment_id` can be NULL (standalone SIP)
- `alerts.expires_at` can be NULL (no expiration)

---

## 🔐 Security Notes

- All user data is CASCADE deleted on user deletion
- No PII stored in AI messages (use user_id reference)
- Alert metadata is JSONB (sanitize before storing URLs)
- Token counts tracked for cost monitoring

---

## ⚡ Performance Tips

1. **Use batch inserts** for multiple records
2. **Index coverage** — all user queries use indexes
3. **Partial indexes** — active records only (where `is_active = TRUE`)
4. **Computed profiles** — avoid JOINs on dashboard
5. **Pagination** — use LIMIT/OFFSET for large result sets

---

## 🐛 Troubleshooting

### Migration fails
```bash
# Check PostgreSQL version (need 11+)
psql --version

# Check database exists
psql -U postgres -l | grep smartfinance

# Check connection
psql -U postgres -d smartfinance -c "SELECT NOW();"
```

### Model import fails
```javascript
// Check path from backend root
const model = require('./models/FinancialProfile');  // ❌ Wrong
const model = require('../models/FinancialProfile'); // ✅ Correct (from controllers)
```

### ENUM value rejected
```sql
-- Check valid values
SELECT unnest(enum_range(NULL::loan_type_enum));
```

---

## 📚 Documentation Links

- Full Schema: `backend/db/SCHEMA.md`
- ERD Diagrams: `backend/db/ERD.md`
- Implementation: `backend/db/IMPLEMENTATION_SUMMARY.md`
- This Guide: `backend/db/QUICK_REFERENCE.md`

---

## ✅ Checklist for Next Developer

- [ ] Run migration: `node db/migrate_ai.js`
- [ ] Verify tables created: `\dt` in psql
- [ ] Test a model: Create a test record
- [ ] Review SCHEMA.md for relationships
- [ ] Review ERD.md for visual diagrams
- [ ] Understand computed profile updates
- [ ] Plan API endpoint structure
- [ ] Design sync logic for existing JSONB data

---

**Ready to build APIs and integrate AI! 🚀**
