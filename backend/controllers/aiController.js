// ── AI Wealth Assistant Controller ────────────────────────────────────────────

const aiService = require("../ai/aiService");
const { ok, fail } = require("../utils/response");

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
async function chat(req, res) {
  try {
    const userId = req.user.id;
    const { message, conversationId } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return fail(res, "Message is required", 400);
    }

    if (message.length > 5000) {
      return fail(res, "Message too long (max 5000 characters)", 400);
    }

    const result = await aiService.chat(userId, message.trim(), conversationId || null);

    if (result.error) {
      return fail(res, result.error, 400);
    }

    return ok(res, result);
  } catch (err) {
    console.error("AI Chat Error:", err);
    return fail(res, "Failed to process chat message", 500);
  }
}

// ── GET /api/ai/conversations ─────────────────────────────────────────────────
async function listConversations(req, res) {
  try {
    const userId = req.user.id;
    const conversations = await aiService.listConversations(userId);
    return ok(res, { conversations });
  } catch (err) {
    console.error("List Conversations Error:", err);
    return fail(res, "Failed to fetch conversations", 500);
  }
}

// ── GET /api/ai/conversations/:id ─────────────────────────────────────────────
async function getConversation(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await aiService.getConversation(userId, id);

    if (result.error) {
      return fail(res, result.error, 404);
    }

    return ok(res, result);
  } catch (err) {
    console.error("Get Conversation Error:", err);
    return fail(res, "Failed to fetch conversation", 500);
  }
}

// ── DELETE /api/ai/conversations/:id ──────────────────────────────────────────
async function deleteConversation(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await aiService.deleteConversation(userId, id);

    if (result.error) {
      return fail(res, result.error, 404);
    }

    return ok(res, { message: "Conversation deleted" });
  } catch (err) {
    console.error("Delete Conversation Error:", err);
    return fail(res, "Failed to delete conversation", 500);
  }
}

// ── GET /api/ai/tools ─────────────────────────────────────────────────────────
function listTools(req, res) {
  return ok(res, {
    tools: aiService.TOOL_DEFINITIONS,
    config: {
      model: aiService.AI_CONFIG.model,
      maxTokens: aiService.AI_CONFIG.maxTokens,
    },
  });
}

module.exports = {
  chat,
  listConversations,
  getConversation,
  deleteConversation,
  listTools,
};
