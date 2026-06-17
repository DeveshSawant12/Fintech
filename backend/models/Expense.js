const db = require("../config/db");

const COLS = `
  id, user_id, category, amount, frequency,
  start_date, end_date, is_active, expense_date,
  subcategory, merchant, notes, created_at, updated_at
`;

function format(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category,
    amount: parseFloat(row.amount),
    frequency: row.frequency,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active,
    expenseDate: row.expense_date,
    subcategory: row.subcategory,
    merchant: row.merchant,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── PERMANENT FIX: cast user_id::text = $1::text to avoid type mismatches
// (INTEGER vs STRING vs UUID) between JWT-derived userId and the DB column.
async function findByUserId(userId, { activeOnly = false, category } = {}) {
  let where = `user_id::text = $1::text`;
  const params = [userId];
  let idx = 2;

  if (activeOnly) {
    where += ` AND is_active = TRUE`;
  }
  if (category) {
    where += ` AND category = $${idx}`;
    params.push(category);
    idx++;
  }

  const { rows } = await db.query(
    `SELECT ${COLS} FROM expense_records WHERE ${where} ORDER BY created_at DESC`,
    params
  );

  if (process.env.DEBUG_AI === "true") {
    console.log(`[Expense.findByUserId] userId=${userId} (${typeof userId}) → rows found: ${rows.length}`);
  }

  return rows.map(format);
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT ${COLS} FROM expense_records WHERE id = $1`,
    [id]
  );
  return format(rows[0]);
}

async function create(data) {
  const { userId, category, amount, frequency, startDate, endDate, expenseDate, subcategory, merchant, notes } = data;
  const { rows } = await db.query(
    `INSERT INTO expense_records
       (user_id, category, amount, frequency, start_date, end_date, expense_date, subcategory, merchant, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${COLS}`,
    [userId, category, amount, frequency || "monthly", startDate, endDate, expenseDate, subcategory || "", merchant || "", notes || ""]
  );
  return format(rows[0]);
}

async function update(id, fields) {
  const allowed = {
    category: "category",
    amount: "amount",
    frequency: "frequency",
    startDate: "start_date",
    endDate: "end_date",
    isActive: "is_active",
    expenseDate: "expense_date",
    subcategory: "subcategory",
    merchant: "merchant",
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
    `UPDATE expense_records SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${COLS}`,
    values
  );
  return format(rows[0]);
}

async function remove(id) {
  const { rows } = await db.query(
    `DELETE FROM expense_records WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows.length > 0;
}

module.exports = { findByUserId, findById, create, update, remove };