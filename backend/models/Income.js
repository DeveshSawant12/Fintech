const db = require("../config/db");

const COLS = `
  id, user_id, source, amount, frequency,
  start_date, end_date, is_active, received_date,
  category, notes, created_at, updated_at
`;

function format(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    source: row.source,
    amount: parseFloat(row.amount),
    frequency: row.frequency,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active,
    receivedDate: row.received_date,
    category: row.category,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── PERMANENT FIX: cast user_id::text = $1::text to avoid type mismatches
// (INTEGER vs STRING vs UUID) between JWT-derived userId and the DB column.
async function findByUserId(userId, { activeOnly = false } = {}) {
  const where = activeOnly
    ? `WHERE user_id::text = $1::text AND is_active = TRUE`
    : `WHERE user_id::text = $1::text`;
  const { rows } = await db.query(
    `SELECT ${COLS} FROM income_records ${where} ORDER BY created_at DESC`,
    [userId]
  );
  if (process.env.DEBUG_AI === "true") {
    console.log(`[Income.findByUserId] userId=${userId} (${typeof userId}) → rows found: ${rows.length}`);
  }
  return rows.map(format);
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT ${COLS} FROM income_records WHERE id = $1`,
    [id]
  );
  return format(rows[0]);
}

async function create(data) {
  const { userId, source, amount, frequency, startDate, endDate, receivedDate, category, notes } = data;
  const { rows } = await db.query(
    `INSERT INTO income_records
       (user_id, source, amount, frequency, start_date, end_date, received_date, category, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING ${COLS}`,
    [userId, source, amount, frequency || "monthly", startDate, endDate, receivedDate, category || "other", notes || ""]
  );
  return format(rows[0]);
}

async function update(id, fields) {
  const allowed = {
    source: "source",
    amount: "amount",
    frequency: "frequency",
    startDate: "start_date",
    endDate: "end_date",
    isActive: "is_active",
    receivedDate: "received_date",
    category: "category",
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
    `UPDATE income_records SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${COLS}`,
    values
  );
  return format(rows[0]);
}

async function remove(id) {
  const { rows } = await db.query(
    `DELETE FROM income_records WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows.length > 0;
}

module.exports = { findByUserId, findById, create, update, remove };