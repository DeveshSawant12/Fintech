const db = require("../config/db");

const COLS = `
  id, user_id, investment_type, name,
  invested_amount, current_value, returns, return_pct,
  purchase_date, maturity_date,
  quantity, average_price,
  platform, folio_number, notes,
  is_active, created_at, updated_at
`;

function format(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    investmentType: row.investment_type,
    name: row.name,
    investedAmount: parseFloat(row.invested_amount),
    currentValue: parseFloat(row.current_value),
    returns: parseFloat(row.returns) || 0,
    returnPct: parseFloat(row.return_pct) || 0,
    purchaseDate: row.purchase_date,
    maturityDate: row.maturity_date,
    quantity: parseFloat(row.quantity) || 0,
    averagePrice: parseFloat(row.average_price) || 0,
    platform: row.platform,
    folioNumber: row.folio_number,
    notes: row.notes,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findByUserId(userId, { investmentType, activeOnly = false } = {}) {
  let where = `user_id = $1`;
  const params = [userId];
  let idx = 2;

  if (activeOnly) {
    where += ` AND is_active = TRUE`;
  }
  if (investmentType) {
    where += ` AND investment_type = $${idx}`;
    params.push(investmentType);
    idx++;
  }

  const { rows } = await db.query(
    `SELECT ${COLS} FROM investments WHERE ${where} ORDER BY created_at DESC`,
    params
  );
  return rows.map(format);
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT ${COLS} FROM investments WHERE id = $1`,
    [id]
  );
  return format(rows[0]);
}

async function create(data) {
  const {
    userId, investmentType, name, investedAmount, currentValue,
    purchaseDate, maturityDate, quantity, averagePrice,
    platform, folioNumber, notes
  } = data;

  const returns = (currentValue || investedAmount) - investedAmount;
  const returnPct = investedAmount > 0 ? (returns / investedAmount) * 100 : 0;

  const { rows } = await db.query(
    `INSERT INTO investments
       (user_id, investment_type, name, invested_amount, current_value, returns, return_pct,
        purchase_date, maturity_date, quantity, average_price, platform, folio_number, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING ${COLS}`,
    [userId, investmentType, name, investedAmount, currentValue || investedAmount, returns, returnPct,
     purchaseDate, maturityDate, quantity || 0, averagePrice || 0, platform || "", folioNumber || "", notes || ""]
  );
  return format(rows[0]);
}

async function update(id, fields) {
  const allowed = {
    investmentType: "investment_type",
    name: "name",
    investedAmount: "invested_amount",
    currentValue: "current_value",
    purchaseDate: "purchase_date",
    maturityDate: "maturity_date",
    quantity: "quantity",
    averagePrice: "average_price",
    platform: "platform",
    folioNumber: "folio_number",
    notes: "notes",
    isActive: "is_active",
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

  // Auto-recalculate returns if currentValue or investedAmount changed
  if (fields.currentValue !== undefined || fields.investedAmount !== undefined) {
    const current = await findById(id);
    const newInvested = fields.investedAmount !== undefined ? fields.investedAmount : current.investedAmount;
    const newCurrent = fields.currentValue !== undefined ? fields.currentValue : current.currentValue;
    const returns = newCurrent - newInvested;
    const returnPct = newInvested > 0 ? (returns / newInvested) * 100 : 0;

    setClauses.push(`returns = $${idx}`);
    values.push(returns);
    idx++;

    setClauses.push(`return_pct = $${idx}`);
    values.push(returnPct);
    idx++;
  }

  if (setClauses.length === 0) return findById(id);

  values.push(id);
  const { rows } = await db.query(
    `UPDATE investments SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${COLS}`,
    values
  );
  return format(rows[0]);
}

async function remove(id) {
  const { rows } = await db.query(
    `DELETE FROM investments WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows.length > 0;
}

module.exports = { findByUserId, findById, create, update, remove };
