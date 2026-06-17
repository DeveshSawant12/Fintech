const db = require("../config/db");

// ── RetirementPlan Model ──────────────────────────────────────────────────────

const RETIREMENT_COLS = `
  id, user_id,
  current_age, retirement_age, life_expectancy,
  current_corpus, target_corpus,
  monthly_contribution, expected_return_pct, inflation_pct,
  monthly_expense_post_retirement,
  projected_corpus, corpus_gap,
  last_calculated_at, created_at, updated_at
`;

function formatRetirement(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    currentAge: row.current_age,
    retirementAge: row.retirement_age,
    lifeExpectancy: row.life_expectancy,
    currentCorpus: parseFloat(row.current_corpus) || 0,
    targetCorpus: parseFloat(row.target_corpus),
    monthlyContribution: parseFloat(row.monthly_contribution) || 0,
    expectedReturnPct: parseFloat(row.expected_return_pct) || 10,
    inflationPct: parseFloat(row.inflation_pct) || 6,
    monthlyExpensePostRetirement: parseFloat(row.monthly_expense_post_retirement) || 0,
    projectedCorpus: parseFloat(row.projected_corpus) || 0,
    corpusGap: parseFloat(row.corpus_gap) || 0,
    lastCalculatedAt: row.last_calculated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const RetirementPlan = {
  async findByUserId(userId) {
    const { rows } = await db.query(
      `SELECT ${RETIREMENT_COLS} FROM retirement_plans WHERE user_id = $1`,
      [userId]
    );
    return formatRetirement(rows[0]);
  },

  async create(data) {
    const {
      userId, currentAge, retirementAge, lifeExpectancy,
      currentCorpus, targetCorpus, monthlyContribution,
      expectedReturnPct, inflationPct, monthlyExpensePostRetirement
    } = data;

    const { rows } = await db.query(
      `INSERT INTO retirement_plans
         (user_id, current_age, retirement_age, life_expectancy,
          current_corpus, target_corpus, monthly_contribution,
          expected_return_pct, inflation_pct, monthly_expense_post_retirement)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (user_id) DO UPDATE SET
         current_age = EXCLUDED.current_age,
         retirement_age = EXCLUDED.retirement_age,
         life_expectancy = EXCLUDED.life_expectancy,
         current_corpus = EXCLUDED.current_corpus,
         target_corpus = EXCLUDED.target_corpus,
         monthly_contribution = EXCLUDED.monthly_contribution,
         expected_return_pct = EXCLUDED.expected_return_pct,
         inflation_pct = EXCLUDED.inflation_pct,
         monthly_expense_post_retirement = EXCLUDED.monthly_expense_post_retirement,
         updated_at = NOW()
       RETURNING ${RETIREMENT_COLS}`,
      [userId, currentAge, retirementAge, lifeExpectancy,
       currentCorpus || 0, targetCorpus, monthlyContribution || 0,
       expectedReturnPct || 10, inflationPct || 6, monthlyExpensePostRetirement || 0]
    );
    return formatRetirement(rows[0]);
  },

  async update(userId, fields) {
    const allowed = {
      currentAge: "current_age",
      retirementAge: "retirement_age",
      lifeExpectancy: "life_expectancy",
      currentCorpus: "current_corpus",
      targetCorpus: "target_corpus",
      monthlyContribution: "monthly_contribution",
      expectedReturnPct: "expected_return_pct",
      inflationPct: "inflation_pct",
      monthlyExpensePostRetirement: "monthly_expense_post_retirement",
      projectedCorpus: "projected_corpus",
      corpusGap: "corpus_gap",
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

    if (setClauses.length === 0) return RetirementPlan.findByUserId(userId);

    setClauses.push(`last_calculated_at = NOW()`);
    values.push(userId);

    const { rows } = await db.query(
      `UPDATE retirement_plans SET ${setClauses.join(", ")} WHERE user_id = $${idx} RETURNING ${RETIREMENT_COLS}`,
      values
    );
    return formatRetirement(rows[0]);
  },

  async remove(userId) {
    await db.query(`DELETE FROM retirement_plans WHERE user_id = $1`, [userId]);
  },
};

// ── FinancialHealthScore Model ────────────────────────────────────────────────

const HEALTH_COLS = `
  id, user_id, overall_score,
  net_worth_score, savings_rate_score, debt_score, investment_score,
  emergency_fund_score, insurance_score, goal_progress_score,
  strengths, weaknesses, recommendations,
  calculated_at, created_at
`;

function formatHealth(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    overallScore: row.overall_score,
    netWorthScore: row.net_worth_score,
    savingsRateScore: row.savings_rate_score,
    debtScore: row.debt_score,
    investmentScore: row.investment_score,
    emergencyFundScore: row.emergency_fund_score,
    insuranceScore: row.insurance_score,
    goalProgressScore: row.goal_progress_score,
    strengths: row.strengths || [],
    weaknesses: row.weaknesses || [],
    recommendations: row.recommendations || [],
    calculatedAt: row.calculated_at,
    createdAt: row.created_at,
  };
}

const FinancialHealthScore = {
  async findLatestByUserId(userId) {
    const { rows } = await db.query(
      `SELECT ${HEALTH_COLS} FROM financial_health_scores WHERE user_id = $1 ORDER BY calculated_at DESC LIMIT 1`,
      [userId]
    );
    return formatHealth(rows[0]);
  },

  async findAllByUserId(userId, limit = 10) {
    const { rows } = await db.query(
      `SELECT ${HEALTH_COLS} FROM financial_health_scores WHERE user_id = $1 ORDER BY calculated_at DESC LIMIT $2`,
      [userId, limit]
    );
    return rows.map(formatHealth);
  },

  async create(data) {
    const {
      userId, overallScore, netWorthScore, savingsRateScore, debtScore,
      investmentScore, emergencyFundScore, insuranceScore, goalProgressScore,
      strengths, weaknesses, recommendations
    } = data;

    const { rows } = await db.query(
      `INSERT INTO financial_health_scores
         (user_id, overall_score,
          net_worth_score, savings_rate_score, debt_score, investment_score,
          emergency_fund_score, insurance_score, goal_progress_score,
          strengths, weaknesses, recommendations)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING ${HEALTH_COLS}`,
      [userId, overallScore,
       netWorthScore || 0, savingsRateScore || 0, debtScore || 0, investmentScore || 0,
       emergencyFundScore || 0, insuranceScore || 0, goalProgressScore || 0,
       strengths || [], weaknesses || [], recommendations || []]
    );
    return formatHealth(rows[0]);
  },

  async remove(id) {
    await db.query(`DELETE FROM financial_health_scores WHERE id = $1`, [id]);
  },
};

// ── Alert Model ───────────────────────────────────────────────────────────────

const ALERT_COLS = `
  id, user_id, alert_type, priority,
  title, message, action_url, action_label,
  is_read, is_dismissed, expires_at, metadata, created_at
`;

function formatAlert(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    alertType: row.alert_type,
    priority: row.priority,
    title: row.title,
    message: row.message,
    actionUrl: row.action_url,
    actionLabel: row.action_label,
    isRead: row.is_read,
    isDismissed: row.is_dismissed,
    expiresAt: row.expires_at,
    metadata: row.metadata || {},
    createdAt: row.created_at,
  };
}

