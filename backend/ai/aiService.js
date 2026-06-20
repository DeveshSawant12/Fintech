// ── SmartFinance AI Wealth Assistant ──────────────────────────────────────────
"use strict";

const { AIConversation, AIMessage } = require("../models/AIEntities");
const tools = require("./tools/financialTools");
const { getModel } = require("./llm/gemini");

// ── Config ────────────────────────────────────────────────────────────────────
const AI_CONFIG = {
  model: process.env.GEMINI_MODEL_CHAT || "gemini-2.5-flash",
  systemPrompt: `You are SmartFinance AI — a thoughtful, knowledgeable Indian wealth advisor having a real conversation with the user.

How you communicate:
- Talk like a sharp, friendly human advisor would — not like a report generator. Vary your phrasing; don't reuse the same openers or structure every time.
- Default to natural prose. Use markdown formatting (tables, headers, bullet lists) only when it genuinely helps — e.g. comparing numbers across categories, or listing multiple distinct items. For a quick answer, just answer in 1-3 sentences.
- Reason out loud when it's useful: connect cause and effect ("because your EMI is eating 30% of income, your savings rate is capped at...") rather than just listing numbers.
- Match the user's tone and depth. A casual one-line question gets a short, direct answer. An open-ended "help me think through my finances" gets a deeper, more exploratory response.
- Avoid generic disclaimers, repeated framing phrases ("Let's analyse...", "Based on the information available..."), or restating the question back at the user.

What you know:
- PERSONAL DATA: When real account data is provided below, treat it as ground truth — quote exact figures, and reason across multiple data points together (income vs expenses vs investments vs goals) when relevant to the question, even if the user only asked about one of them.
- GENERAL KNOWLEDGE: For concepts, market info, strategies, or anything not about this specific user's account, answer from your expertise as an Indian financial advisor — practical, current, and specific to Indian markets (NSE/BSE, mutual funds, PPF/NPS/EPF, Indian tax sections).

Formatting conventions:
- ₹, lakhs (L), crores (Cr) for amounts.
- If real data shows ₹0 or missing values for something relevant to the question, say so plainly and naturally — don't turn it into a bulleted "next steps" checklist unless the user is clearly asking what to do next.

Stay focused on personal finance, investing, and wealth management — but a brief friendly aside or acknowledgment of small talk is fine before steering back.`,
};

const TOOL_DEFINITIONS = [
  { name: "getFinancialProfile",  description: "Complete snapshot: net worth, income, expenses, savings rate, emergency fund" },
  { name: "getInvestmentSummary", description: "Portfolio: value, returns, SIP amount, diversification" },
  { name: "getLoanSummary",       description: "Active loans: outstanding, EMIs, rates, debt-to-income ratio" },
  { name: "calculateHealthScore", description: "Financial health score 0-100 with grade, strengths, weaknesses, recommendations" },
  { name: "budgetAnalysis",       description: "Monthly budget: income, expenses by category, savings, savings rate" },
  { name: "goalAnalysis",         description: "Goals: progress %, monthly contribution needed, on-track status" },
  { name: "retirementAnalysis",   description: "Retirement: projected corpus, required corpus, shortfall, extra SIP needed" },
  { name: "riskAnalysis",         description: "Risk profile: score, category, current vs ideal allocation" },
  { name: "emergencyFundCheck",   description: "Emergency fund: amount, months covered, gap from 6-month target" },
  { name: "affordabilityCheck",   description: "Can user afford a specific purchase (one-time or EMI)" },
  { name: "wealthForecast",       description: "Project total wealth over N years" },
  { name: "whatIfSimulator",      description: "Simulate impact of income/expense changes on savings" },
  { name: "loanAdvisor",          description: "Loan payoff strategy: which to clear first, extra payment advice" },
  { name: "investmentAdvisor",    description: "Portfolio advice: current vs recommended allocation, rebalancing" },
  { name: "taxPlanner",           description: "Tax: 80C used/remaining, home loan deduction, total tax saved" },
];

