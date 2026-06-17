#!/usr/bin/env node
// ── AI Wealth Assistant Test Script ───────────────────────────────────────────
// Quick verification that all tools work correctly

const tools = require("./tools/financialTools");

// ANSI colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function testTool(name, fn, ...args) {
  try {
    log(colors.cyan, `\n📊 Testing: ${name}`);
    const result = await fn(...args);
    
    if (result.error) {
      log(colors.yellow, `⚠️  ${name}: ${result.error}`);
      return false;
    }
    
    log(colors.green, `✅ ${name}: Success`);
    console.log(JSON.stringify(result, null, 2).substring(0, 500) + "...");
    return true;
  } catch (err) {
    log(colors.red, `❌ ${name}: ${err.message}`);
    return false;
  }
}

async function runTests() {
  // Get user ID from command line or use test UUID
  const userId = process.argv[2] || "550e8400-e29b-41d4-a716-446655440000";
  
  log(colors.blue, "\n🚀 SmartFinance AI Wealth Assistant - Tool Test\n");
  log(colors.cyan, `Testing with userId: ${userId}\n`);
  log(colors.yellow, "Note: This requires database migration and test data.\n");

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  // Test each tool
  const tests = [
    ["getFinancialProfile", () => tools.getFinancialProfile(userId)],
    ["getInvestmentSummary", () => tools.getInvestmentSummary(userId)],
    ["getLoanSummary", () => tools.getLoanSummary(userId)],
    ["calculateHealthScore", () => tools.calculateHealthScore(userId)],
    ["budgetAnalysis", () => tools.budgetAnalysis(userId)],
    ["goalAnalysis", () => tools.goalAnalysis(userId)],
    ["retirementAnalysis", () => tools.retirementAnalysis(userId)],
    ["riskAnalysis", () => tools.riskAnalysis(userId)],
    ["emergencyFundCheck", () => tools.emergencyFundCheck(userId)],
    ["affordabilityCheck", () => tools.affordabilityCheck(userId, 50000, "one_time")],
    ["wealthForecast", () => tools.wealthForecast(userId, 10)],
    ["whatIfSimulator", () => tools.whatIfSimulator(userId, { incomeChange: 10000 })],
  ];

  for (const [name, fn] of tests) {
    const success = await testTool(name, fn);
    if (success) results.passed++;
    else results.failed++;
  }

  // Summary
  log(colors.blue, "\n" + "═".repeat(60));
  log(colors.blue, "📊 Test Summary");
  log(colors.blue, "═".repeat(60));
  log(colors.green, `✅ Passed: ${results.passed}`);
  log(colors.red, `❌ Failed: ${results.failed}`);
  log(colors.yellow, `⚠️  Skipped: ${results.skipped}`);
  
  const total = results.passed + results.failed + results.skipped;
  const percentage = total > 0 ? Math.round((results.passed / total) * 100) : 0;
  
  log(colors.cyan, `\n📈 Success Rate: ${percentage}%\n`);

  if (results.failed === 0 && results.passed > 0) {
    log(colors.green, "🎉 All tests passed! AI system is ready.");
    process.exit(0);
  } else if (results.passed === 0) {
    log(colors.red, "❌ All tests failed. Check database migration and test data.");
    log(colors.yellow, "\nRun: node db/migrate_ai.js");
    log(colors.yellow, "Then: node db/seed.js (if you have seed script)");
    process.exit(1);
  } else {
    log(colors.yellow, "⚠️  Some tests failed. System partially functional.");
    process.exit(1);
  }
}

// Run tests
runTests().catch((err) => {
  log(colors.red, "\n❌ Fatal error:", err.message);
  console.error(err);
  process.exit(1);
});
