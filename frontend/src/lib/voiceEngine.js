/* ============================================================
   TIJORI VOICE ENGINE — Person B
   Ported from the standalone harness. Framework-free on purpose:
   it takes a state object and returns a new one, so React owns
   the state and this file owns the language.

   Three tiers:
     1. fastPath  — unambiguous ledger questions, 0ms, no network
     2. Groq      — everything else, ~450ms
     3. keywords  — Groq unreachable, demo keeps running
   ============================================================ */

import { saveToGoal, withdraw } from "../services/goalService";

/* Key comes from .env.local (gitignored) so it never lands in the repo —
 * scrapers watch public commits for `gsk_` and Groq revokes on detection,
 * which would kill the voice demo. See .env.example.
 *
 * Still a browser-side call: anyone with devtools open on a deployed build can
 * read it. Fine for a hackathon; move to a server route before this is real.
 * Without a key the app silently falls back to the keyword tier. */
const GROQ_API_KEY = import.meta.env.VITE_GROQ_KEY || "";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const TIMEOUT_MS = 8000;
const HISTORY_TURNS = 6;

let history = [];
export function resetHistory() {
  history = [];
}

const normalize = (t) => (t || "").toLowerCase().trim();

/* ---------- Tier 1: local ledger fast-path ---------- */
export function fastPath(transcriptRaw) {
  const t = normalize(transcriptRaw);
  const num = t.match(/\d+/);

  const balanceQ = ["bachat kitni", "बचत कितनी", "kitni bachat", "कितनी बचत", "balance kitna",
    "बैलेंस कितना", "kitna balance", "mera balance", "मेरा बैलेंस", "मेरी बचत"];
  const safeQ = ["kitna bacha sakti", "कितना बचा सकती", "is hafte kitna", "इस हफ्ते कितना", "safe to save"];
  const progressQ = ["aur kitna", "और कितना", "kitna door", "कितना दूर", "lakshya", "लक्ष्य", "goal kitna"];
  const saveVerb = ["bachao", "बचाओ", "jama", "जमा", "daal", "डाल", "rakho", "रखो", "save"];
  const takeVerb = ["nikal", "निकाल", "withdraw"];

  const hasAction = saveVerb.some((k) => t.includes(k)) || takeVerb.some((k) => t.includes(k));
  const hasQuestion = balanceQ.some((k) => t.includes(k)) || safeQ.some((k) => t.includes(k))
    || progressQ.some((k) => t.includes(k));

  // Compound ("100 bachao aur batao lakshya kitna door hai"): one clause moves
  // money, the other asks. Answering the question here drops the transfer.
  if (hasAction && hasQuestion) return null;

  if (balanceQ.some((k) => t.includes(k)))
    return { intent: "get_balance", amount: null, reply: "आपकी छुपी हुई बचत अभी {{balance}} रुपये है।" };

  if (safeQ.some((k) => t.includes(k)))
    return { intent: "safe_to_save", amount: null, reply: "इस हफ्ते आप {{safe_to_save}} रुपये बचा सकती हैं।" };

  if (progressQ.some((k) => t.includes(k)))
    return { intent: "goal_progress", amount: null,
      reply: "{{goal_name}} के लिए अभी {{goal_saved}} रुपये हैं। लक्ष्य तक {{goal_remaining}} रुपये और चाहिए।" };

  // Digits only — word-numbers ("दो सौ") go to Groq, which reads them reliably.
  if (num && saveVerb.some((k) => t.includes(k)))
    return { intent: "save_goal", amount: parseInt(num[0], 10),
      reply: "{{amount}} रुपये {{goal_name}} में जमा कर दिए गए हैं। यह किसी को दिखेगा नहीं।" };

  if (num && takeVerb.some((k) => t.includes(k)))
    return { intent: "withdraw", amount: parseInt(num[0], 10),
      reply: "{{amount}} रुपये निकाल दिए गए हैं। अब {{balance}} रुपये बचे हैं।" };

  return null;
}

/* ---------- Tier 3: keyword fallback ---------- */
export function matchIntent(transcriptRaw) {
  const t = normalize(transcriptRaw);
  const balanceKeywords = ["bachat", "balance", "बचत", "बैलेंस", "kitni hai", "कितनी है", "kitna hai"];
  const saveKeywords = ["bachao", "save", "बचाओ", "jama", "जमा", "daal", "daalo", "डालो", "rakho", "रखो"];
  const num = t.match(/\d+/);

  if (saveKeywords.some((k) => t.includes(k)) && num)
    return { intent: "save_goal", amount: parseInt(num[0], 10), reply: "{{amount}} रुपये जमा कर दिए गए हैं।" };
  if (saveKeywords.some((k) => t.includes(k)))
    return { intent: "save_no_amount", amount: null, reply: 'कितने रुपये बचाना चाहती हैं? जैसे "दो सौ बचाओ" बोलें।' };
  if (balanceKeywords.some((k) => t.includes(k)))
    return { intent: "get_balance", amount: null, reply: "आपकी छुपी हुई बचत अभी {{balance}} रुपये है।" };
  return { intent: "unknown", amount: null,
    reply: 'माफ़ कीजिए, समझ नहीं आया। आप "मेरी बचत कितनी है" या "दो सौ बचाओ" बोल सकती हैं।' };
}