// ── Greetings / small talk — no tools, no data needed ────────────────────────
const GREETING_PATTERNS = [
  "^hi$", "^hii+$", "^hey$", "^hello$", "^helo$", "^namaste$", "^sup$",
  "^good morning$", "^good afternoon$", "^good evening$", "^good night$",
  "^how are you", "^how r u", "^what's up", "^whats up", "^wassup",
  "^thanks", "^thank you", "^ok$", "^okay$", "^cool$", "^great$", "^nice$",
  "^bye$", "^goodbye$", "^see you", "^take care",
  "^lol$", "^haha", "^😊", "^🙏",
];

function isGreeting(query) {
  const q = query.toLowerCase().trim();
  // Short non-financial messages (under 6 words, no financial keywords)
  const financialKeywords = ["money", "invest", "loan", "emi", "sip", "tax", "budget",
    "income", "expense", "savings", "portfolio", "score", "goal", "retire",
    "fund", "stock", "mutual", "wealth", "debt", "asset", "₹", "rs", "rupee"];
  const wordCount = q.split(/\s+/).length;
  if (wordCount <= 5 && !financialKeywords.some(k => q.includes(k))) {
    // Check explicit greeting patterns
    for (const p of GREETING_PATTERNS) {
      if (new RegExp(p).test(q)) return true;
    }
    // Very short messages with no financial context are likely small talk
    if (wordCount <= 2) return true;
  }
  return false;
}

// ── Patterns that need NO user data (general knowledge questions) ─────────────
const GENERAL_KNOWLEDGE_PATTERNS = [
  // Market / stocks
  "best stock", "top stock", "which stock", "stock market", "buy stock", "sell stock",
  "nifty", "sensex", "bse", "nse", "ipo", "market today", "market news",
  "which mutual fund", "best mutual fund", "top mutual fund", "recommended fund",
  "best investment", "where should i invest", "investment option",
  // Concepts
  "what is sip", "what is ppf", "what is nps", "what is elss", "what is fd",
  "what is inflation", "what is compound interest", "explain", "how does",
  "difference between", "what is a",
  // Tax concepts
  "what is 80c", "what is hra", "how to save tax", "tax slab", "new tax regime", "old tax regime",
  // Generic advice not about user
  "tips for", "how to invest", "how to save", "guide to", "strategy for",
  "best way to", "advice on", "suggest me",
];

// ── Patterns that clearly need user's personal data ───────────────────────────
const PERSONAL_DATA_PATTERNS = [
  "my ", "i have", "i earn", "i spend", "my score", "my portfolio", "my loan",
  "my budget", "my goal", "my retirement", "my investment", "my income",
  "my expense", "my savings", "my tax", "my health", "my wealth",
  "am i ", "do i ", "can i ", "should i ", "will i ", "how am i",
  "how is my", "what is my", "show me my", "analyse my", "analyze my",
];

// ── Classify query type ───────────────────────────────────────────────────────
function isGeneralKnowledge(query) {
  const q = query.toLowerCase().trim();

  // If it explicitly mentions "my" or personal context → always personal
  for (const p of PERSONAL_DATA_PATTERNS) {
    if (q.includes(p)) return false;
  }

  // If it matches general knowledge patterns → no tools needed
  for (const p of GENERAL_KNOWLEDGE_PATTERNS) {
    if (q.includes(p)) return true;
  }

  return false;
}

