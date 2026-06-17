# Financial Intelligence Engine — Quick Start Guide

## 🚀 Quick Start (5 minutes)

### 1. Import the Service
```javascript
const {
  calculateNetWorth,
  calculateBudgetHealth,
  calculateFinancialHealthScore
} = require('./services/financialIntelligence');
```

### 2. Call a Function
```javascript
const userId = 'user-uuid-here';
const result = await calculateFinancialHealthScore(userId);
console.log(result);
```

### 3. Done! 🎉
That's it. No setup, no configuration.

---

## 📖 Common Use Cases

### Use Case 1: Dashboard Widget
**Show user's financial health score**

```javascript
const { calculateFinancialHealthScore } = require('./services/financialIntelligence');

async function getHealthWidget(userId) {
  const health = await calculateFinancialHealthScore(userId);
  return {
    score: health.overallScore,
    grade: health.grade,
    topStrength: health.strengths[0] || 'Keep going!',
    topRecommendation: health.recommendations[0] || 'Doing great!'
  };
}
```

---

### Use Case 2: Purchase Decision
**Can user afford this purchase?**

```javascript
const { calculateAffordability } = require('./services/financialIntelligence');

async function checkPurchase(userId, amount, type = 'one_time') {
  const result = await calculateAffordability(userId, amount, type);
  
  return {
    canBuy: result.canAfford && 
            (type === 'emi' ? result.acceptable : result.emergencyFundImpact.acceptable),
    message: result.recommendation
  };
}
```

---

### Use Case 3: Goal Alert
**Alert user when goal is behind schedule**

```javascript
const { calculateGoalProgress } = require('./services/financialIntelligence');

async function checkGoalAlerts(userId) {
  const goals = await calculateGoalProgress(userId);
  const alerts = [];
  
  goals.forEach(goal => {
    if (goal.status === 'behind') {
      const needed = goal.monthlyNeeded - goal.currentContribution;
      alerts.push({
        goalName: goal.name,
        message: `Increase monthly contribution by ₹${needed.toLocaleString('en-IN')} to stay on track`
      });
    }
  });
  
  return alerts;
}
```

---

### Use Case 4: Budget Report
**Monthly budget health report**

```javascript
const { calculateBudgetHealth } = require('./services/financialIntelligence');

async function generateBudgetReport(userId) {
  const budget = await calculateBudgetHealth(userId);
  
  return {
    income: budget.monthlyIncome,
    spent: budget.totalOutflow,
    saved: budget.monthlySavings,
    savingsRate: budget.savingsRate,
    status: budget.status,
    warning: budget.savingsRate < 20 ? 'Low savings rate!' : null,
    topExpense: Object.entries(budget.categoryBreakdown)
      .sort((a, b) => b[1] - a[1])[0]
  };
}
```

---

### Use Case 5: Retirement Planner
**Show retirement readiness**

```javascript
const { calculateRetirementCorpus } = require('./services/financialIntelligence');

async function getRetirementStatus(userId) {
  const plan = await calculateRetirementCorpus(userId);
  
  if (plan.error) return { error: plan.error };
  
  return {
    onTrack: plan.isSufficient,
    yearsLeft: plan.yearsToRetirement,
    gap: plan.corpusGap,
    action: plan.isSufficient 
      ? 'You\'re on track!' 
      : `Increase monthly SIP by ₹${plan.additionalSIPNeeded.toLocaleString('en-IN')}`
  };
}
```

---

## 🔧 All Available Functions

| Function | Input | Output |
|----------|-------|--------|
| `calculateNetWorth(userId)` | User ID | Net worth breakdown |
| `calculateDebtToIncomeRatio(userId)` | User ID | DTI ratio + status |
| `calculateEmergencyFund(userId, months?)` | User ID, target months (default 6) | Coverage analysis |
| `calculateBudgetHealth(userId)` | User ID | Income/expense breakdown |
| `calculateGoalProgress(userId)` | User ID | Array of goal progress |
| `calculateInvestmentGrowth(userId)` | User ID | Portfolio performance |
| `calculateRetirementCorpus(userId, params?)` | User ID, optional overrides | Corpus projection |
| `calculateRiskProfile(userId)` | User ID | Risk assessment |
| `calculateAffordability(userId, amount, type)` | User ID, amount, 'one_time' or 'emi' | Affordability check |
| `calculateFinancialHealthScore(userId)` | User ID | Overall health score |

---

