# SmartFinance AI Wealth Assistant

Complete AI-powered financial advisory system with tool-calling architecture, conversation memory, and personalized insights.

## 📁 Structure

```
backend/
├── ai/
│   ├── aiService.js              # Core AI service with tool orchestration
│   └── tools/
│       └── financialTools.js     # 12 financial intelligence tools
├── controllers/
│   └── aiController.js           # Request handling & validation
├── routes/
│   └── aiRoutes.js               # API endpoints
└── models/
    └── AIEntities.js             # AIConversation, AIMessage models
```

## 🎯 Capabilities

### 1. Platform Assistant
- Answers general questions about SmartFinance
- Guides users through features
- Provides personalized onboarding

### 2. Financial Health Analysis
- Overall health score (0-100) with A/B/C/D grade
- Component breakdown (net worth, savings, debt, investment, emergency, insurance, goals)
- Strengths & weaknesses identification
- Actionable recommendations

### 3. Budget Advice
- Income/expense analysis
- Category-wise breakdown
- Savings rate optimization
- Spending pattern insights

### 4. Goal Planning
- Progress tracking for all goals
- Gap analysis
- Monthly contribution recommendations
- Timeline feasibility assessment

### 5. Retirement Planning
- Corpus projection based on current savings
- Required vs projected analysis
- Additional SIP recommendations
- Inflation-adjusted calculations

### 6. Loan Analysis
- Debt-to-income ratio assessment
- Loan prioritization (debt avalanche strategy)
- Prepayment recommendations
- EMI affordability check

### 7. Investment Analysis
- Portfolio returns calculation
- Diversification score
- Asset allocation recommendations
- Risk-adjusted performance

### 8. Emergency Fund Guidance
- 6-month coverage target
- Current vs required analysis
- Monthly savings plan

### 9. Risk Analysis
- Risk profile assessment (0-100)
- Conservative/Moderate/Aggressive categorization
- Recommended asset allocation by age

### 10. Tax Suggestions
- Section 80C optimization
- Home loan interest deductions
- Old vs New regime comparison
- Tax-saving investment recommendations

### 11. Affordability Analysis
- One-time purchase evaluation
- EMI-based purchase feasibility
- Impact on emergency fund
- Debt ratio implications

### 12. What-If Simulations
- Income change scenarios
- Expense change impact
- New loan simulations
- Goal feasibility testing

### 13. Wealth Coaching
- Long-term wealth projection
- Financial independence planning
- Milestone tracking
- Behavioral guidance

## 🔧 API Endpoints

### POST `/api/ai/chat`
Start or continue AI conversation

**Request:**
```json
{
  "message": "What's my financial health score?",
  "conversationId": "uuid" // optional, omit to start new
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "uuid",
    "messageId": "uuid",
    "content": "**Your Financial Health Score: 78/100 (Grade: B)**...",
    "toolCalls": [
      {
        "name": "calculateHealthScore",
        "params": {},
        "result": { /* tool output */ }
      }
    ]
  }
}
```

### GET `/api/ai/conversations`
List user's conversations

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "title": "Financial health analysis",
        "lastMessageAt": "2026-06-03T22:00:00Z",
        "createdAt": "2026-06-03T21:00:00Z"
      }
    ]
  }
}
```

### GET `/api/ai/conversations/:id`
Get conversation with full message history

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "uuid",
      "title": "Budget planning",
      "createdAt": "2026-06-03T21:00:00Z",
      "updatedAt": "2026-06-03T22:00:00Z"
    },
    "messages": [
      {
        "id": "uuid",
        "role": "user",
        "content": "How can I improve my budget?",
        "createdAt": "2026-06-03T21:05:00Z"
      },
      {
        "id": "uuid",
        "role": "assistant",
        "content": "Based on your budget analysis...",
        "createdAt": "2026-06-03T21:05:02Z"
      }
    ]
  }
}
```