// ── Intent → tools map ────────────────────────────────────────────────────────
const INTENT_RULES = [
  { tools: ["retirementAnalysis"],                        patterns: ["my retirement", "retire", "retirement", "pension", "corpus", "will i have enough for retirement", "retire early"] },
  { tools: ["taxPlanner"],                                patterns: ["my tax", "tax planning", "80c", "section 80", "itr", "tds", "tax deduction", "save tax", "24b", "hra"] },
  { tools: ["emergencyFundCheck"],                        patterns: ["emergency fund", "rainy day", "contingency", "safety net", "sudden expense"] },
  { tools: ["loanAdvisor", "getLoanSummary"],             patterns: ["payoff", "pay off", "debt strategy", "which loan", "close loan", "clear debt", "how to repay"] },
  { tools: ["getLoanSummary"],                            patterns: ["my loan", "my emi", "my debt", "my credit", "my liabilities", "outstanding loan"] },
  { tools: ["goalAnalysis"],                              patterns: ["my goal", "am i on track", "goal progress", "saving for", "milestone"] },
  { tools: ["investmentAdvisor", "getInvestmentSummary"], patterns: ["optimize my", "rebalance", "my asset allocation", "portfolio advice"] },
  { tools: ["getInvestmentSummary"],                      patterns: ["my investment", "my portfolio", "my sip", "my returns", "my mutual fund", "my stocks", "my ppf", "my nps"] },
  { tools: ["budgetAnalysis"],                            patterns: ["my budget", "my spending", "my expenses", "where does my money", "my savings rate", "am i saving", "my income", "my salary"] },
  { tools: ["riskAnalysis"],                              patterns: ["my risk", "my risk profile", "how risky am i"] },
  { tools: ["wealthForecast"],                            patterns: ["my wealth", "how much will i have", "project my", "my forecast", "my future wealth"] },
  { tools: ["affordabilityCheck"],                        patterns: ["can i afford", "can i buy", "should i buy", "is it worth buying"] },
  { tools: ["whatIfSimulator"],                           patterns: ["what if", "if i get a raise", "if my income", "if i reduce", "simulate"] },
  { tools: ["calculateHealthScore"],                      patterns: ["my health score", "my financial health", "how am i doing", "my grade", "my score", "financial fitness"] },
  { tools: ["getFinancialProfile"],                       patterns: ["my net worth", "my profile", "my overview", "my balance sheet", "my total assets", "how are my finances", "about my finances", "about my finance", "my finance", "my finances", "my financial", "my money"] },
];

// Returns matched tools, or null if no intent matched
function classifyIntents(query) {
  const q = (query || "").toLowerCase().trim();
  for (const rule of INTENT_RULES) {
    for (const pattern of rule.patterns) {
      if (q.includes(pattern)) return rule.tools;
    }
  }
  // No specific intent matched — return null (caller will treat as general)
  return null;
}

// ── Parameter extraction ──────────────────────────────────────────────────────
function extractParams(query, toolName) {
  const q = (query || "").toLowerCase();
  if (toolName === "affordabilityCheck") {
    const crore = q.match(/(\d+(?:\.\d+)?)\s*(?:cr(?:ore)?)/);
    const lakh  = q.match(/(\d+(?:\.\d+)?)\s*(?:l(?:akh)?|lac)/);
    const plain = q.match(/(?:₹|rs\.?\s*)?(\d[\d,]*(?:\.\d+)?)/);
    let amount = 0;
    if (crore)      amount = parseFloat(crore[1]) * 10_000_000;
    else if (lakh)  amount = parseFloat(lakh[1]) * 100_000;
    else if (plain) amount = parseFloat(plain[1].replace(/,/g, ""));
    return { amount: amount || 100_000, type: q.includes("emi") || q.includes("installment") ? "emi" : "one_time" };
  }
  if (toolName === "wealthForecast") {
    const m = q.match(/(\d+)\s*(?:year|yr)/);
    return { years: m ? parseInt(m[1]) : 10 };
  }
  if (toolName === "whatIfSimulator") {
    const inc   = q.match(/income.*?(\d[\d,]*)/);
    const exp   = q.match(/expense.*?(\d[\d,]*)/);
    const raise = q.match(/(?:raise|hike|increment).*?(\d[\d,]*)/);
    const p = (m) => m ? parseFloat(m[1].replace(/,/g, "")) : 0;
    return { incomeChange: p(inc) || p(raise), expenseChange: p(exp) };
  }
  return {};
}

// ── Execute tool safely ───────────────────────────────────────────────────────
async function executeTool(toolName, params, userId) {
  const fn = tools[toolName];
  if (!fn) return { error: `Tool "${toolName}" not found` };
  try {
    if (toolName === "affordabilityCheck") return await fn(userId, params.amount || 100_000, params.type || "one_time");
    if (toolName === "wealthForecast")     return await fn(userId, params.years || 10);
    if (toolName === "whatIfSimulator")    return await fn(userId, params);
    return await fn(userId);
  } catch (err) {
    console.error(`Tool "${toolName}" error:`, err.message);
    return { error: err.message };
  }
}

