# SmartFinance AI Wealth Assistant - Architecture

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Future)                           │
│  • Chat UI                                                            │
│  • Message history                                                    │
│  • Tool result visualization                                          │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ HTTPS
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                     │
│  POST   /api/ai/chat                    ← Main chat endpoint         │
│  GET    /api/ai/conversations           ← List conversations         │
│  GET    /api/ai/conversations/:id       ← Get conversation           │
│  DELETE /api/ai/conversations/:id       ← Delete conversation        │
│  GET    /api/ai/tools                   ← List available tools       │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
┌────────────────────────────┴─────────────────────────────────────────┐
│                      MIDDLEWARE STACK                                 │
│  [1] authenticate          ← JWT validation                           │
│  [2] requireProfileComplete ← Profile check                           │
│  [3] aiRateLimiter         ← 50 req/15min                            │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│                    AI CONTROLLER LAYER                                │
│  backend/controllers/aiController.js                                  │
│  • Request validation (message 1-5000 chars)                         │
│  • User ID extraction from JWT                                        │
│  • Error handling & response formatting                               │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│                     AI SERVICE LAYER                                  │
│  backend/ai/aiService.js                                              │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  chat(userId, message, conversationId)                        │   │
│  │  1. Get/create conversation                                   │   │
│  │  2. Store user message                                        │   │
│  │  3. Build message history (last 10)                           │   │
│  │  4. Call AI with tools                                        │   │
│  │  5. Store AI response                                         │   │
│  │  6. Update conversation timestamp                             │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  callAI(messages, userId)                                     │   │
│  │  • Parse user intent (mock: rule-based)                       │   │
│  │  • Select appropriate tool                                    │   │
│  │  • Execute tool via executeTool()                             │   │
│  │  • Format response with markdown                              │   │
│  │  • Return content + tool calls + tokens                       │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  executeTool(toolName, params, userId)                        │   │
│  │  • Route to correct tool function                             │   │
│  │  • Pass userId + params                                       │   │
│  │  • Return structured JSON                                     │   │
│  └───────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│                     TOOL LAYER (12 Tools)                             │
│  backend/ai/tools/financialTools.js                                   │
│                                                                        │
│  [1]  getFinancialProfile(userId)                                     │
│  [2]  getInvestmentSummary(userId)                                    │
│  [3]  getLoanSummary(userId)                                          │
│  [4]  calculateHealthScore(userId)                                    │
│  [5]  budgetAnalysis(userId)                                          │
│  [6]  goalAnalysis(userId)                                            │
│  [7]  retirementAnalysis(userId)                                      │
│  [8]  riskAnalysis(userId)                                            │
│  [9]  emergencyFundCheck(userId)                                      │
│  [10] affordabilityCheck(userId, amount, type)                        │
│  [11] wealthForecast(userId, years)                                   │
│  [12] whatIfSimulator(userId, changes)                                │
│                                                                        │
│  • No direct database access                                          │
│  • Returns structured JSON                                            │
│  • Reusable by any LLM                                                │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│            FINANCIAL INTELLIGENCE SERVICES (Phase 2)                  │
│  backend/services/financialIntelligence.js                            │
│                                                                        │
│  [1]  calculateFinancialHealthScore(userId)                           │
│  [2]  calculateNetWorth(userId)                                       │
│  [3]  calculateBudgetHealth(userId)                                   │
│  [4]  calculateEmergencyFund(userId, targetMonths)                    │
│  [5]  calculateDebtToIncomeRatio(userId)                              │
│  [6]  calculateGoalProgress(userId)                                   │
│  [7]  calculateInvestmentGrowth(userId)                               │
│  [8]  calculateRetirementCorpus(userId, params)                       │
│  [9]  calculateRiskProfile(userId)                                    │
│  [10] calculateAffordability(userId, amount, type)                    │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│                     MODEL LAYER (Phase 1)                             │
│  backend/models/                                                      │
│                                                                        │
│  • Income.js              → income_records table                      │
│  • Expense.js             → expense_records table                     │
│  • Loan.js                → loans table                               │
│  • Investment.js          → investments table                         │
│  • FinancialEntities.js   → sips, assets, goals tables               │
│  • PlanningEntities.js    → retirement_plans, financial_health_scores │
│  • AIEntities.js          → ai_conversations, ai_messages            │
│  • User.js                → users table (existing)                    │
│                                                                        │
│  Each model provides:                                                 │
│  • findByUserId(userId, filters)                                      │
│  • findById(id)                                                       │
│  • create(data)                                                       │
│  • update(id, fields)                                                 │
│  • remove(id)                                                         │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (PostgreSQL)                        │
│                                                                        │
│  Financial Tables (Phase 1):                                          │
│  • financial_profiles      • income_records                           │
│  • expense_records         • loans                                    │
│  • investments             • sips                                     │
│  • assets                  • goals                                    │
│  • retirement_plans        • financial_health_scores                  │
│  • alerts                                                             │
│                                                                        │
│  AI Tables (Phase 1):                                                 │
│  • ai_conversations (id, user_id, title, context, timestamps)        │
│  • ai_messages (id, conversation_id, role, content, tool_calls)      │
│                                                                        │
│  Existing Tables:                                                     │
│  • users                   • admins                                   │
│  • content                                                            │
└──────────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow Example