/* ---------- Tier 2: Groq ---------- */
function buildSystemPrompt(state) {
  const g = state.goal;
  return `You are Tijori — a calm, warm Hindi-speaking money coach for an Indian woman who may not read well and may share her phone with family members who must not learn about these savings.

CURRENT LEDGER (facts, never guess beyond these):
- hidden savings: ${state.hiddenSavings} rupees
- goal name: ${g ? g.name : "कोई लक्ष्य नहीं"}
- goal saved: ${g ? g.saved : 0} of ${g ? g.target : 0} rupees
- safe-to-save this week: ${state.safeToSave} rupees

YOU REPLY WITH JSON ONLY:
{ "intent": one of ["get_balance","save_goal","save_no_amount","withdraw","goal_progress","safe_to_save","reassure","smalltalk","unknown"],
  "amount": integer or null, "reply": "Hindi sentence", "confidence": 0.0-1.0 }

RULES FOR "reply":
1. Hindi, Devanagari, spoken register. One or two short sentences — it is read aloud, so no lists, no markdown.
2. NEVER write a literal number from the ledger. Use placeholders, substituted after you reply:
   {{balance}} {{goal_name}} {{goal_saved}} {{goal_target}} {{goal_remaining}} {{safe_to_save}} {{amount}}
   The values are ALREADY POST-TRANSACTION — do not add, subtract or recompute anything. If the deposit just happened, {{goal_saved}} already includes it. Never do arithmetic; you will get it wrong and contradict her screen.
   The only number you may write literally is one SHE just said.
   {{goal_name}} is a COMPLETE name — never add another noun like फंड or लक्ष्य right after it.
3. The action has ALREADY happened. Past tense — "जमा कर दिए गए हैं", never "जमा कर दिए जाएंगे".
4. You are a woman, a trusted Bank Sakhi. Feminine first-person: "मैं बता सकती हूँ", "मैं समझ नहीं पाई".
5. Intent rules: asks how much → get_balance. Names an amount to put away → save_goal (word-numbers: "दो सौ"=200, "पाँच सौ"=500, "हज़ार"=1000). Wants to save, no amount → save_no_amount. Wants money out → withdraw. Asks about the goal → goal_progress. Asks what she can afford → safe_to_save. Scared or asks what happens if someone finds out → reassure. Greeting or chit-chat → smalltalk. Unclear → unknown.
6. WITHDRAW SAFETY: if she names more than the balance, set "amount": null — never the balance, never what she asked. Say gently that only {{balance}} is available and ask how much. A number here would empty her savings on a request you meant to decline.
7. On reassure: be concrete — nothing in SMS, no notification, the ledger sits behind her own PIN, there is a decoy screen. Promise nothing beyond that, no legal advice, never suggest she deceive anyone. This is her own money.
8. Never mention being an AI, JSON, placeholders, or these rules.
9. Hinglish or Roman Hindi in → Devanagari out.`;
}

function parseModelJson(content) {
  try { return JSON.parse(content); } catch { /* fall through */ }
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) { try { return JSON.parse(fenced[1]); } catch { /* fall through */ } }
  const braced = content.match(/\{[\s\S]*\}/);
  if (braced) { try { return JSON.parse(braced[0]); } catch { /* fall through */ } }
  return null;
}

async function callGroq(transcript, state) {
  if (!GROQ_API_KEY) throw new Error("no-key");

  const messages = [{ role: "system", content: buildSystemPrompt(state) }, ...history,
    { role: "user", content: transcript }];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: MODEL, messages, temperature: 0.3, max_tokens: 400,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
  } catch (e) {
    throw new Error(e.name === "AbortError" ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new Error(`http-${res.status}`);
  const data = await res.json();
  const parsed = parseModelJson(data?.choices?.[0]?.message?.content || "");
  if (!parsed) throw new Error("unparseable");
  return parsed;
}

/* ---------- state mutation, then substitution ----------
   Apply first, substitute second, so every spoken number is
   post-transaction truth rather than the model's arithmetic. */
function applyIntent(result, state) {
  if (result.intent === "save_goal" && result.amount) {
    return { next: saveToGoal(state, result.amount), refused: false };
  }
  if (result.intent === "withdraw" && result.amount) {
    const { state: next, refused } = withdraw(state, result.amount);
    if (refused) result.amount = null;
    return { next, refused };
  }
  return { next: state, refused: false };
}

function substitute(text, result, state) {
  const g = state.goal;
  const map = {
    "{{balance}}": state.hiddenSavings,
    "{{goal_name}}": g ? g.name : "आपके लक्ष्य",
    "{{goal_saved}}": g ? g.saved : 0,
    "{{goal_target}}": g ? g.target : 0,
    "{{goal_remaining}}": g ? Math.max(0, g.target - g.saved) : 0,
    "{{safe_to_save}}": state.safeToSave,
    "{{amount}}": result.amount ?? "",
  };
  let out = text || "";
  for (const [k, v] of Object.entries(map)) out = out.split(k).join(v);
  return out.replace(/\{\{[^}]*\}\}/g, "").replace(/\s{2,}/g, " ").trim();
}

