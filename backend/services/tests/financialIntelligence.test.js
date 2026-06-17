// ── Financial Intelligence Engine — Test Examples ─────────────────────────────
// Run with: node services/tests/financialIntelligence.test.js

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
  _helpers,
} = require("../financialIntelligence");

// ── Mock User ID ──────────────────────────────────────────────────────────────
const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

// ── Test: Helper Functions ────────────────────────────────────────────────────
async function testHelpers() {
  console.log("\n=== Testing Helper Functions ===\n");

  const tests = [
    { amount: 1000, freq: "daily", expected: 365000 },
    { amount: 1000, freq: "weekly", expected: 52000 },
    { amount: 1000, freq: "monthly", expected: 12000 },
    { amount: 1000, freq: "quarterly", expected: 4000 },
    { amount: 1000, freq: "annual", expected: 1000 },
  ];

  tests.forEach((test) => {
    const result = _helpers.annualizeAmount(test.amount, test.freq);
    console.log(
      `✓ Annualize ${test.amount} (${test.freq}): ${result} ${
        result === test.expected ? "✓" : "✗ FAILED"
      }`
    );
  });

  const monthlyTests = [
    { amount: 12000, freq: "annual", expected: 1000 },
    { amount: 5000, freq: "monthly", expected: 5000 },
    { amount: 100, freq: "daily", expected: 3041.67 }, // 100 * 365 / 12
  ];

  monthlyTests.forEach((test) => {
    const result = _helpers.toMonthly(test.amount, test.freq);
    console.log(
      `✓ To Monthly ${test.amount} (${test.freq}): ${result.toFixed(2)} (expected ~${
        test.expected
      })`
    );
  });
}

// ── Test: Net Worth ───────────────────────────────────────────────────────────
async function testNetWorth() {
  console.log("\n=== Testing Net Worth Calculation ===\n");

  try {
    const result = await calculateNetWorth(TEST_USER_ID);
    console.log("Net Worth Result:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n✓ Total Assets:", result.totalAssets);
    console.log("✓ Total Liabilities:", result.totalLiabilities);
    console.log("✓ Net Worth:", result.netWorth);

    if (result.netWorth === result.totalAssets - result.totalLiabilities) {
      console.log("✓ Calculation verified!");
    } else {
      console.log("✗ Calculation mismatch!");
    }
  } catch (err) {
    console.error("✗ Test failed:", err.message);
  }
}

// ── Test: Debt-to-Income Ratio ────────────────────────────────────────────────
async function testDebtToIncome() {
  console.log("\n=== Testing Debt-to-Income Ratio ===\n");

  try {
    const result = await calculateDebtToIncomeRatio(TEST_USER_ID);
    console.log("Debt-to-Income Result:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n✓ Monthly Income:", result.monthlyIncome);
    console.log("✓ Monthly Debt:", result.monthlyDebt);
    console.log("✓ Ratio:", result.ratio + "%");
    console.log("✓ Status:", result.status);

    if (result.ratio < 36) {
      console.log("✓ HEALTHY: Debt ratio is below 36%");
    } else if (result.ratio < 50) {
      console.log("⚠ MODERATE: Debt ratio is between 36-50%");
    } else {
      console.log("✗ HIGH RISK: Debt ratio exceeds 50%");
    }
  } catch (err) {
    console.error("✗ Test failed:", err.message);
  }
}

// ── Test: Emergency Fund ──────────────────────────────────────────────────────
async function testEmergencyFund() {
  console.log("\n=== Testing Emergency Fund ===\n");

  try {
    const result = await calculateEmergencyFund(TEST_USER_ID, 6);
    console.log("Emergency Fund Result:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n✓ Monthly Expense:", result.monthlyExpense);
    console.log("✓ Target Coverage:", result.targetMonths, "months");
    console.log("✓ Target Amount:", result.targetAmount);
    console.log("✓ Current Amount:", result.currentAmount);
    console.log("✓ Coverage:", result.coverageMonths, "months");
    console.log("✓ Gap:", result.gap);
    console.log("✓ Status:", result.status);

    if (result.isSufficient) {
      console.log("✓ EXCELLENT: Emergency fund is sufficient!");
    } else {
      console.log(
        "⚠ WARNING: Need to save additional ₹" + result.gap.toLocaleString("en-IN")
      );
    }
  } catch (err) {
    console.error("✗ Test failed:", err.message);
  }
}

