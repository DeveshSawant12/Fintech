// ── Financial Validation Utilities ────────────────────────────────────────────

// ── Validate user ID ──────────────────────────────────────────────────────────
function validateUserId(userId) {
  if (!userId || typeof userId !== "string") {
    return { valid: false, error: "Valid user ID is required" };
  }
  // UUID v4 format check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return { valid: false, error: "Invalid user ID format" };
  }
  return { valid: true };
}

// ── Validate amount ───────────────────────────────────────────────────────────
function validateAmount(amount, fieldName = "Amount") {
  if (amount === undefined || amount === null) {
    return { valid: false, error: `${fieldName} is required` };
  }
  const num = parseFloat(amount);
  if (isNaN(num) || num < 0) {
    return { valid: false, error: `${fieldName} must be a non-negative number` };
  }
  if (num > 1e15) {
    return { valid: false, error: `${fieldName} exceeds maximum allowed value` };
  }
  return { valid: true, value: num };
}

// ── Validate percentage ───────────────────────────────────────────────────────
function validatePercentage(pct, fieldName = "Percentage") {
  if (pct === undefined || pct === null) {
    return { valid: false, error: `${fieldName} is required` };
  }
  const num = parseFloat(pct);
  if (isNaN(num) || num < 0 || num > 100) {
    return { valid: false, error: `${fieldName} must be between 0 and 100` };
  }
  return { valid: true, value: num };
}

// ── Validate age ──────────────────────────────────────────────────────────────
function validateAge(age, fieldName = "Age") {
  if (age === undefined || age === null) {
    return { valid: false, error: `${fieldName} is required` };
  }
  const num = parseInt(age);
  if (isNaN(num) || num < 1 || num > 120) {
    return { valid: false, error: `${fieldName} must be between 1 and 120` };
  }
  return { valid: true, value: num };
}

// ── Validate date ─────────────────────────────────────────────────────────────
function validateDate(dateStr, fieldName = "Date") {
  if (!dateStr) {
    return { valid: false, error: `${fieldName} is required` };
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { valid: false, error: `${fieldName} is not a valid date` };
  }
  return { valid: true, value: date };
}

// ── Validate frequency ────────────────────────────────────────────────────────
function validateFrequency(frequency, type = "income") {
  const validIncome = ["monthly", "quarterly", "annual", "one_time"];
  const validExpense = ["daily", "weekly", "monthly", "quarterly", "annual", "one_time"];
  const valid = type === "income" ? validIncome : validExpense;

  if (!frequency || !valid.includes(frequency)) {
    return { valid: false, error: `Invalid frequency. Must be one of: ${valid.join(", ")}` };
  }
  return { valid: true };
}