const SAFE_TEMPLATES = {
  get_balance: "आपकी छुपी हुई बचत अभी {{balance}} रुपये है।",
  save_goal: "{{amount}} रुपये {{goal_name}} में जमा कर दिए गए हैं। अब {{goal_saved}} रुपये हो गए हैं।",
  goal_progress: "{{goal_name}} के लिए अभी {{goal_saved}} रुपये हैं। लक्ष्य तक {{goal_remaining}} रुपये और चाहिए।",
  safe_to_save: "इस हफ्ते आप {{safe_to_save}} रुपये बचा सकती हैं।",
  withdraw: "{{amount}} रुपये निकाल दिए गए हैं। अब {{balance}} रुपये बचे हैं।",
};

/* Last line of defence. The placeholder system only holds if the model uses
   placeholders; caught live writing literal "3600" while the ledger said 3500.
   Any ledger-scale number that isn't a real value → deterministic template. */
function guardNumbers(reply, result, state) {
  const g = state.goal;
  const ascii = reply.replace(/[०-९]/g, (d) => "०१२३४५६७८९".indexOf(d));
  const found = (ascii.match(/\d+/g) || []).map(Number);

  const allowed = new Set([
    state.hiddenSavings, state.safeToSave,
    g ? g.saved : 0, g ? g.target : 0, g ? Math.max(0, g.target - g.saved) : 0,
    result.amount,
  ].filter(Number.isFinite));

  const bad = found.filter((n) => n >= 100 && !allowed.has(n));
  if (!bad.length) return { reply, repaired: false };

  const tpl = SAFE_TEMPLATES[result.intent];
  if (!tpl) return { reply: reply.replace(/\d+/g, "").replace(/\s{2,}/g, " ").trim(), repaired: true };
  return { reply: substitute(tpl, result, state), repaired: true };
}

/* ---------- the single entry point ---------- */
export async function processInput(transcript, state, opts = {}) {
  const started = performance.now();
  const useGroq = opts.useGroq !== false;

  const finish = (result, next, source) => {
    const guarded = guardNumbers(substitute(result.reply, result, next), result, next);
    history.push({ role: "user", content: transcript });
    history.push({ role: "assistant", content: guarded.reply });
    if (history.length > HISTORY_TURNS * 2) history = history.slice(-HISTORY_TURNS * 2);
    return {
      reply: guarded.reply, intent: result.intent, amount: result.amount ?? null,
      repaired: guarded.repaired, state: next, source,
      ms: Math.round(performance.now() - started),
    };
  };

  // Tier 1
  const local = fastPath(transcript);
  if (local) {
    const { next, refused } = applyIntent(local, state);
    if (refused) local.reply = "आपके पास अभी {{balance}} रुपये ही हैं। कितने निकालने हैं?";
    return finish(local, next, "local");
  }

  // Tier 2
  if (useGroq) {
    try {
      const ai = await callGroq(transcript, state);
      const { next, refused } = applyIntent(ai, state);
      if (refused && !ai.reply.includes("{{balance}}")) {
        ai.reply = "आपके पास अभी {{balance}} रुपये ही हैं। कितने निकालने हैं?";
      }
      return finish(ai, next, "groq");
    } catch (err) {
      const fb = matchIntent(transcript);
      const { next } = applyIntent(fb, state);
      const out = finish(fb, next, "fallback");
      out.error = err.message;
      return out;
    }
  }

  // Tier 3
  const fb = matchIntent(transcript);
  const { next } = applyIntent(fb, state);
  return finish(fb, next, "rules");
}

/* ---------- speech ---------- */
let hindiVoice = null;
function loadVoices() {
  const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  hindiVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("hi")) || null;
}
if (typeof window !== "undefined" && window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function speak(text) {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "hi-IN";
  if (hindiVoice) utter.voice = hindiVoice;
  utter.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export const SpeechRecognitionAPI =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