// ── Formatters ────────────────────────────────────────────────────────────────
function fmt(val) {
  const n = parseFloat(val) || 0;
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(2)} L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
function pct(val) { return `${(parseFloat(val) || 0).toFixed(1)}%`; }
function n(val)   { return parseFloat(val) || 0; }

function buildFallbackResponse(toolName, data) {
  if (!data || data.error) {
    if ((data?.error || "").includes("retirement plan"))
      return "⚠️ No retirement plan found. Please add your details in **Settings → Retirement Planning**.";
    return `⚠️ ${data?.error || "No data found"}. Please complete your financial profile in **Settings**.`;
  }
  switch (toolName) {
    case "calculateHealthScore": {
      const score = n(data.score);
      const bar = "█".repeat(Math.round(score / 10)).padEnd(10, "░");
      return `## 🏥 Financial Health: **${score}/100 — Grade ${data.grade || "N/A"}**
\`${bar}\`

**✅ Strengths:**
${(data.strengths || []).map(s => `• ${s}`).join("\n") || "• Add financial data to see strengths"}

**⚠️ Areas to improve:**
${(data.weaknesses || []).map(w => `• ${w}`).join("\n") || "• Complete your profile for analysis"}

**💡 Recommendations:**
${(data.recommendations || []).map((r, i) => `${i + 1}. ${r}`).join("\n") || "1. Complete your financial profile to get personalised recommendations"}`;
    }
    case "budgetAnalysis": {
      const inc = n(data.income || data.monthlyIncome);
      const exp = n(data.expenses || data.monthlyExpense);
      const sav = n(data.savings || data.monthlySavings);
      const rate = n(data.savingsRate);
      if (!inc) return "⚠️ No income records found. Please add your income in **Settings → Income**.";
      const cats = Object.entries(data.categoryBreakdown || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5).map(([c, v]) => `• ${c}: ${fmt(v)}`).join("\n");
      return `## 💰 Monthly Budget

| | Amount |
|---|---|
| Income | **${fmt(inc)}** |
| Expenses | ${fmt(exp)} |
| Savings | **${fmt(sav)}** |
| Savings Rate | **${pct(rate)}** |

${rate < 10 ? "⚠️ Savings rate critically low." : rate < 20 ? "⚠️ Aim for at least 20% savings rate." : "✅ Great savings discipline!"}
${cats ? `\n**Top expense categories:**\n${cats}` : ""}`;
    }
    case "getInvestmentSummary": {
      const p = data.portfolio || {};
      if (!n(p.currentValue) && !n(p.totalInvested)) return "⚠️ No investments found. Add your investments in **Settings → Investments**.";
      return `## 📊 Investment Portfolio

| | Amount |
|---|---|
| Portfolio Value | **${fmt(p.currentValue)}** |
| Total Invested | ${fmt(p.totalInvested)} |
| Returns | ${fmt(p.returns)} (${pct(p.returnPct)}) |
| Monthly SIP | **${fmt(data.monthlySIP)}** |
| Diversification | ${data.diversification || "—"} |`;
    }
    case "getLoanSummary": {
      if (!n(data.totalLoans)) return "🎉 **No active loans!** You are completely debt-free.";
      const loans = (data.loans || []).map(l => `• **${l.type}** — ${fmt(l.outstanding)} @ ${pct(l.rate)} | EMI: ${fmt(l.emi)}`).join("\n");
      return `## 💳 Loans

| | Amount |
|---|---|
| Active Loans | ${data.totalLoans} |
| Total Outstanding | **${fmt(data.totalOutstanding)}** |
| Monthly EMI | ${fmt(data.totalEMI)} |
| Debt-to-Income | ${pct(data.debtToIncomeRatio)} |

${loans}`;
    }
    case "goalAnalysis": {
      if (!(data.goals || []).length) return "📌 No goals found. Add goals in **Settings → Goals**.";
      return `## 🎯 Goals — ${data.onTrack}/${data.totalGoals} on track\n\n${data.goals.map(g =>
        `**${g.name}** ${g.status === "on_track" ? "✅" : "⚠️"} — ${pct(g.progress)} complete\nNeed ${fmt(g.monthlyNeeded)}/month`
      ).join("\n\n")}`;
    }
    case "retirementAnalysis": {
      const gap = n(data.gap);
      return `## 🏖️ Retirement

| | |
|---|---|
| Projected Corpus | **${fmt(data.projectedCorpus)}** |
| Required Corpus | ${fmt(data.requiredCorpus)} |

${data.sufficient ? `✅ On track! Surplus: ${fmt(Math.abs(gap))}` : `⚠️ Shortfall: **${fmt(Math.abs(gap))}**\n💡 Increase SIP by **${fmt(data.additionalSIPNeeded)}/month**.`}`;
    }
    case "emergencyFundCheck": {
      const cov = n(data.coverage || data.coverageMonths);
      return `## 🛡️ Emergency Fund\n\n| | |\n|---|---|\n| Current | **${fmt(data.currentAmount)}** |\n| Target (6 months) | ${fmt(data.targetAmount)} |\n| Coverage | ${cov.toFixed(1)} months |\n\n${data.sufficient ? "✅ Adequate!" : `⚠️ Gap: **${fmt(data.gap)}** — Save ${fmt(n(data.gap) / 12)}/month.`}`;
    }
    case "taxPlanner": {
      const d = data.deductions || {};
      return `## 🧾 Tax Planning\n\n| | Amount |\n|---|---|\n| Annual Income | ${fmt(data.annualIncome)} |\n| 80C Invested | ${fmt(d.section80C)} |\n| 80C Remaining | **${fmt(d.remaining80C)}** |\n| Tax Saved | **${fmt(data.taxSaving)}** |\n\n${n(d.remaining80C) > 0 ? `💡 Invest **${fmt(d.remaining80C)} more** in ELSS/PPF/NPS to save another **${fmt(n(d.remaining80C) * 0.3)}**.` : "✅ 80C limit fully utilised!"}`;
    }
    case "wealthForecast": {
      const cw = n(data.currentWealth), pw = n(data.projectedWealth);
      if (!cw && !pw) return "⚠️ No investment data found. Add investments in **Settings** for a forecast.";
      return `## 🚀 Wealth Forecast — ${data.years} Years\n\n| | Amount |\n|---|---|\n| Current | ${fmt(cw)} |\n| Projected | **${fmt(pw)}** |\n\n💡 Consistent SIP compounding at ${data.growthRate || 12}% p.a.`;
    }
    case "affordabilityCheck": {
      const d = data.details || data;
      return `## 🛒 Affordability\n\n${data.canAfford ? "✅ **Yes, you can afford this!**" : "❌ **This may be a stretch.**"}\n\n${data.recommendation || d.recommendation || ""}`;
    }
    case "whatIfSimulator": {
      const b = data.baseline || {}, m = data.modified || {}, im = data.impact || {};
      return `## 🔮 What-If Scenario\n\n| | Before | After |\n|---|---|---|\n| Income | ${fmt(b.income)} | ${fmt(m.income)} |\n| Expenses | ${fmt(b.expense)} | ${fmt(m.expense)} |\n| Savings | ${fmt(b.savings)} | **${fmt(m.savings)}** |\n\n${n(im.savingsChange) >= 0 ? "📈" : "📉"} Change: **${fmt(Math.abs(n(im.savingsChange)))}/month**`;
    }
    case "loanAdvisor": {
      if (!(data.loans || []).length) return "🎉 No active loans — you're debt-free!";
      return `## 🏦 Loan Strategy\n\n**${data.strategy}**\n\n${data.loans.map((l, i) => `${i + 1}. **${l.type}** — ${fmt(l.outstanding)} @ ${pct(l.rate)} · ${l.priority} priority`).join("\n")}\n\n💡 Extra **${fmt(data.extraPayment)}/month** on highest-rate loan.`;
    }
    case "investmentAdvisor": {
      const cur = data.current || {}, rec = data.recommended || {};
      const ca = cur.allocation || {}, ra = rec.allocation || {};
      if (!n(cur.portfolio)) return "⚠️ No investment data. Add investments in **Settings → Investments**.";
      return `## 📈 Investment Advice\n\n**Portfolio:** ${fmt(cur.portfolio)} · Returns: ${pct(cur.returns)}\n\n| Asset | Current | Recommended |\n|---|---|---|\n| Equity | ${pct(ca.equity)} | ${pct(ra.equity)} |\n| Debt | ${pct(ca.debt)} | ${pct(ra.debt)} |\n\n💡 ${rec.reasoning || "Rebalance based on your risk profile."}`;
    }
    case "getFinancialProfile": {
      const nw = data.netWorth || {}, mo = data.monthly || {}, ef = data.emergencyFund || {};
      if (!n(mo.income) && !n(nw.total)) return "⚠️ Your profile is empty. Please complete it in **Settings** — add income, expenses, investments, and loans.";
      return `## 👤 Financial Overview\n\n| | Amount |\n|---|---|\n| Net Worth | **${fmt(nw.total)}** |\n| Monthly Income | **${fmt(mo.income)}** |\n| Monthly Expenses | ${fmt(mo.expense)} |\n| Monthly Savings | ${fmt(mo.savings)} |\n| Savings Rate | ${pct(mo.savingsRate)} |\n| Emergency Fund | ${n(ef.coverage).toFixed(1)} months |`;
    }
    default:
      return `Data:\n\`\`\`\n${JSON.stringify(data, null, 2).slice(0, 1000)}\`\`\``;
  }
}