// ── Validate retirement params ────────────────────────────────────────────────
function validateRetirementParams(params) {
  const errors = [];

  if (params.currentAge !== undefined) {
    const ageCheck = validateAge(params.currentAge, "Current age");
    if (!ageCheck.valid) errors.push(ageCheck.error);
  }

  if (params.retirementAge !== undefined) {
    const ageCheck = validateAge(params.retirementAge, "Retirement age");
    if (!ageCheck.valid) errors.push(ageCheck.error);
  }

  if (params.lifeExpectancy !== undefined) {
    const ageCheck = validateAge(params.lifeExpectancy, "Life expectancy");
    if (!ageCheck.valid) errors.push(ageCheck.error);
  }

  if (
    params.currentAge !== undefined &&
    params.retirementAge !== undefined &&
    params.retirementAge <= params.currentAge
  ) {
    errors.push("Retirement age must be greater than current age");
  }

  if (
    params.retirementAge !== undefined &&
    params.lifeExpectancy !== undefined &&
    params.lifeExpectancy <= params.retirementAge
  ) {
    errors.push("Life expectancy must be greater than retirement age");
  }

  if (params.currentCorpus !== undefined) {
    const check = validateAmount(params.currentCorpus, "Current corpus");
    if (!check.valid) errors.push(check.error);
  }

  if (params.monthlyContribution !== undefined) {
    const check = validateAmount(params.monthlyContribution, "Monthly contribution");
    if (!check.valid) errors.push(check.error);
  }

  if (params.expectedReturnPct !== undefined) {
    const check = validatePercentage(params.expectedReturnPct, "Expected return");
    if (!check.valid) errors.push(check.error);
  }

  if (params.inflationPct !== undefined) {
    const check = validatePercentage(params.inflationPct, "Inflation rate");
    if (!check.valid) errors.push(check.error);
  }

  if (params.monthlyExpensePostRetirement !== undefined) {
    const check = validateAmount(
      params.monthlyExpensePostRetirement,
      "Monthly expense post-retirement"
    );
    if (!check.valid) errors.push(check.error);
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

// ── Validate affordability params ─────────────────────────────────────────────
function validateAffordabilityParams(purchaseAmount, purchaseType) {
  const errors = [];

  const amountCheck = validateAmount(purchaseAmount, "Purchase amount");
  if (!amountCheck.valid) errors.push(amountCheck.error);

  if (purchaseType && !["one_time", "emi"].includes(purchaseType)) {
    errors.push("Purchase type must be 'one_time' or 'emi'");
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

// ── Validate goal data ────────────────────────────────────────────────────────
function validateGoalData(data) {
  const errors = [];

  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("Goal name is required");
  }

  const categories = [
    "retirement",
    "home",
    "education",
    "wealth",
    "emergency",
    "travel",
    "wedding",
    "other",
  ];
  if (!data.category || !categories.includes(data.category)) {
    errors.push(`Category must be one of: ${categories.join(", ")}`);
  }

  const amountCheck = validateAmount(data.targetAmount, "Target amount");
  if (!amountCheck.valid) errors.push(amountCheck.error);

  if (data.currentAmount !== undefined) {
    const currCheck = validateAmount(data.currentAmount, "Current amount");
    if (!currCheck.valid) errors.push(currCheck.error);
  }

  if (data.targetDate) {
    const dateCheck = validateDate(data.targetDate, "Target date");
    if (!dateCheck.valid) {
      errors.push(dateCheck.error);
    } else if (dateCheck.value <= new Date()) {
      errors.push("Target date must be in the future");
    }
  }

  if (data.priority !== undefined) {
    const priority = parseInt(data.priority);
    if (isNaN(priority) || priority < 1 || priority > 10) {
      errors.push("Priority must be between 1 and 10");
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

// ── Validate investment data ──────────────────────────────────────────────────
function validateInvestmentData(data) {
  const errors = [];

  const types = [
    "mutual_fund",
    "stock",
    "bond",
    "ppf",
    "nps",
    "real_estate",
    "gold",
    "crypto",
    "fd",
    "other",
  ];
  if (!data.investmentType || !types.includes(data.investmentType)) {
    errors.push(`Investment type must be one of: ${types.join(", ")}`);
  }

  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("Investment name is required");
  }

  const investedCheck = validateAmount(data.investedAmount, "Invested amount");
  if (!investedCheck.valid) errors.push(investedCheck.error);

  if (data.currentValue !== undefined) {
    const valueCheck = validateAmount(data.currentValue, "Current value");
    if (!valueCheck.valid) errors.push(valueCheck.error);
  }

  if (data.purchaseDate) {
    const dateCheck = validateDate(data.purchaseDate, "Purchase date");
    if (!dateCheck.valid) errors.push(dateCheck.error);
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

// ── Validate loan data ────────────────────────────────────────────────────────
function validateLoanData(data) {
  const errors = [];

  const types = ["home", "car", "personal", "education", "credit_card", "other"];
  if (!data.loanType || !types.includes(data.loanType)) {
    errors.push(`Loan type must be one of: ${types.join(", ")}`);
  }

  if (!data.lender || typeof data.lender !== "string" || data.lender.trim().length === 0) {
    errors.push("Lender name is required");
  }

  const principalCheck = validateAmount(data.principalAmount, "Principal amount");
  if (!principalCheck.valid) errors.push(principalCheck.error);

  if (data.outstandingAmount !== undefined) {
    const outCheck = validateAmount(data.outstandingAmount, "Outstanding amount");
    if (!outCheck.valid) errors.push(outCheck.error);
  }

  const rateCheck = validatePercentage(data.interestRatePct, "Interest rate");
  if (!rateCheck.valid) errors.push(rateCheck.error);

  const emiCheck = validateAmount(data.emi, "EMI");
  if (!emiCheck.valid) errors.push(emiCheck.error);

  if (data.tenureMonths !== undefined) {
    const tenure = parseInt(data.tenureMonths);
    if (isNaN(tenure) || tenure < 1) {
      errors.push("Tenure must be at least 1 month");
    }
  }

  if (data.startDate) {
    const dateCheck = validateDate(data.startDate, "Start date");
    if (!dateCheck.valid) errors.push(dateCheck.error);
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

// ── Sanitize numeric input ────────────────────────────────────────────────────
function sanitizeNumeric(value) {
  if (value === null || value === undefined) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

// ── Safe division ─────────────────────────────────────────────────────────────
function safeDivide(numerator, denominator, defaultValue = 0) {
  if (denominator === 0 || denominator === null || denominator === undefined) {
    return defaultValue;
  }
  return numerator / denominator;
}

// ── Clamp value ───────────────────────────────────────────────────────────────
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ── Format currency (for display, not calculation) ────────────────────────────
function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "₹0";
  const num = parseFloat(amount);
  if (isNaN(num)) return "₹0";

  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

// ── Round to precision ────────────────────────────────────────────────────────
function roundTo(value, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

module.exports = {
  validateUserId,
  validateAmount,
  validatePercentage,
  validateAge,
  validateDate,
  validateFrequency,
  validateRetirementParams,
  validateAffordabilityParams,
  validateGoalData,
  validateInvestmentData,
  validateLoanData,
  sanitizeNumeric,
  safeDivide,
  clamp,
  formatCurrency,
  roundTo,
};
