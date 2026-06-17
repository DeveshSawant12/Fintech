// ── AI Financial Tools Layer ──────────────────────────────────────────────────
// Wrapper functions for LLM consumption — abstracts database access

const {
  calculateNetWorth,
  calculateDebtToIncomeRatio,
  calculateEmergencyFund,
  calculateBudgetHealth,
  calculateGoalProgress,
  calculateInvestmentGrowth,
  calculateRetirementCorpus,
  calculateRiskProfile,
  calculateAffordability,
  calculateFinancialHealthScore,
} = require("../../services/financialIntelligence");

const {
  calculateSIPFutureValue,
  calculateFutureValue,
  suggestAssetAllocation,
  calculateFINumber,
} = require("../../services/financialUtils");

const User = require("../../models/User");
const Loan = require("../../models/Loan");
const Income = require("../../models/Income");
const Investment = require("../../models/Investment");

// ── Tool 1: Get Financial Profile ─────────────────────────────────────────────
async function getFinancialProfile(userId) {
  const [user, netWorth, budget, emergency] = await Promise.all([
    User.findById(userId),
    calculateNetWorth(userId),
    calculateBudgetHealth(userId),
    calculateEmergencyFund(userId),
  ]);

  return {
    personal: {
      name: user?.fullName || "User",
      age: user?.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : null,
      occupation: user?.occupation,
      city: user?.location?.city,
    },
    netWorth: {
      total: netWorth.netWorth,
      assets: netWorth.totalAssets,
      liabilities: netWorth.totalLiabilities,
    },
    monthly: {
      income: budget.monthlyIncome,
      expense: budget.monthlyExpense,
      savings: budget.monthlySavings,
      savingsRate: budget.savingsRate,
    },
    emergencyFund: {
      coverage: emergency.coverageMonths,
      status: emergency.status,
    },
  };
}

// ── Tool 2: Get Investment Summary ────────────────────────────────────────────
async function getInvestmentSummary(userId) {
  const growth = await calculateInvestmentGrowth(userId);
  return {
    portfolio: {
      totalInvested: growth.totalInvested,
      currentValue: growth.totalValue,
      returns: growth.totalReturns,
      returnPct: growth.returnPct,
    },
    monthlySIP: growth.monthlySIP,
    diversification: growth.diversificationScore,
    byType: growth.byType,
  };
}

// ── Tool 3: Get Loan Summary ──────────────────────────────────────────────────
async function getLoanSummary(userId) {
  const [loans, debtRatio] = await Promise.all([
    Loan.findByUserId(userId, { status: "active" }),
    calculateDebtToIncomeRatio(userId),
  ]);

  return {
    totalLoans: loans.length,
    totalOutstanding: loans.reduce((s, l) => s + l.outstandingAmount, 0),
    totalEMI: loans.reduce((s, l) => s + l.emi, 0),
    debtToIncomeRatio: debtRatio.ratio,
    status: debtRatio.status,
    loans: loans.map((l) => ({
      type: l.loanType,
      outstanding: l.outstandingAmount,
      emi: l.emi,
      rate: l.interestRatePct,
    })),
  };
}

// ── Tool 4: Calculate Health Score ────────────────────────────────────────────
async function calculateHealthScore(userId) {
  const health = await calculateFinancialHealthScore(userId);
  return {
    score: health.overallScore,
    grade: health.grade,
    breakdown: health.scores,
    strengths: health.strengths,
    weaknesses: health.weaknesses,
    recommendations: health.recommendations,
  };
}

// ── Tool 5: Budget Analysis ───────────────────────────────────────────────────
async function budgetAnalysis(userId) {
  const budget = await calculateBudgetHealth(userId);
  return {
    income: budget.monthlyIncome,
    expenses: budget.monthlyExpense,
    savings: budget.monthlySavings,
    savingsRate: budget.savingsRate,
    status: budget.status,
    categoryBreakdown: budget.categoryBreakdown,
    recommendations: budget.recommendations,
  };
}

// ── Tool 6: Goal Analysis ─────────────────────────────────────────────────────
async function goalAnalysis(userId) {
  const goals = await calculateGoalProgress(userId);
  return {
    totalGoals: goals.length,
    onTrack: goals.filter((g) => g.onTrack).length,
    goals: goals.map((g) => ({
      name: g.name,
      progress: g.progress,
      gap: g.gap,
      monthlyNeeded: g.monthlyNeeded,
      currentContribution: g.currentContribution,
      status: g.status,
    })),
  };
}

// ── Tool 7: Retirement Analysis ───────────────────────────────────────────────
async function retirementAnalysis(userId) {
  const result = await calculateRetirementCorpus(userId);
  if (result.error) return result;

  return {
    currentAge: result.currentAge,
    retirementAge: result.retirementAge,
    projectedCorpus: result.projectedCorpus,
    requiredCorpus: result.requiredCorpus,
    gap: result.corpusGap,
    sufficient: result.isSufficient,
    additionalSIPNeeded: result.additionalSIPNeeded,
  };
}

// ── Tool 8: Risk Analysis ─────────────────────────────────────────────────────
async function riskAnalysis(userId) {
  const risk = await calculateRiskProfile(userId);
  return {
    score: risk.riskScore,
    category: risk.riskCategory,
    allocation: risk.allocation,
    factors: risk.factors,
  };
}

// ── Tool 9: Emergency Fund Check ──────────────────────────────────────────────
async function emergencyFundCheck(userId) {
  const emergency = await calculateEmergencyFund(userId);
  return {
    currentAmount: emergency.currentAmount,
    targetAmount: emergency.targetAmount,
    coverage: emergency.coverageMonths,
    gap: emergency.gap,
    status: emergency.status,
    sufficient: emergency.isSufficient,
  };
}