## 📊 Return Value Cheat Sheet

### Financial Health Score
```javascript
{
  overallScore: 72.5,          // 0-100
  grade: "B",                  // A/B/C/D
  scores: { /* component scores */ },
  strengths: ["..."],
  weaknesses: ["..."],
  recommendations: ["..."]
}
```

### Net Worth
```javascript
{
  totalAssets: 5000000,
  totalLiabilities: 2000000,
  netWorth: 3000000,
  breakdown: { investments, sips, assets, loans }
}
```

### Budget Health
```javascript
{
  monthlyIncome: 75000,
  monthlyExpense: 40000,
  monthlySavings: 20000,
  savingsRate: 26.67,
  status: "healthy",           // healthy/moderate/poor
  categoryBreakdown: { /* ... */ }
}
```

### Affordability (One-Time)
```javascript
{
  canAfford: true,
  liquidAssets: 200000,
  emergencyFundImpact: {
    current: 6.7,
    after: 3.3,
    acceptable: true
  },
  recommendation: "..."
}
```

### Goal Progress
```javascript
[{
  name: "House Down Payment",
  progress: 25.0,
  gap: 1500000,
  monthlyNeeded: 35714,
  onTrack: true,
  status: "on_track"           // achieved/on_track/behind
}]
```

---

## 🎯 Pro Tips

### Tip 1: Batch Requests
Use `Promise.all()` for multiple calculations:

```javascript
const [health, budget, netWorth] = await Promise.all([
  calculateFinancialHealthScore(userId),
  calculateBudgetHealth(userId),
  calculateNetWorth(userId)
]);
```

### Tip 2: Cache Results
Cache expensive calculations for 5-10 minutes:

```javascript
const cache = new Map();

async function getCachedHealth(userId) {
  const key = `health:${userId}`;
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < 300000) {
    return cached.data;
  }
  
  const data = await calculateFinancialHealthScore(userId);
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### Tip 3: Error Handling
Always wrap in try-catch:

```javascript
async function safeCalculate(userId) {
  try {
    return await calculateFinancialHealthScore(userId);
  } catch (error) {
    console.error('Calculation failed:', error);
    return { error: 'Unable to calculate health score' };
  }
}
```

### Tip 4: Validate User ID
Use validator before calling:

```javascript
const { validateUserId } = require('./services/validators');

async function calculate(userId) {
  const check = validateUserId(userId);
  if (!check.valid) {
    return { error: check.error };
  }
  
  return await calculateFinancialHealthScore(userId);
}
```

---

## ⚡ Performance Tips

1. **Run in parallel** — Use `Promise.all()` for independent calculations
2. **Cache aggressively** — Most metrics don't change minute-to-minute
3. **Paginate goals** — If user has 50+ goals, paginate `calculateGoalProgress()`
4. **Index database** — All indexes are already created by migration
5. **Use activeOnly filters** — Always filter inactive records

---

## 🐛 Troubleshooting

### "User not found" / Empty results
- Check user ID is correct UUID format
- Ensure user has data in tables (income, expenses, investments, etc.)
- Run test data seeding if needed

### Zero values everywhere
- User hasn't completed onboarding
- No financial records in database
- Check `is_active` flags on records

### "Cannot read property of undefined"
- Likely missing retirement plan — check with `RetirementPlan.findByUserId()`
- Use optional chaining: `plan?.currentAge`

### Slow performance
- Check database indexes: `EXPLAIN ANALYZE` queries
- Cache results for 5-10 minutes
- Use `activeOnly: true` filters

---

## 📚 Full Documentation

- **API Reference**: `backend/services/README.md`
- **Implementation Details**: `backend/services/IMPLEMENTATION_SUMMARY.md`
- **Test Examples**: `backend/services/tests/financialIntelligence.test.js`

---

## ✅ Checklist

Before using in production:

- [ ] Database migrated (`node db/migrate_ai.js`)
- [ ] User has financial records (income, expenses, etc.)
- [ ] Error handling in place
- [ ] Results cached (optional but recommended)
- [ ] Tested with real user data

---

## 🚀 Next: Build Your Feature

```javascript
// 1. Import what you need
const { calculateFinancialHealthScore } = require('./services/financialIntelligence');

// 2. Call it
const result = await calculateFinancialHealthScore(userId);

// 3. Use the result
console.log(`Your financial health: ${result.grade} (${result.overallScore}/100)`);
```

**That's it! Start building. 🎉**