// ── Call Gemini ───────────────────────────────────────────────────────────────
// systemInstruction is passed to getModel() — Gemini's native system prompt slot.
// The user-facing `prompt` should contain ONLY the question + data context, never the system prompt.
const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL_CHAT || "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

function isOverloadedError(err) {
  const msg = (err?.message || "").toLowerCase();
  return msg.includes("503") || msg.includes("overloaded") || msg.includes("high demand") || msg.includes("unavailable");
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(prompt, history = []) {
  if (!process.env.GEMINI_API_KEY) return null;

  for (let i = 0; i < FALLBACK_MODELS.length; i++) {
    const modelName = FALLBACK_MODELS[i];
    // Up to 2 attempts per model with short backoff before moving to the next model
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const model = getModel(AI_CONFIG.systemPrompt, modelName);
        const geminiChat = model.startChat({ history });
        const result = await geminiChat.sendMessage(prompt);
        const text = result.response.text();
        return text && text.length > 20 ? text : null;
      } catch (err) {
        const overloaded = isOverloadedError(err);
        console.error(`Gemini error (model=${modelName}, attempt=${attempt + 1}):`, err.message);
        if (!overloaded) return null; // Non-retryable error (auth, bad request, etc.)
        if (attempt === 0) await sleep(600); // brief backoff before retrying same model
      }
    }
    // Move to next fallback model
  }
  return null; // All models/attempts exhausted
}

