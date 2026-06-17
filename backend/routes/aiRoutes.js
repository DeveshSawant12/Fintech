// ── AI Wealth Assistant Routes ────────────────────────────────────────────────

const express    = require("express");
const router     = express.Router();
const aiController = require("../controllers/aiController");
const { authenticate } = require("../middleware/auth");
const rateLimit  = require("express-rate-limit");

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: "Too many AI requests, please try again later." },
});

// All AI routes require login — NO requireProfileComplete (let the agent
// handle empty data gracefully instead of hard-blocking the user)
router.use(authenticate);

router.post("/chat",              aiRateLimiter, aiController.chat);
router.get("/conversations",                    aiController.listConversations);
router.get("/conversations/:id",                aiController.getConversation);
router.delete("/conversations/:id",             aiController.deleteConversation);
router.get("/tools",                            aiController.listTools);

module.exports = router;