**User Query:** "What's my financial health score?"

```
1. Frontend (Future)
   POST /api/ai/chat
   { message: "What's my financial health score?" }
   
2. Middleware Stack
   ✓ JWT validated → userId = "123e4567..."
   ✓ Profile complete → has onboarding data
   ✓ Rate limit OK → 12/50 requests used
   
3. aiController.chat()
   • Validate message length (35 chars) ✓
   • Extract userId from req.user
   • Call aiService.chat(userId, message, null)
   
4. aiService.chat()
   • Create new conversation (conversationId = "abc123...")
   • Store user message in ai_messages
   • Build message array:
     [
       { role: "system", content: "You are SmartFinance AI..." },
       { role: "user", content: "What's my financial health score?" }
     ]
   • Call callAI(messages, userId)
   
5. aiService.callAI()
   • Parse query: contains "health" + "score"
   • Select tool: "calculateHealthScore"
   • Call executeTool("calculateHealthScore", {}, userId)
   
6. aiService.executeTool()
   • Route to tools.calculateHealthScore
   • Pass userId = "123e4567..."
   
7. financialTools.calculateHealthScore(userId)
   • Call calculateFinancialHealthScore(userId) from services
   • Receive result: { score: 78, grade: "B", ... }
   • Return structured JSON
   
8. Financial Intelligence Service
   • calculateFinancialHealthScore(userId)
   • Query models: Income, Expense, Loan, Investment, Asset
   • Calculate 7 components (net worth, savings, debt, etc.)
   • Weight components and compute overall score
   • Return { overallScore: 78, grade: "B", ... }
   
9. Models Layer
   • Income.findByUserId(userId)
   • Expense.findByUserId(userId)
   • Loan.findByUserId(userId, { status: "active" })
   • Investment.findByUserId(userId)
   • Asset.findByUserId(userId)
   • Each model queries PostgreSQL via pg pool
   
10. Database
    SELECT * FROM income_records WHERE user_id = '123e4567...' AND active = true;
    SELECT * FROM expense_records WHERE user_id = '123e4567...' AND active = true;
    SELECT * FROM loans WHERE user_id = '123e4567...' AND status = 'active';
    SELECT * FROM investments WHERE user_id = '123e4567...' AND active = true;
    SELECT * FROM assets WHERE user_id = '123e4567...' AND active = true;
    
11. aiService.callAI() continues
    • Format response with markdown
    • Return {
        content: "**Your Financial Health Score: 78/100...**",
        toolCalls: [{ name: "calculateHealthScore", result: {...} }],
        tokensUsed: 342
      }
      
12. aiService.chat() continues
    • Store assistant message in ai_messages
    • Update conversation last_message_at
    • Return response to controller
    
13. aiController.chat()
    • Wrap in ok() response helper
    • Send JSON to client
    
14. Frontend receives:
    {
      "success": true,
      "data": {
        "conversationId": "abc123...",
        "messageId": "def456...",
        "content": "**Your Financial Health Score: 78/100 (Grade: B)**\n\n..."
      }
    }
```

## 🧩 Data Flow Diagram

```
User Message
    ↓
[Authentication] → JWT decoded → userId
    ↓
[AI Service] → Intent detection → Tool selection
    ↓
[Tool Layer] → Abstraction → Service call
    ↓
[Financial Intelligence] → Calculation logic → Model queries
    ↓
[Models] → SQL generation → Database query
    ↓
[PostgreSQL] → Data retrieval
    ↓
[Models] → Format rows → Return objects
    ↓
[Financial Intelligence] → Compute metrics → Return structured data
    ↓
[Tool Layer] → Format output → Return JSON
    ↓
[AI Service] → Generate response → Store conversation
    ↓
[Controller] → Format response
    ↓
User receives formatted AI response
```

## 🔐 Security Layers

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 1: Authentication                                      │
│  • JWT token validation on every request                     │
│  • Token expiry check (7 days)                               │
│  • User existence verification                               │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Layer 2: Authorization                                       │
│  • Profile completion check (chat endpoint)                  │
│  • Conversation ownership verification                       │
│  • User data isolation (userId filtering)                    │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Layer 3: Rate Limiting                                       │
│  • 50 AI requests per 15 minutes per user                    │
│  • 300 global API requests per 15 minutes                    │
│  • 20 auth requests per 15 minutes                           │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Layer 4: Input Validation                                    │
│  • Message length: 1-5000 characters                         │
│  • Conversation ID: UUID format                              │
│  • Tool parameters: Type validation                          │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Layer 5: Data Access Control                                │
│  • No direct DB access from tools                            │
│  • All queries scoped to userId                              │
│  • Foreign key constraints enforce relationships             │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 Tool Execution Flow

