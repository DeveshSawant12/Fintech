const db = require("../config/db");

// ── SIP Model ─────────────────────────────────────────────────────────────────

const SIP_COLS = `
  id, user_id, investment_id, fund_name, amount, frequency, sip_date,
  start_date, end_date, status,
  total_invested, current_value, returns,
  platform, folio_number, notes, created_at, updated_at
`;

function formatSIP(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    investmentId: row.investment_id,
    fundName: row.fund_name,
    amount: parseFloat(row.amount),
    frequency: row.frequency,
    sipDate: row.sip_date,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    totalInvested: parseFloat(row.total_invested) || 0,
    currentValue: parseFloat(row.current_value) || 0,
    returns: parseFloat(row.returns) || 0,
    platform: row.platform,
    folioNumber: row.folio_number,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SIP = {
  async findByUserId(userId, { status } = {}) {
    let where = `user_id = $1`;
    const params = [userId];
    if (status) {
      where += ` AND status = $2`;
      params.push(status);
    }
    const { rows } = await db.query(
      `SELECT ${SIP_COLS} FROM sips WHERE ${where} ORDER BY created_at DESC`,
      params
    );
    return rows.map(formatSIP);
  },

  async findById(id) {
    const { rows } = await db.query(`SELECT ${SIP_COLS} FROM sips WHERE id = $1`, [id]);
    return formatSIP(rows[0]);
  },

  async create(data) {
    const {
      userId, investmentId, fundName, amount, frequency, sipDate,
      startDate, endDate, platform, folioNumber, notes
    } = data;
    const { rows } = await db.query(
      `INSERT INTO sips
         (user_id, investment_id, fund_name, amount, frequency, sip_date, start_date, end_date, platform, folio_number, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${SIP_COLS}`,
      [userId, investmentId, fundName, amount, frequency || "monthly", sipDate, startDate, endDate, platform || "", folioNumber || "", notes || ""]
    );
    return formatSIP(rows[0]);
  },

  async update(id, fields) {
    const allowed = {
      investmentId: "investment_id",
      fundName: "fund_name",
      amount: "amount",
      frequency: "frequency",
      sipDate: "sip_date",
      startDate: "start_date",
      endDate: "end_date",
      status: "status",
      totalInvested: "total_invested",
      currentValue: "current_value",
      returns: "returns",
      platform: "platform",
      folioNumber: "folio_number",
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

    if (setClauses.length === 0) return SIP.findById(id);

    values.push(id);
    const { rows } = await db.query(
      `UPDATE sips SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${SIP_COLS}`,
      values
    );
    return formatSIP(rows[0]);
  },

  async remove(id) {
    const { rows } = await db.query(`DELETE FROM sips WHERE id = $1 RETURNING id`, [id]);
    return rows.length > 0;
  },
};

// ── Asset Model ───────────────────────────────────────────────────────────────

const ASSET_COLS = `
  id, user_id, asset_type, name,
  current_value, purchase_value, purchase_date,
  location, account_number, notes,
  is_liquid, created_at, updated_at
`;

function formatAsset(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    assetType: row.asset_type,
    name: row.name,
    currentValue: parseFloat(row.current_value),
    purchaseValue: parseFloat(row.purchase_value) || 0,
    purchaseDate: row.purchase_date,
    location: row.location,
    accountNumber: row.account_number,
    notes: row.notes,
    isLiquid: row.is_liquid,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const Asset = {
  async findByUserId(userId, { assetType } = {}) {
    let where = `user_id = $1`;
    const params = [userId];
    if (assetType) {
      where += ` AND asset_type = $2`;
      params.push(assetType);
    }
    const { rows } = await db.query(
      `SELECT ${ASSET_COLS} FROM assets WHERE ${where} ORDER BY created_at DESC`,
      params
    );
    return rows.map(formatAsset);
  },

  async findById(id) {
    const { rows } = await db.query(`SELECT ${ASSET_COLS} FROM assets WHERE id = $1`, [id]);
    return formatAsset(rows[0]);
  },

  async create(data) {
    const {
      userId, assetType, name, currentValue, purchaseValue,
      purchaseDate, location, accountNumber, notes, isLiquid
    } = data;
    const { rows } = await db.query(
      `INSERT INTO assets
         (user_id, asset_type, name, current_value, purchase_value, purchase_date, location, account_number, notes, is_liquid)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${ASSET_COLS}`,
      [userId, assetType, name, currentValue, purchaseValue || 0, purchaseDate, location || "", accountNumber || "", notes || "", isLiquid !== undefined ? isLiquid : true]
    );
    return formatAsset(rows[0]);
  },

  async update(id, fields) {
    const allowed = {
      assetType: "asset_type",
      name: "name",
      currentValue: "current_value",
      purchaseValue: "purchase_value",
      purchaseDate: "purchase_date",
      location: "location",
      accountNumber: "account_number",
      notes: "notes",
      isLiquid: "is_liquid",
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

    if (setClauses.length === 0) return Asset.findById(id);

    values.push(id);
    const { rows } = await db.query(
      `UPDATE assets SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${ASSET_COLS}`,
      values
    );
    return formatAsset(rows[0]);
  },

  async remove(id) {
    const { rows } = await db.query(`DELETE FROM assets WHERE id = $1 RETURNING id`, [id]);
    return rows.length > 0;
  },
};

// ── Goal Model ────────────────────────────────────────────────────────────────

const GOAL_COLS = `
  id, user_id, name, category,
  target_amount, current_amount, target_date, priority, status,
  monthly_contribution, expected_return_pct,
  icon, description, achieved_at,
  created_at, updated_at
`;

function formatGoal(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    category: row.category,
    targetAmount: parseFloat(row.target_amount),
    currentAmount: parseFloat(row.current_amount) || 0,
    targetDate: row.target_date,
    priority: row.priority,
    status: row.status,
    monthlyContribution: parseFloat(row.monthly_contribution) || 0,
    expectedReturnPct: parseFloat(row.expected_return_pct) || 8,
    icon: row.icon,
    description: row.description,
    achievedAt: row.achieved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const Goal = {
  async findByUserId(userId, { status, category } = {}) {
    let where = `user_id = $1`;
    const params = [userId];
    let idx = 2;

    if (status) {
      where += ` AND status = $${idx}`;
      params.push(status);
      idx++;
    }
    if (category) {
      where += ` AND category = $${idx}`;
      params.push(category);
      idx++;
    }

    const { rows } = await db.query(
      `SELECT ${GOAL_COLS} FROM goals WHERE ${where} ORDER BY priority DESC, target_date ASC`,
      params
    );
    return rows.map(formatGoal);
  },

  async findById(id) {
    const { rows } = await db.query(`SELECT ${GOAL_COLS} FROM goals WHERE id = $1`, [id]);
    return formatGoal(rows[0]);
  },

  async create(data) {
    const {
      userId, name, category, targetAmount, currentAmount, targetDate, priority,
      monthlyContribution, expectedReturnPct, icon, description
    } = data;
    const { rows } = await db.query(
      `INSERT INTO goals
         (user_id, name, category, target_amount, current_amount, target_date, priority,
          monthly_contribution, expected_return_pct, icon, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${GOAL_COLS}`,
      [userId, name, category, targetAmount, currentAmount || 0, targetDate, priority || 5,
       monthlyContribution || 0, expectedReturnPct || 8, icon || "", description || ""]
    );
    return formatGoal(rows[0]);
  },

  async update(id, fields) {
    const allowed = {
      name: "name",
      category: "category",
      targetAmount: "target_amount",
      currentAmount: "current_amount",
      targetDate: "target_date",
      priority: "priority",
      status: "status",
      monthlyContribution: "monthly_contribution",
      expectedReturnPct: "expected_return_pct",
      icon: "icon",
      description: "description",
      achievedAt: "achieved_at",
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

    if (setClauses.length === 0) return Goal.findById(id);

    values.push(id);
    const { rows } = await db.query(
      `UPDATE goals SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${GOAL_COLS}`,
      values
    );
    return formatGoal(rows[0]);
  },

  async remove(id) {
    const { rows } = await db.query(`DELETE FROM goals WHERE id = $1 RETURNING id`, [id]);
    return rows.length > 0;
  },
};

module.exports = { SIP, Asset, Goal };
