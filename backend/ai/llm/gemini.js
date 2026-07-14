const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Pass systemInstruction so Gemini treats it as a system prompt, not a user message
// modelName allows callers to override the default model (used for fallback on overload)
function getModel(systemInstruction, modelName) {
  return genAI.getGenerativeModel({
    model: modelName || process.env.GEMINI_MODEL_CHAT || "gemini-3.5-flash",
    generationConfig: {
      temperature: 0.35,
      topP: 0.8,
      topK: 32,
    },
    ...(systemInstruction ? { systemInstruction } : {}),
  });
}

function getEmbeddingModel() {
  return genAI.getGenerativeModel({ model: "text-embedding-004" });
}

async function generateEmbedding(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Text is required for embedding generation.");
  }

  const embeddingModel = getEmbeddingModel();
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }] },
  });

  if (!result?.embedding?.values) {
    throw new Error("Embedding generation failed.");
  }

  return result.embedding.values;
}

module.exports = { getModel, getEmbeddingModel, generateEmbedding };