// ── Test: Budget Health ───────────────────────────────────────────────────────
async function testBudgetHealth() {
  console.log("\n=== Testing Budget Health ===\n");

  try {
    const result = await calculateBudgetHealth(TEST_USER_ID);
    console.log("Budget Health Result:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n✓ Monthly Income:", result.monthlyIncome);
    console.log("✓ Monthly Expense:", result.monthlyExpense);
    console.log("✓ Monthly EMI:", result.monthlyEMI);
    console.log("✓ Total Outflow:", result.totalOutflow);
    console.log("✓ Monthly Savings:", result.monthlySavings);
    console.log("✓ Savings Rate:", result.savingsRate + "%");
    console.log("✓ Status:", result.status);

    if (result.savingsRate >= 20) {
      console.log("✓ HEALTHY: Savings rate is above 20%");
    } else {
      console.log("⚠ WARNING: Savings rate is below 20%");
      console.log("Recommendations:", result.recommendations);
    }
  } catch (err) {
    console.error("✗ Test failed:", err.message);
  }
}

// ── Test: Goal Progress ───────────────────────────────────────────────────────
async function testGoalProgress() {
  console.log("\n=== Testing Goal Progress ===\n");

  try {
    const result = await calculateGoalProgress(TEST_USER_ID);
    console.log("Goal Progress Result:");
    console.log(JSON.stringify(result, null, 2));

    result.forEach((goal, idx) => {
      console.log(`\n✓ Goal ${idx + 1}: ${goal.name}`);
      console.log("  Category:", goal.category);
      console.log("  Progress:", goal.progress + "%");
      console.log("  Gap: ₹" + goal.gap.toLocaleString("en-IN"));
      console.log("  Months Remaining:", goal.monthsRemaining);
      console.log("  Monthly Needed: ₹" + goal.monthlyNeeded.toLocaleString("en-IN"));
      console.log("  Current Contribution: ₹" + goal.currentContribution.toLocaleString("en-IN"));
      console.log("  Status:", goal.status);

      if (goal.onTrack) {
        console.log("  ✓ ON TRACK");
      } else {
        console.log("  ⚠ BEHIND SCHEDULE");
      }
    });
  } catch (err) {
    console.error("✗ Test failed:", err.message);
  }
}

// ── Test: Investment Growth ───────────────────────────────────────────────────
async function testInvestmentGrowth() {
  console.log("\n=== Testing Investment Growth ===\n");

  try {
    const result = await calculateInvestmentGrowth(TEST_USER_ID);
    console.log("Investment Growth Result:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n✓ Total Invested:", result.totalInvested);
    console.log("✓ Total Value:", result.totalValue);
    console.log("✓ Total Returns:", result.totalReturns);
    console.log("✓ Return %:", result.returnPct + "%");
    console.log("✓ Monthly SIP:", result.monthlySIP);
    console.log("✓ Diversification:", result.diversificationScore);

    if (result.returnPct > 0) {
      console.log("✓ POSITIVE RETURNS!");
    } else if (result.returnPct < 0) {
      console.log("⚠ NEGATIVE RETURNS");
    }
  } catch (err) {
    console.error("✗ Test failed:", err.message);
  }
}

// ── Test: Retirement Corpus ───────────────────────────────────────────────────
async function testRetirementCorpus() {
  console.log("\n=== Testing Retirement Corpus ===\n");

  try {
    const result = await calculateRetirementCorpus(TEST_USER_ID);
    console.log("Retirement Corpus Result:");
    console.log(JSON.stringify(result, null, 2));

    if (result.error) {
      console.log("⚠", result.error);
    } else {
      console.log("\n✓ Current Age:", result.currentAge);
      console.log("✓ Retirement Age:", result.retirementAge);
      console.log("✓ Years to Retirement:", result.yearsToRetirement);
      console.log("✓ Current Corpus:", result.currentCorpus);
      console.log("✓ Projected Corpus:", result.projectedCorpus);
      console.log("✓ Required Corpus:", result.requiredCorpus);
      console.log("✓ Gap:", result.corpusGap);

      if (result.isSufficient) {
        console.log("✓ SUFFICIENT: You're on track!");
      } else {
        console.log("⚠ INSUFFICIENT: Need additional ₹" + result.corpusGap.toLocaleString("en-IN"));
        console.log(
          "  Increase monthly SIP by ₹" + result.additionalSIPNeeded.toLocaleString("en-IN")
        );
      }
    }
  } catch (err) {
    console.error("✗ Test failed:", err.message);
  }
}

