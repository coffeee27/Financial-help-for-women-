

import axios from "axios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL =
  import.meta.env.VITE_GROQ_MODEL || "llama-3.3-70b-versatile";

// System prompt defines the AI's personality and scope.
const SYSTEM_PROMPT = `You are a trusted, friendly financial mentor for women.

Tone: friendly, professional, simple language, patient, encouraging.
Never judge the user. Never make the user feel financially incapable.
Explain concepts in beginner-friendly language, avoid jargon unless you explain it.

You help with: savings, budget planning, emergency funds, bank accounts, UPI and digital payments,
financial fraud and scam detection advice, investments, mutual funds, fixed deposits, insurance basics,
government schemes for women, and financial goal planning.

Keep answers concise (2-4 sentences) unless the user asks for detail, since responses may be read aloud.
Use ₹ (INR) when discussing money unless the user specifies another currency.`;

/**
 * Sends a message (with conversation history) to Groq and returns the assistant's reply.
 * @param {string} message - the latest user message
 * @param {Array<{role: string, content: string}>} history - prior conversation turns (role/content only)
 * @returns {Promise<string>} assistant reply text
 */
export async function sendMessage(message, history = [], language = "en" ) {
  const languageInstruction =
    language === "hi"
      ? "\n\nRespond in Hindi (Devanagari script), simple conversational Hindi, not overly formal."
      : "\n\nRespond in English.";


  if (!message || !message.trim()) {
    throw new Error("Message cannot be empty.");
  }

  if (!GROQ_API_KEY) {
    throw new Error(
      "Groq API key is missing. Add VITE_GROQ_API_KEY to your .env file."
    );
  }

  // Build the messages array: system prompt + prior turns + new user message
  const messages = [
    { role: "system", content: SYSTEM_PROMPT + languageInstruction },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages,
        temperature: 0.6,
        top_p: 0.9,
        max_tokens: 400,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000, // 20s timeout
      }
    );

    const reply = response?.data?.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("Received an empty response from the AI.");
    }

    return reply.trim();
  } catch (error) {
    if (axios.isCancel(error)) {
      throw new Error("Request was cancelled.");
    }
    if (error.code === "ECONNABORTED") {
      throw new Error("The request timed out. Please try again.");
    }
    if (error.response) {
      // Groq returned an error status
      const status = error.response.status;
      if (status === 401) {
        throw new Error("Invalid Groq API key. Please check your .env file.");
      }
      if (status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      }
      throw new Error(
        error.response.data?.error?.message ||
          "The AI service returned an error. Please try again."
      );
    }
    if (error.request) {
      throw new Error("Network error. Please check your internet connection.");
    }
    throw new Error(error.message || "Something went wrong. Please try again.");
  }
}