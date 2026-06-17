const db = require("../config/db");

const COLS = `
  id, user_id,
  total_assets, total_liabilities, net_worth,
  total_monthly_income, total_monthly_expense, monthly_savings, savings_rate_pct,
  total_invested, total_investment_value, investment_returns, investment_return_pct,
  monthly_sip_amount, monthly_emi_amount,
  life_insurance_cover, health_insurance_cover,
  emergency_fund_target, emergency_fund_current,
  last_calculated_at, created_at, updated_at
`;

function format(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    totalAssets: parseFloat(row.total_assets) || 0,
    totalLiabilities: parseFloat(row.total_liabilities) || 0,
    netWorth: parseFloat(row.net_worth) || 0,
    totalMonthlyIncome: parseFloat(row.total_monthly_income) || 0,
    totalMonthlyExpense: parseFloat(row.total_monthly_expense) || 0,
    monthlySavings: parseFloat(row.monthly_savings) || 0,
    savingsRatePct: parseFloat(row.savings_rate_pct) || 0,
    totalInvested: parseFloat(row.total_invested) || 0,
    totalInvestmentValue: parseFloat(row.total_investment_value) || 0,
    investmentReturns: parseFloat(row.investment_returns) || 0,
    investmentReturnPct: parseFloat(row.investment_return_pct) || 0,
    monthlySipAmount: parseFloat(row.monthly_sip_amount) || 0,
    monthlyEmiAmount: parseFloat(row.monthly_emi_amount) || 0,
    lifeInsuranceCover: parseFloat(row.life_insurance_cover) || 0,
    healthInsuranceCover: parseFloat(row.health_insurance_cover) || 0,
    emergencyFundTarget: parseFloat(row.emergency_fund_target) || 0,
    emergencyFundCurrent: parseFloat(row.emergency_fund_current) || 0,
    lastCalculatedAt: row.last_calculated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── PERMANENT FIX ──────────────────────────────────────────────────────────
// Cast both sides to ::text so this works regardless of whether user_id is
// stored/passed as INTEGER, BIGINT, UUID, or VARCHAR, and regardless of
// whether the JS caller passes a number or a string (e.g. from JWT payload).
async function findByUserId(userId) {
  const { rows } = await db.query(
    `SELECT ${COLS} FROM financial_profiles WHERE user_id::text = $1::text`,
    [userId]
  );

  if (process.env.DEBUG_AI === "true") {
    console.log(`[FinancialProfile.findByUserId] userId=${userId} (${typeof userId}) → rows found: ${rows.length}`);
    if (rows[0]) console.log("[FinancialProfile.findByUserId] row:", rows[0]);
  }

  return format(rows[0]);
}

async function create(userId) {
  const { rows } = await db.query(
    `INSERT INTO financial_profiles (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING ${COLS}`,
    [userId]
  );
  return format(rows[0]);
}

async function update(userId, fields) {
  const allowed = {
    totalAssets: "total_assets",
    totalLiabilities: "total_liabilities",
    netWorth: "net_worth",
    totalMonthlyIncome: "total_monthly_income",
    totalMonthlyExpense: "total_monthly_expense",
    monthlySavings: "monthly_savings",
    savingsRatePct: "savings_rate_pct",
    totalInvested: "total_invested",
    totalInvestmentValue: "total_investment_value",
    investmentReturns: "investment_returns",
    investmentReturnPct: "investment_return_pct",
    monthlySipAmount: "monthly_sip_amount",
    monthlyEmiAmount: "monthly_emi_amount",
    lifeInsuranceCover: "life_insurance_cover",
    healthInsuranceCover: "health_insurance_cover",
    emergencyFundTarget: "emergency_fund_target",
    emergencyFundCurrent: "emergency_fund_current",
  };

  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const [jsKey, pgCol] of Object.entries(allowed)) {
    if (jsKey in fields && fields[jsKey] !== undefined) {
      setClauses.push(`${pgCol} = $${idx}`);
      values.push(fields[jsKey]);
      idx++;
    }
  }

  if (setClauses.length === 0) return findByUserId(userId);

  setClauses.push(`last_calculated_at = NOW()`);
  values.push(userId);

  const { rows } = await db.query(
    `UPDATE financial_profiles SET ${setClauses.join(", ")} WHERE user_id::text = $${idx}::text
     RETURNING ${COLS}`,
    values
  );
  return format(rows[0]);
}

async function remove(userId) {
  await db.query(`DELETE FROM financial_profiles WHERE user_id::text = $1::text`, [userId]);
}

module.exports = { findByUserId, create, update, remove };