// ── Tool 10: Affordability Check ──────────────────────────────────────────────
async function affordabilityCheck(userId, amount, type = "one_time") {
  const result = await calculateAffordability(userId, amount, type);
  return {
    canAfford: result.canAfford,
    recommendation: result.recommendation,
    details: result,
  };
}

// ── Tool 11: Wealth Forecast ──────────────────────────────────────────────────
async function wealthForecast(userId, years = 10) {
  const [netWorth, growth, budget] = await Promise.all([
    calculateNetWorth(userId),
    calculateInvestmentGrowth(userId),
    calculateBudgetHealth(userId),
  ]);

  const currentWealth = netWorth.netWorth;
  const growthRate = 12;
  const existingFV = calculateFutureValue(currentWealth, growthRate, years);
  const sipFV = growth.monthlySIP > 0 ? calculateSIPFutureValue(growth.monthlySIP, growthRate, years) : 0;

  return {
    currentWealth,
    projectedWealth: Math.round(existingFV + sipFV),
    years,
    growthRate,
    monthlySIP: growth.monthlySIP,
  };
}

// ── Tool 12: What-If Simulator ────────────────────────────────────────────────
async function whatIfSimulator(userId, changes) {
  const budget = await calculateBudgetHealth(userId);

  const baseline = {
    income: budget.monthlyIncome,
    expense: budget.monthlyExpense,
    savings: budget.monthlySavings,
    savingsRate: budget.savingsRate,
  };

  const modified = { ...baseline };
  if (changes.incomeChange) modified.income += changes.incomeChange;
  if (changes.expenseChange) modified.expense += changes.expenseChange;

  modified.savings = modified.income - modified.expense;
  modified.savingsRate = (modified.savings / modified.income) * 100;

  return {
    baseline,
    modified,
    impact: {
      savingsChange: modified.savings - baseline.savings,
      savingsRateChange: modified.savingsRate - baseline.savingsRate,
    },
  };
}

// ── Tool 13: Loan Advisor ────────────────────────────────────────────────────
async function loanAdvisor(userId) {
  const [loans, debtRatio, budget] = await Promise.all([
    Loan.findByUserId(userId, { status: "active" }),
    calculateDebtToIncomeRatio(userId),
    calculateBudgetHealth(userId),
  ]);

  const sorted = [...loans].sort((a, b) => b.interestRatePct - a.interestRatePct);

  return {
    debtHealth: {
      ratio: debtRatio.ratio,
      status: debtRatio.status,
      monthlyDebt: debtRatio.monthlyDebt,
    },
    loans: sorted.map((l) => ({
      type: l.loanType,
      outstanding: l.outstandingAmount,
      emi: l.emi,
      rate: l.interestRatePct,
      priority: l.interestRatePct > 10 ? "high" : l.interestRatePct > 7 ? "medium" : "low",
    })),
    strategy: "Pay off highest interest loans first (debt avalanche)",
    extraPayment: Math.round(budget.monthlySavings * 0.5),
  };
}

// ── Tool 14: Investment Advisor ───────────────────────────────────────────────
async function investmentAdvisor(userId) {
  const [user, growth, risk] = await Promise.all([
    User.findById(userId),
    calculateInvestmentGrowth(userId),
    calculateRiskProfile(userId),
  ]);

  const age = user?.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : 35;
  const { suggestAssetAllocation } = require("../../services/financialUtils");
  const ideal = suggestAssetAllocation(age, risk.riskCategory);

  return {
    current: {
      portfolio: growth.totalValue,
      returns: growth.returnPct,
      allocation: risk.allocation,
    },
    recommended: {
      allocation: ideal,
      reasoning: `Based on age ${age} and ${risk.riskCategory} risk profile`,
    },
    gaps: {
      equity: ideal.equity - risk.allocation.equity,
      debt: ideal.debt - risk.allocation.debt,
    },
  };
}

// ── Tool 15: Tax Planner ──────────────────────────────────────────────────────
async function taxPlanner(userId) {
  const [incomes, investments, loans] = await Promise.all([
    Income.findByUserId(userId, { activeOnly: true }),
    Investment.findByUserId(userId, { activeOnly: true }),
    Loan.findByUserId(userId, { status: "active" }),
  ]);

  const annualIncome = incomes.reduce((s, i) => s + (i.frequency === "monthly" ? i.amount * 12 : i.amount), 0);
  const section80C = Math.min(investments.filter(i => ["ppf", "nps", "mutual_fund"].includes(i.investmentType)).reduce((s, i) => s + i.investedAmount, 0), 150000);
  const homeLoan = Math.min(loans.filter(l => l.loanType === "home").reduce((s, l) => s + (l.outstandingAmount * l.interestRatePct / 100), 0), 200000);

  return {
    annualIncome: Math.round(annualIncome),
    deductions: {
      section80C,
      remaining80C: Math.max(0, 150000 - section80C),
      homeLoanInterest: Math.round(homeLoan),
    },
    taxSaving: Math.round((section80C + homeLoan) * 0.3),
  };
}

module.exports = {
  getFinancialProfile,
  getInvestmentSummary,
  getLoanSummary,
  calculateHealthScore,
  budgetAnalysis,
  goalAnalysis,
  retirementAnalysis,
  riskAnalysis,
  emergencyFundCheck,
  affordabilityCheck,
  wealthForecast,
  whatIfSimulator,
  loanAdvisor,
  investmentAdvisor,
  taxPlanner,
};