// ── Generate a clean conversation title (Claude/ChatGPT-style) ───────────────
// BUG FIX: previously every new conversation was titled via
// `message.substring(0, 60)` — the raw first message, untouched. For short
// greetings ("hey", "hi") this means every single chat in the sidebar shows
// the identical title with no way to tell them apart. This generates a
// short, distinct title via a quick LLM call instead, falling back to a
// clean word-boundary truncation (not mid-word) only if that call fails.
async function generateTitle(message) {
  const prompt = `Generate a short, clean title (max 5 words, no quotes, no punctuation at the end) for a conversation that starts with this message:

"${message}"

Reply with ONLY the title text, nothing else.`;

  try {
    const title = await callGemini(prompt, []);
    if (title) {
      const cleaned = title.trim().replace(/^["']|["']$/g, "").split("\n")[0];
      if (cleaned.length > 0 && cleaned.length <= 60) return cleaned;
    }
  } catch (err) {
    console.error("generateTitle error:", err.message);
  }

  // Fallback: truncate cleanly at a word boundary instead of mid-word,
  // and append an ellipsis so distinct long messages don't collapse to
  // the same truncated prefix.
  const truncated = message.substring(0, 50);
  const lastSpace = truncated.lastIndexOf(" ");
  const base = lastSpace > 20 ? truncated.substring(0, lastSpace) : truncated;
  return base + (message.length > 50 ? "…" : "");
}

// ── Main chat function ────────────────────────────────────────────────────────
async function chat(userId, message, conversationId = null) {
  try {
    // 1. Conversation management
    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findById(conversationId);
      if (!conversation || conversation.userId !== userId)
        return { error: "Conversation not found or unauthorised." };
    } else {
      const title = await generateTitle(message);
      conversation = await AIConversation.create(userId, title);
      conversationId = conversation.id;
    }

    // 2. Store user message
    await AIMessage.create({ conversationId, role: "user", content: message });

    // 3. Load recent history for context
    const allMessages = await AIMessage.findByConversationId(conversationId);
    const recentHistory = allMessages.slice(-10);
    const geminiHistory = recentHistory.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    let responseText = "";

    // 4. Route: greeting → general knowledge → personal data
    if (isGreeting(message)) {
      // ── Greeting / small talk: warm reply, no tools ──────────────────────
      const prompt = `The user sent: "${message}"

This is a greeting or casual message — NOT a financial question.
Respond warmly and briefly (1-2 sentences max).
Then offer one natural suggestion of what you can help with, e.g. checking their financial health, budget, investments, or goals.
Do NOT show any financial data or scores.`;

      responseText = await callGemini(prompt, geminiHistory);

      if (!responseText) {
        const greetings = [
          "Hey! 👋 I'm SmartFinance AI, your personal wealth advisor. Ask me about your budget, investments, loans, or financial health score!",
          "Hello! 😊 Ready to help with your finances — want to check your financial health score, review your budget, or plan your investments?",
          "Hi there! 👋 I can help you with your budget, investments, goals, tax planning, and more. What would you like to explore?",
        ];
        responseText = greetings[Math.floor(Math.random() * greetings.length)];
      }

    } else if (isGeneralKnowledge(message)) {
      // ── General knowledge: answer directly with Gemini, no tools ────────────
      const prompt = `USER QUESTION: "${message}"

This is a general financial knowledge question — not about the user's personal account data.
Answer as an expert Indian financial advisor. Be specific, practical, and relevant to Indian markets.
Use ₹, Indian market context (NSE/BSE, Indian MFs, Indian tax laws).
Format with markdown. Keep it under 250 words.`;

      responseText = await callGemini(prompt, geminiHistory);

      if (!responseText) {
        responseText = `I'd be happy to help with that! For the most current market data and stock recommendations, check:\n\n• **NSE India** — nseindia.com\n• **BSE India** — bseindia.com\n• **Screener.in** — for stock analysis\n• **Value Research** — for mutual fund ratings\n\nFor personalised advice based on *your* financial situation, ask me about your portfolio, budget, goals, or health score!`;
      }

    } else {
      // ── Personal data: run tools and answer based on real data ────────────
      const toolNames = classifyIntents(message);

      // If no specific intent matched, fetch a comprehensive financial snapshot
      // so Gemini can REASON over the full picture for growth/planning/rare questions
      // — instead of just clarifying.
      const COMPREHENSIVE_TOOLS = [
        "getFinancialProfile",
        "calculateHealthScore",
        "getInvestmentSummary",
        "getLoanSummary",
        "goalAnalysis",
        "budgetAnalysis",
        "riskAnalysis",
      ];
      const effectiveToolNames = toolNames || COMPREHENSIVE_TOOLS;
      const isComprehensive = !toolNames;

      const toolResults = await Promise.all(
        effectiveToolNames.map(async (toolName) => {
          const params = extractParams(message, toolName);
          const result = await executeTool(toolName, params, userId);
          return { toolName, params, result };
        })
      );

      const dataContext = toolResults
        .map(({ toolName, result }) => `### ${toolName}:\n${JSON.stringify(result, null, 2)}`)
        .join("\n\n");

      const prompt = isComprehensive
        ? `USER QUESTION: "${message}"

COMPLETE FINANCIAL PICTURE (net worth, budget, investments, loans, goals, risk profile, health score):
${dataContext}

INSTRUCTIONS:
- This is an open-ended question about growth, planning, strategy, or something not covered by a single specific tool.
- ANALYSE the full data above like an expert wealth advisor would — look across net worth, savings rate, investments, loans, goals, and risk profile together to form your answer.
- Reason about the user's situation: identify what's relevant to their question, connect the dots between different numbers, and give a thoughtful, personalised answer — not a generic template.
- Reference ACTUAL figures from the data (e.g. "with a savings rate of 12% and ₹X in equity exposure...").
- If the relevant data is empty/zero, say so clearly and guide them to add it in Settings — but still give whatever reasoning/guidance you can from what IS available.
- Use markdown with headers/tables where it aids clarity, but prioritise clear reasoning and specific, actionable next steps.
- Be precise and concise — aim for under 300 words, more only if the question genuinely needs depth.`
        : `USER QUESTION: "${message}"

USER'S REAL FINANCIAL DATA:
${dataContext}

INSTRUCTIONS:
- Answer the user's SPECIFIC question using ONLY the numbers from the data above
- Do NOT give generic advice — reference actual values (e.g. "Your savings rate is 18%", not "you should save more")
- If values are 0 or missing, say exactly that and guide them to add the data in Settings
- Use markdown formatting with headers and tables where helpful
- Be concise — under 250 words unless the question needs more`;

      responseText = await callGemini(prompt, geminiHistory);

      // Fallback: structured formatted response
      if (!responseText) {
        if (toolResults.length === 1) {
          responseText = buildFallbackResponse(toolResults[0].toolName, toolResults[0].result);
        } else {
          const parts = toolResults
            .map(({ toolName, result }) => buildFallbackResponse(toolName, result))
            .filter(r => r && !r.startsWith("⚠️"));
          responseText = parts.join("\n\n---\n\n") || buildFallbackResponse(toolResults[0].toolName, toolResults[0].result);
        }
      }

      const assistantMsg = await AIMessage.create({
        conversationId,
        role: "assistant",
        content: responseText,
        toolCalls: toolResults.map(t => ({ name: t.toolName, params: t.params, result: t.result })),
        totalTokens: Math.floor(responseText.length / 4),
      });

      return {
        conversationId,
        messageId: assistantMsg.id,
        content: responseText,
        toolCalls: toolResults.map(t => ({ name: t.toolName })),
      };
    }

    // For greeting / general knowledge — no tool calls
    const assistantMsg = await AIMessage.create({
      conversationId,
      role: "assistant",
      content: responseText,
      totalTokens: Math.floor(responseText.length / 4),
    });

    return {
      conversationId,
      messageId: assistantMsg.id,
      content: responseText,
    };

  } catch (err) {
    console.error("AI Chat Error:", err);
    return { error: err.message || "Something went wrong. Please try again." };
  }
}

// ── Conversation helpers ──────────────────────────────────────────────────────
async function getConversation(userId, conversationId) {
  const conv = await AIConversation.findById(conversationId);
  if (!conv || conv.userId !== userId) return { error: "Conversation not found." };
  const messages = await AIMessage.findByConversationId(conversationId);
  return {
    conversation: { id: conv.id, title: conv.title, createdAt: conv.createdAt, updatedAt: conv.updatedAt },
    messages: messages.map(m => ({ id: m.id, role: m.role, content: m.content, createdAt: m.createdAt })),
  };
}

async function listConversations(userId) {
  const convs = await AIConversation.findByUserId(userId);
  return convs.map(c => ({ id: c.id, title: c.title, lastMessageAt: c.updatedAt, createdAt: c.createdAt }));
}

async function deleteConversation(userId, conversationId) {
  const conv = await AIConversation.findById(conversationId);
  if (!conv || conv.userId !== userId) return { error: "Conversation not found." };
  await AIConversation.remove(conversationId);
  return { success: true };
}

module.exports = { chat, getConversation, listConversations, deleteConversation, TOOL_DEFINITIONS, AI_CONFIG };