// ── Test: Risk Profile ────────────────────────────────────────────────────────
async function testRiskProfile() {
  console.log("\n=== Testing Risk Profile ===\n");

  try {
    const result = await calculateRiskProfile(TEST_USER_ID);
    console.log("Risk Profile Result:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n✓ Risk Score:", result.riskScore + "/100");
    console.log("✓ Risk Category:", result.riskCategory);
    console.log("✓ Asset Allocation:");
    console.log("  - Equity:", result.allocation.equity + "%");
    console.log("  - Debt:", result.allocation.debt + "%");
    console.log("  - Alternative:", result.allocation.alternative + "%");
  } catch (err) {
    console.error("✗ Test failed:", err.message);
  }
}

// ── Test: Affordability ───────────────────────────────────────────────────────
async function testAffordability() {
  console.log("\n=== Testing Affordability ===\n");

  try {
    // Test one-time purchase
    console.log("\n--- One-Time Purchase (₹50,000) ---");
    const oneTime = await calculateAffordability(TEST_USER_ID, 50000, "one_time");
    console.log(JSON.stringify(oneTime, null, 2));

    if (oneTime.canAfford) {
      console.log("✓ AFFORDABLE");
    } else {
      console.log("✗ NOT AFFORDABLE");
    }
    console.log("Recommendation:", oneTime.recommendation);

    // Test EMI
    console.log("\n--- EMI Purchase (₹15,000/month) ---");
    const emi = await calculateAffordability(TEST_USER_ID, 15000, "emi");
    console.log(JSON.stringify(emi, null, 2));

    if (emi.canAfford) {
      console.log("✓ AFFORDABLE");
    } else {
      console.log("✗ NOT AFFORDABLE");
    }
    console.log("Recommendation:", emi.recommendation);
  } catch (err) {
    console.error("✗ Test failed:", err.message);
  }
}

// ── Test: Financial Health Score ──────────────────────────────────────────────
async function testFinancialHealthScore() {
  console.log("\n=== Testing Financial Health Score ===\n");

  try {
    const result = await calculateFinancialHealthScore(TEST_USER_ID);
    console.log("Financial Health Score Result:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n✓ Overall Score:", result.overallScore + "/100");
    console.log("✓ Grade:", result.grade);

    console.log("\n✓ Component Scores:");
    console.log("  - Net Worth:", result.scores.netWorthScore);
    console.log("  - Savings Rate:", result.scores.savingsRateScore);
    console.log("  - Debt:", result.scores.debtScore);
    console.log("  - Investment:", result.scores.investmentScore);
    console.log("  - Emergency Fund:", result.scores.emergencyFundScore);
    console.log("  - Insurance:", result.scores.insuranceScore);
    console.log("  - Goal Progress:", result.scores.goalProgressScore);

    console.log("\n✓ Strengths:");
    result.strengths.forEach((s) => console.log("  +", s));

    console.log("\n⚠ Weaknesses:");
    result.weaknesses.forEach((w) => console.log("  -", w));

    console.log("\n💡 Recommendations:");
    result.recommendations.forEach((r) => console.log("  •", r));
  } catch (err) {
    console.error("✗ Test failed:", err.message);
  }
}

// ── Run All Tests ─────────────────────────────────────────────────────────────
async function runAllTests() {
  console.log("\n".repeat(2));
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║   SmartFinance Financial Intelligence Engine — Test Suite     ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");

  console.log("\n⚠ NOTE: These tests require:");
  console.log("  1. PostgreSQL running");
  console.log("  2. AI database tables migrated");
  console.log("  3. Test user with ID:", TEST_USER_ID);
  console.log("  4. Sample data (income, expenses, investments, loans, goals)");
  console.log("\n  If tables are empty, most tests will return zero values.\n");

  try {
    await testHelpers();
    await testNetWorth();
    await testDebtToIncome();
    await testEmergencyFund();
    await testBudgetHealth();
    await testGoalProgress();
    await testInvestmentGrowth();
    await testRetirementCorpus();
    await testRiskProfile();
    await testAffordability();
    await testFinancialHealthScore();

    console.log("\n".repeat(2));
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║                  All Tests Completed!                         ║");
    console.log("╚════════════════════════════════════════════════════════════════╝");
    console.log("\n");
  } catch (err) {
    console.error("\n✗ Test Suite Failed:", err);
  } finally {
    process.exit(0);
  }
}

// ── Run if executed directly ──────────────────────────────────────────────────
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testHelpers,
  testNetWorth,
  testDebtToIncome,
  testEmergencyFund,
  testBudgetHealth,
  testGoalProgress,
  testInvestmentGrowth,
  testRetirementCorpus,
  testRiskProfile,
  testAffordability,
  testFinancialHealthScore,
  runAllTests,
};
