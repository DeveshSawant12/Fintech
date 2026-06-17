# AI Wealth Assistant - Quick Start

## 🚀 Setup (5 minutes)

### 1. Database Migration
```bash
cd backend
node db/migrate_ai.js
```

### 2. Start Backend
```bash
npm run dev
```

### 3. Test Endpoint
```bash
# Get JWT token first (use existing auth endpoints)
export TOKEN="your_jwt_token_here"

# Start AI conversation
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is my financial health score?"}'
```

## 📝 Quick Examples

### Get Financial Health
```javascript
POST /api/ai/chat
{
  "message": "What's my financial health score?"
}
```

### Budget Analysis
```javascript
POST /api/ai/chat
{
  "message": "Show me my budget breakdown"
}
```

### Investment Review
```javascript
POST /api/ai/chat
{
  "message": "How is my portfolio performing?"
}
```

### Affordability Check
```javascript
POST /api/ai/chat
{
  "message": "Can I afford a ₹50,000 phone?"
}
```

### Continue Conversation
```javascript
POST /api/ai/chat
{
  "message": "How can I improve it?",
  "conversationId": "uuid-from-previous-response"
}
```

## 🔧 Architecture

```
User Message
     ↓
aiController.chat() ← Authentication & Validation
     ↓
aiService.chat() ← Conversation Management
     ↓
callAI() ← AI Processing (currently mock)
     ↓
executeTool() ← Financial Intelligence Layer
     ↓
Financial Services (calculateHealthScore, etc.)
     ↓
Models (Income, Expense, Investment, Loan, etc.)
     ↓
Database (PostgreSQL)
```

## 🛠️ Adding New Tools

### 1. Create Tool Function
```javascript
// backend/ai/tools/financialTools.js

async function myNewTool(userId, params) {
  const data = await SomeModel.findByUserId(userId);
  return {
    result: "processed data",
    insights: ["insight 1", "insight 2"]
  };
}

module.exports = {
  // ... existing tools
  myNewTool,
};
```

### 2. Register Tool
```javascript
// backend/ai/aiService.js

const TOOL_DEFINITIONS = [
  // ... existing tools
  {
    name: "myNewTool",
    description: "What this tool does",
    parameters: {
      type: "object",
      properties: {
        param1: { type: "string", description: "Parameter description" }
      },
      required: ["param1"]
    }
  }
];
```

### 3. Add Routing Logic
```javascript
// backend/ai/aiService.js - in callAI() function

if (userQuery.includes("my new feature")) {
  toolToCall = "myNewTool";
  toolParams = { param1: "value" };
}
```

## 🔌 Upgrade to Real AI

### Install OpenAI SDK
```bash
npm install openai
```

### Update aiService.js
```javascript
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function callAI(messages, userId) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    tools: TOOL_DEFINITIONS.map(t => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }
    })),
    tool_choice: "auto",
  });

  // Handle tool calls
  const choice = response.choices[0];
  if (choice.finish_reason === "tool_calls") {
    const toolCalls = choice.message.tool_calls;
    const results = [];

    for (const tc of toolCalls) {
      const result = await executeTool(
        tc.function.name,
        JSON.parse(tc.function.arguments),
        userId
      );
      results.push(result);
    }

    // Send results back to AI for final response
    // (see full implementation in README.md)
  }

  return {
    content: choice.message.content,
    tokensUsed: response.usage.total_tokens
  };
}
```

### Add Environment Variable
```env
OPENAI_API_KEY=sk-proj-...
```

## 📊 Monitoring

### Check AI Usage
```sql
-- Total conversations
SELECT COUNT(*) FROM ai_conversations WHERE user_id = 'uuid';

-- Total messages
SELECT COUNT(*) FROM ai_messages WHERE conversation_id = 'uuid';

-- Token usage
SELECT SUM(tokens_used) FROM ai_messages WHERE conversation_id = 'uuid';
```

### Popular Tools
```sql
SELECT 
  tool_calls->>0->>'name' as tool_name,
  COUNT(*) as usage_count
FROM ai_messages
WHERE tool_calls IS NOT NULL
GROUP BY tool_name
ORDER BY usage_count DESC;
```

## 🐛 Troubleshooting

### "Conversation not found"
- Ensure `conversationId` is valid UUID
- Check user owns the conversation
- Verify conversation exists in database

### "Profile incomplete"
- User must complete onboarding first
- Check `profile_complete = true` in users table

### Rate limit errors
- Default: 50 requests per 15 minutes
- Adjust in `backend/routes/aiRoutes.js`

### Tool returns error
- Check user has required data (income, expenses, etc.)
- Verify foreign key relationships
- Check database migration ran successfully

## 🧪 Testing Tools Directly

```javascript
// backend/test-tools.js
const tools = require("./ai/tools/financialTools");

(async () => {
  const userId = "your-test-user-id";
  
  // Test health score
  const health = await tools.calculateHealthScore(userId);
  console.log("Health Score:", health);
  
  // Test investment summary
  const investments = await tools.getInvestmentSummary(userId);
  console.log("Investments:", investments);
})();
```

Run: `node backend/test-tools.js`

## 📚 Next Steps

1. **Read Full Docs**: `backend/ai/README.md`
2. **Review Tools**: `backend/ai/tools/financialTools.js`
3. **Test Chat**: Use Postman/curl to interact
4. **Add Frontend**: Build chat UI (separate task)
5. **Deploy**: Set up OpenAI API key for production

---

**Questions?** Check `backend/ai/README.md` for detailed documentation.