### DELETE `/api/ai/conversations/:id`
Delete conversation

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Conversation deleted"
  }
}
```

### GET `/api/ai/tools`
List available AI tools and config

**Response:**
```json
{
  "success": true,
  "data": {
    "tools": [
      {
        "name": "getFinancialProfile",
        "description": "Get user's complete financial profile...",
        "parameters": { /* JSON schema */ }
      }
    ],
    "config": {
      "model": "gpt-4o",
      "maxTokens": 2000
    }
  }
}
```

## 🛠️ Tools

### 1. getFinancialProfile()
Returns complete financial snapshot.

**Output:**
```javascript
{
  personal: { name, age, occupation, city },
  netWorth: { total, assets, liabilities },
  monthly: { income, expense, savings, savingsRate },
  emergencyFund: { coverage, status }
}
```

### 2. getInvestmentSummary()
Portfolio analysis with returns.

**Output:**
```javascript
{
  portfolio: { totalInvested, currentValue, returns, returnPct },
  monthlySIP: 15000,
  diversification: "medium",
  byType: { equity: 60, debt: 30, gold: 10 }
}
```

### 3. getLoanSummary()
Debt analysis with DTI ratio.

**Output:**
```javascript
{
  totalLoans: 2,
  totalOutstanding: 3500000,
  totalEMI: 45000,
  debtToIncomeRatio: 35.2,
  status: "moderate",
  loans: [{ type, outstanding, emi, rate }]
}
```

### 4. calculateHealthScore()
Financial health assessment.

**Output:**
```javascript
{
  score: 78,
  grade: "B",
  breakdown: { netWorth: 75, savings: 80, debt: 70, ... },
  strengths: ["High savings rate", "Good diversification"],
  weaknesses: ["Low emergency fund"],
  recommendations: ["Build 6-month emergency fund", ...]
}
```

### 5. budgetAnalysis()
Monthly budget breakdown.

**Output:**
```javascript
{
  income: 100000,
  expenses: 65000,
  savings: 35000,
  savingsRate: 35,
  status: "healthy",
  categoryBreakdown: { groceries: 10000, rent: 25000, ... },
  recommendations: [...]
}
```

### 6. goalAnalysis()
Goal progress tracking.

**Output:**
```javascript
{
  totalGoals: 5,
  onTrack: 3,
  goals: [
    {
      name: "Home Down Payment",
      progress: 45.5,
      gap: 1500000,
      monthlyNeeded: 25000,
      currentContribution: 20000,
      status: "behind"
    }
  ]
}
```

### 7. retirementAnalysis()
Retirement corpus projection.

**Output:**
```javascript
{
  currentAge: 35,
  retirementAge: 60,
  projectedCorpus: 25000000,
  requiredCorpus: 30000000,
  gap: 5000000,
  sufficient: false,
  additionalSIPNeeded: 5000
}
```

### 8. riskAnalysis()
Risk profile assessment.

**Output:**
```javascript
{
  score: 72,
  category: "moderate",
  allocation: { equity: 65, debt: 30, gold: 5 },
  factors: { age: 35, experience: "intermediate", ... }
}
```

### 9. emergencyFundCheck()
Emergency fund adequacy.

**Output:**
```javascript
{
  currentAmount: 200000,
  targetAmount: 390000,
  coverage: 3.1,
  gap: 190000,
  status: "insufficient",
  sufficient: false
}
```

### 10. affordabilityCheck(amount, type)
Purchase affordability analysis.

**Parameters:**
- `amount` (number): Purchase amount
- `type` (string): "one_time" | "emi"

**Output:**
```javascript
{
  canAfford: true,
  recommendation: "Affordable but will impact emergency fund",
  details: { liquidAssets: 500000, remainingLiquid: 300000, ... }
}
```

### 11. wealthForecast(years)
Wealth projection over time.

**Parameters:**
- `years` (number): Projection period (default: 10)

**Output:**
```javascript
{
  currentWealth: 2500000,
  projectedWealth: 8750000,
  years: 10,
  growthRate: 12,
  monthlySIP: 15000
}
```

### 12. whatIfSimulator(changes)
Scenario simulation.

**Parameters:**
```javascript
{
  incomeChange: 10000,  // +₹10k income
  expenseChange: -5000  // -₹5k expenses
}
```

**Output:**
```javascript
{
  baseline: { income: 100000, expense: 65000, savings: 35000, savingsRate: 35 },
  modified: { income: 110000, expense: 60000, savings: 50000, savingsRate: 45.5 },
  impact: { savingsChange: 15000, savingsRateChange: 10.5 }
}
```

## 🔒 Security

### Authentication
- All endpoints require valid JWT token
- Chat endpoint requires complete user profile
- Conversation access validated per user

### Rate Limiting
- 50 AI requests per 15 minutes per user
- Prevents abuse and manages costs

### Data Privacy
- Tools never directly query database
- All data access via financial intelligence layer
- No cross-user data leakage

### Input Validation
- Message length limited to 5000 characters
- Conversation ID validated
- User ownership verified

## 🧪 Testing

### Manual Test Flow

1. **Start conversation:**
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is my financial health score?"}'
```

2. **Continue conversation:**
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How can I improve it?",
    "conversationId": "CONVERSATION_ID_FROM_STEP_1"
  }'
```

3. **List conversations:**
```bash
curl -X GET http://localhost:5000/api/ai/conversations \
  -H "Authorization: Bearer YOUR_JWT"
