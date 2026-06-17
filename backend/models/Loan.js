const db = require("../config/db");

const COLS = `
  id, user_id, loan_type, lender,
  principal_amount, outstanding_amount, interest_rate_pct,
  emi, tenure_months, remaining_months,
  start_date, end_date, status,
  account_number, notes, created_at, updated_at
`;

function format(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    loanType: row.loan_type,
    lender: row.lender,
    principalAmount: parseFloat(row.principal_amount),
    outstandingAmount: parseFloat(row.outstanding_amount),
    interestRatePct: parseFloat(row.interest_rate_pct),
    emi: parseFloat(row.emi),
    tenureMonths: row.tenure_months,
    remainingMonths: row.remaining_months,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    accountNumber: row.account_number,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findByUserId(userId, { status } = {}) {
  let where = `user_id = $1`;
  const params = [userId];

  if (status) {
    where += ` AND status = $2`;
    params.push(status);
  }

  const { rows } = await db.query(
    `SELECT ${COLS} FROM loans WHERE ${where} ORDER BY created_at DESC`,
    params
  );
  return rows.map(format);
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT ${COLS} FROM loans WHERE id = $1`,
    [id]
  );
  return format(rows[0]);
}

async function create(data) {
  const {
    userId, loanType, lender, principalAmount, outstandingAmount, interestRatePct,
    emi, tenureMonths, remainingMonths, startDate, endDate, status, accountNumber, notes
  } = data;

  const { rows } = await db.query(
    `INSERT INTO loans
       (user_id, loan_type, lender, principal_amount, outstanding_amount, interest_rate_pct,
        emi, tenure_months, remaining_months, start_date, end_date, status, account_number, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING ${COLS}`,
    [userId, loanType, lender, principalAmount, outstandingAmount || principalAmount, interestRatePct,
     emi, tenureMonths, remainingMonths || tenureMonths, startDate, endDate, status || "active", accountNumber || "", notes || ""]
  );
  return format(rows[0]);
}

async function update(id, fields) {
  const allowed = {
    loanType: "loan_type",
    lender: "lender",
    principalAmount: "principal_amount",
    outstandingAmount: "outstanding_amount",
    interestRatePct: "interest_rate_pct",
    emi: "emi",
    tenureMonths: "tenure_months",
    remainingMonths: "remaining_months",
    startDate: "start_date",
    endDate: "end_date",
    status: "status",
    accountNumber: "account_number",
    notes: "notes",
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

  if (setClauses.length === 0) return findById(id);

  values.push(id);
  const { rows } = await db.query(
    `UPDATE loans SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${COLS}`,
    values
  );
  return format(rows[0]);
}

async function remove(id) {
  const { rows } = await db.query(
    `DELETE FROM loans WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows.length > 0;
}

module.exports = { findByUserId, findById, create, update, remove };