const Alert = {
  async findByUserId(userId, { unreadOnly = false } = {}) {
    let where = `user_id = $1 AND is_dismissed = FALSE`;
    if (unreadOnly) {
      where += ` AND is_read = FALSE`;
    }

    const { rows } = await db.query(
      `SELECT ${ALERT_COLS} FROM alerts WHERE ${where} ORDER BY priority DESC, created_at DESC`,
      [userId]
    );
    return rows.map(formatAlert);
  },

  async findById(id) {
    const { rows } = await db.query(`SELECT ${ALERT_COLS} FROM alerts WHERE id = $1`, [id]);
    return formatAlert(rows[0]);
  },

  async create(data) {
    const {
      userId, alertType, priority, title, message,
      actionUrl, actionLabel, expiresAt, metadata
    } = data;

    const { rows } = await db.query(
      `INSERT INTO alerts
         (user_id, alert_type, priority, title, message, action_url, action_label, expires_at, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${ALERT_COLS}`,
      [userId, alertType, priority || "medium", title, message,
       actionUrl || "", actionLabel || "", expiresAt, metadata ? JSON.stringify(metadata) : "{}"]
    );
    return formatAlert(rows[0]);
  },

  async markAsRead(id) {
    const { rows } = await db.query(
      `UPDATE alerts SET is_read = TRUE WHERE id = $1 RETURNING ${ALERT_COLS}`,
      [id]
    );
    return formatAlert(rows[0]);
  },

  async dismiss(id) {
    const { rows } = await db.query(
      `UPDATE alerts SET is_dismissed = TRUE WHERE id = $1 RETURNING ${ALERT_COLS}`,
      [id]
    );
    return formatAlert(rows[0]);
  },

  async remove(id) {
    await db.query(`DELETE FROM alerts WHERE id = $1`, [id]);
  },

  async cleanupExpired() {
    await db.query(`DELETE FROM alerts WHERE expires_at IS NOT NULL AND expires_at < NOW()`);
  },
};

module.exports = { RetirementPlan, FinancialHealthScore, Alert };
