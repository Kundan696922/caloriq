const { AppError } = require("../middleware/errorHandler");

/**
 * Thin Gemini client using plain fetch (same approach as foodService.js, so no
 * new dependency). Requests JSON output constrained by a response schema and
 * normalizes every failure mode into an AppError.
 *
 * Env:
 *   GEMINI_API_KEY            required
 *   GEMINI_MODEL              optional, defaults to DEFAULT_MODEL. Model names
 *                             change over time: check which ones your key can
 *                             use in Google AI Studio.
 *   GEMINI_THINKING_BUDGET    optional integer. Some "thinking" models spend
 *                             output tokens on reasoning; set 0 to disable
 *                             where the model allows it (faster, cheaper).
 */

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-2.5-flash";
const REQUEST_TIMEOUT_MS = 45000;

function getConfig() {
  const apiKey = process.env.GEMINI_MEAL_API_KEY;
  if (!apiKey) {
    throw new AppError(
      "AI meal generation is not configured. Set GEMINI_MEAL_API_KEY in your .env file.",
      500,
    );
  }
  return { apiKey, model: process.env.GEMINI_MODEL || DEFAULT_MODEL };
}

function retryable(message, statusCode) {
  const err = new AppError(message, statusCode);
  err.retryable = true;
  return err;
}

/** Parses model text as JSON, tolerating stray markdown code fences. */
function parseJsonText(text) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

/**
 * @returns {Promise<{ data: object, model: string }>} parsed JSON from the model
 */
async function generateJson({
  systemPrompt,
  userPrompt,
  responseSchema,
  temperature = 0.7,
  maxOutputTokens = 8192,
}) {
  const { apiKey, model } = getConfig();
  const url = `${GEMINI_BASE_URL}/models/${encodeURIComponent(model)}:generateContent`;

  const generationConfig = {
    responseMimeType: "application/json",
    responseSchema,
    temperature,
    maxOutputTokens,
  };
  const thinkingBudget = process.env.GEMINI_THINKING_BUDGET;
  if (thinkingBudget !== undefined && thinkingBudget !== "") {
    generationConfig.thinkingConfig = {
      thinkingBudget: Number(thinkingBudget),
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  let rawText;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Key goes in a header, not the URL, so it never lands in access logs.
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig,
      }),
      signal: controller.signal,
    });
    rawText = await response.text();
  } catch (err) {
    if (err.name === "AbortError") {
      throw retryable(
        "The AI service took too long to respond. Please try again.",
        504,
      );
    }
    throw retryable("Could not reach the AI service. Please try again.", 502);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    // Log provider detail server-side only; never forward it to the client.
    console.error(
      `[ai] Gemini error ${response.status}: ${rawText.slice(0, 400)}`,
    );

    if (response.status === 429) {
      throw new AppError(
        "The AI service is busy or its quota was reached. Please try again in a minute.",
        429,
      );
    }
    if (response.status === 404) {
      throw new AppError(
        "The configured AI model was not found. Check GEMINI_MODEL.",
        502,
      );
    }
    if ([400, 401, 403].includes(response.status)) {
      throw new AppError(
        "The AI service rejected the request. Check GEMINI_API_KEY and GEMINI_MODEL.",
        502,
      );
    }
    throw retryable("The AI service returned an error. Please try again.", 502);
  }

  let payload;
  try {
    payload = JSON.parse(rawText);
  } catch (err) {
    throw retryable("Received an invalid response from the AI service.", 502);
  }

  if (payload.promptFeedback?.blockReason) {
    throw new AppError(
      "That request was blocked by the AI safety filters. Try changing your preferences or notes.",
      422,
    );
  }

  const candidate = payload.candidates?.[0];
  const finishReason = candidate?.finishReason;

  if (
    [
      "SAFETY",
      "PROHIBITED_CONTENT",
      "BLOCKLIST",
      "SPII",
      "RECITATION",
    ].includes(finishReason)
  ) {
    throw new AppError(
      "The AI safety filters blocked this response. Try changing your preferences or notes.",
      422,
    );
  }
  if (finishReason === "MAX_TOKENS") {
    throw retryable("The AI response was cut off. Please try again.", 502);
  }

  const text = (candidate?.content?.parts || [])
    .filter((part) => typeof part.text === "string" && !part.thought)
    .map((part) => part.text)
    .join("");

  if (!text) {
    throw retryable("The AI service returned an empty response.", 502);
  }

  try {
    return { data: parseJsonText(text), model: payload.modelVersion || model };
  } catch (err) {
    throw retryable("The AI service returned malformed data.", 502);
  }
}

module.exports = { generateJson };