```

### Sample Queries

**Health Analysis:**
- "What's my financial health score?"
- "How am I doing financially?"
- "Analyze my financial situation"

**Budget:**
- "Show me my budget breakdown"
- "How much am I spending on groceries?"
- "Can I save more?"

**Investments:**
- "How is my investment portfolio performing?"
- "What's my portfolio return?"
- "Should I diversify more?"

**Loans:**
- "Show my loan summary"
- "What's my debt-to-income ratio?"
- "Which loan should I pay first?"

**Goals:**
- "Am I on track for my goals?"
- "How much should I save for home down payment?"
- "Show my goal progress"

**Retirement:**
- "Will I have enough for retirement?"
- "How much should I increase my SIP?"
- "Show retirement projection"

**Emergency Fund:**
- "Is my emergency fund adequate?"
- "How much more should I save?"
- "Check emergency fund status"

**Affordability:**
- "Can I afford a ₹50,000 phone?"
- "Should I buy a ₹20L car on EMI?"
- "Can I afford this purchase?"

**Forecasting:**
- "What will my wealth be in 10 years?"
- "Project my wealth growth"
- "When will I reach 1 crore?"

**Simulations:**
- "What if I get a ₹20k raise?"
- "What if I reduce expenses by ₹10k?"
- "Simulate a new loan impact"

## 🚀 Integration Notes

### Current Implementation
- **Mock AI**: Rule-based routing for demonstration
- **Tool execution**: Fully functional
- **Data layer**: Production-ready
- **Conversation storage**: PostgreSQL

### Production Upgrade Path

**Replace mock AI with real LLM:**

```javascript
// In aiService.js, replace callAI() function

const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function callAI(messages, userId) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    tools: TOOL_DEFINITIONS,
    tool_choice: "auto",
    temperature: 0.7,
    max_tokens: 2000,
  });

  const choice = response.choices[0];
  
  // Handle tool calls
  if (choice.finish_reason === "tool_calls") {
    const toolCalls = choice.message.tool_calls;
    const toolResults = [];

    for (const toolCall of toolCalls) {
      const result = await executeTool(
        toolCall.function.name,
        JSON.parse(toolCall.function.arguments),
        userId
      );
      toolResults.push({ ...toolCall, result });
    }

    // Send tool results back to AI
    const followUp = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        ...messages,
        choice.message,
        ...toolResults.map(tr => ({
          role: "tool",
          tool_call_id: tr.id,
          content: JSON.stringify(tr.result)
        }))
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return {
      content: followUp.choices[0].message.content,
      toolCalls: toolResults,
      tokensUsed: response.usage.total_tokens + followUp.usage.total_tokens,
    };
  }

  return {
    content: choice.message.content,
    toolCalls: null,
    tokensUsed: response.usage.total_tokens,
  };
}
```

### Environment Variables

Add to `.env`:
```env
# AI Configuration
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
```

## 📊 Database Schema

Already created by Phase 1 migration (`backend/db/migrate_ai.js`):

```sql
-- Conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  context JSONB,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT,
  tool_calls JSONB,
  tool_call_id TEXT,
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## ⚡ Performance

### Response Times (estimated)
- Simple queries (health score): ~500ms
- Complex queries (retirement analysis): ~1-2s
- Multi-tool queries: ~2-3s

### Optimization Tips
1. **Cache tool results**: Add Redis caching for expensive calculations
2. **Parallel tool execution**: Execute independent tools simultaneously
3. **Conversation pruning**: Limit history to last 10 messages
4. **Token management**: Track and limit per-user token usage

### Caching Example

```javascript
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

async function cachedToolExecution(toolName, params, userId) {
  const cacheKey = `tool:${userId}:${toolName}:${JSON.stringify(params)}`;
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Execute tool
  const result = await executeTool(toolName, params, userId);
  
  // Cache for 5 minutes
  await redis.set(cacheKey, JSON.stringify(result), "EX", 300);
  
  return result;
}
```

## 🎓 Usage Patterns

### Conversational Flow
1. User asks broad question → AI calls `getFinancialProfile`
2. User drills down → AI calls specific tool (`budgetAnalysis`, `goalAnalysis`)
3. User requests action → AI calls simulation tool (`whatIfSimulator`, `affordabilityCheck`)
4. AI synthesizes insights across multiple tool calls

### Multi-Turn Context
- Previous tool results available in conversation history
- AI maintains context across turns
- Users can refer to previous answers

### Proactive Insights
- AI identifies patterns (e.g., low emergency fund)
- Suggests next steps (e.g., "Would you like me to create a savings plan?")
- Flags risks (e.g., high debt ratio)

## 🔮 Future Enhancements

1. **Voice Interface**: Convert to voice assistant
2. **Scheduled Reports**: Weekly/monthly financial summaries
3. **Alert Integration**: AI-generated alerts from `alerts` table
4. **Document Analysis**: Parse bank statements, investment reports
5. **Market Integration**: Real-time stock/MF prices
6. **Tax Filing**: AI-assisted ITR preparation
7. **Family Planning**: Multi-user household financial planning
8. **Behavioral Coaching**: Spending habit analysis and nudges

---

**Status:** ✅ Production-ready (mock AI) | 🚀 Upgrade to OpenAI for full functionality