```
User: "Can I afford a ₹50,000 phone?"
    ↓
Intent Detection
    ↓
Tool: affordabilityCheck
    ↓
executeTool("affordabilityCheck", { amount: 50000, type: "one_time" }, userId)
    ↓
financialTools.affordabilityCheck(userId, 50000, "one_time")
    ↓
calculateAffordability(userId, 50000, "one_time")
    ↓
Parallel Queries:
    ├─ calculateNetWorth(userId)
    │   ├─ Asset.findByUserId(userId)
    │   ├─ Investment.findByUserId(userId)
    │   └─ Loan.findByUserId(userId)
    │
    ├─ calculateBudgetHealth(userId)
    │   ├─ Income.findByUserId(userId)
    │   ├─ Expense.findByUserId(userId)
    │   └─ Loan.findByUserId(userId)
    │
    └─ calculateEmergencyFund(userId)
        ├─ Asset.findByUserId(userId, { type: 'liquid' })
        └─ Expense.findByUserId(userId)
    ↓
Calculate:
    • Liquid assets = ₹300,000
    • Purchase amount = ₹50,000
    • Remaining liquid = ₹250,000
    • Emergency fund target = ₹390,000 (6 months)
    • Coverage after = 3.8 months
    ↓
Return:
    {
      canAfford: true,
      recommendation: "Affordable but will reduce emergency fund coverage",
      details: {
        liquidAssets: 300000,
        remainingLiquid: 250000,
        emergencyFundImpact: { coverage: 3.8, acceptable: false }
      }
    }
    ↓
Format Response:
    "You can afford the ₹50,000 purchase, but it will reduce your
     emergency fund coverage from 4.6 to 3.8 months. Consider building
     emergency fund to 6 months before making this purchase."
```

## 📊 Conversation State Machine

```
[No Conversation]
    |
    | User sends first message
    ↓
[Conversation Created]
    |
    | conversationId = uuid
    | title = first 50 chars of message
    | Store user message
    ↓
[AI Processing]
    |
    | Tool execution
    | Response generation
    | Store assistant message
    ↓
[Conversation Active]
    |
    ├─ User continues conversation (provides conversationId)
    │  ↓
    │  [Load History] → Last 10 messages
    │  ↓
    │  [AI Processing with Context]
    │  ↓
    │  [Store New Messages]
    │  ↓
    │  Back to [Conversation Active]
    |
    └─ User starts new conversation (no conversationId)
       ↓
       Back to [Conversation Created]

[Conversation Deleted]
    |
    | CASCADE deletes all messages
    | No recovery possible
```

## 🎯 Tool Selection Logic (Mock AI)

```javascript
Query Analysis → Tool Selection

"health" OR "score"           → calculateHealthScore
"investment" OR "portfolio"   → getInvestmentSummary
"loan" OR "debt" OR "emi"     → getLoanSummary
"budget"                      → budgetAnalysis
"goal"                        → goalAnalysis
"retirement"                  → retirementAnalysis
"emergency"                   → emergencyFundCheck
"risk"                        → riskAnalysis
"forecast" OR "future"        → wealthForecast
"afford" + amount             → affordabilityCheck
"what if" OR "scenario"       → whatIfSimulator
default                       → getFinancialProfile
```

## 🚀 Production AI Flow (OpenAI)

```
User Message
    ↓
Build Messages Array
    [
      { role: "system", content: "You are SmartFinance AI..." },
      { role: "user", content: "What's my health score?" },
      ...conversation history...
    ]
    ↓
OpenAI API Call
    model: "gpt-4o"
    tools: [12 tool definitions with JSON schemas]
    tool_choice: "auto"
    ↓
AI Decision
    finish_reason: "tool_calls"
    tool_calls: [
      {
        id: "call_123",
        function: {
          name: "calculateHealthScore",
          arguments: "{}"
        }
      }
    ]
    ↓
Execute Tools
    for each tool_call:
      result = executeTool(name, arguments, userId)
    ↓
Send Tool Results Back
    messages: [
      ...previous messages...,
      { role: "assistant", content: null, tool_calls: [...] },
      { role: "tool", tool_call_id: "call_123", content: JSON.stringify(result) }
    ]
    ↓
OpenAI Final Response
    finish_reason: "stop"
    content: "Your financial health score is 78/100 (Grade B)...
              Here's what that means:..."
    ↓
Store & Return
```

---

**This architecture enables:**
- ✅ Separation of concerns
- ✅ Testability at every layer
- ✅ Scalability (tool layer can be distributed)
- ✅ Security (multiple validation layers)
- ✅ Maintainability (clear boundaries)
- ✅ Extensibility (easy to add new tools)