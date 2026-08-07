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

import {
  saveToGoal, withdraw, emergencyWithdraw, reconcile,
  changeGoal, accomplishGoal, isGoalAchieved,
} from "../services/goalService";
import { estimatePrice as estimatePriceAPI } from "./priceEstimator";

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
// separate daily token allowance, and quicker — the safety net when the big
// model's quota is exhausted
const MODEL_FALLBACK = "llama-3.1-8b-instant";
const TIMEOUT_MS = 30000;
const HISTORY_TURNS = 6;

// Startup diagnostic — check browser DevTools console
if (!GROQ_API_KEY) {
  console.warn("[Tijori] VITE_GROQ_KEY not found — voice AI running in keyword-only mode. Restart the dev server after adding the key to .env.local");
} else {
  console.info(`[Tijori] Groq key loaded (${GROQ_API_KEY.slice(0, 8)}...) — AI ready`);
}

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
  const progressQ = ["aur kitna", "और कितना", "kitna door", "कितना दूर", "lakshya kitna", "लक्ष्य कितना", "लक्ष्य तक", "लक्ष्य पूरा", "goal kitna"];
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
{ "intent": one of ["get_balance","save_goal","save_no_amount","withdraw","emergency_consult","emergency_withdraw","spend_mention","reconcile","goal_progress","safe_to_save","set_goal","goal_achieved","reassure","smalltalk","unknown"],
  "amount": integer or null, "goal_name": string or null, "goal_target": integer or null, "reply": "Hindi sentence", "confidence": 0.0-1.0 }

RULES FOR "reply":
1. Hindi, Devanagari, spoken register. One or two short sentences — it is read aloud, so no lists, no markdown.
2. NEVER write a literal number from the ledger. Use placeholders, substituted after you reply:
   {{balance}} {{goal_name}} {{goal_saved}} {{goal_target}} {{goal_remaining}} {{safe_to_save}} {{amount}}
   The values are ALREADY POST-TRANSACTION — do not add, subtract or recompute anything. If the deposit just happened, {{goal_saved}} already includes it. Never do arithmetic; you will get it wrong and contradict her screen.
   The only number you may write literally is one SHE just said.
   {{goal_name}} is a COMPLETE name — never add another noun like फंड or लक्ष्य right after it.
3. The action has ALREADY happened. Past tense — "जमा कर दिए गए हैं", never "जमा कर दिए जाएंगे".
4. You are a woman, a trusted Bank Sakhi. Feminine first-person: "मैं बता सकती हूँ", "मैं समझ नहीं पाई".
5. Intent rules: asks how much → get_balance. Names an amount to put away, including as a statement about what she already saved ("मैंने आज 150 बचाए") → save_goal (word-numbers: "दो सौ"=200, "पाँच सौ"=500, "हज़ार"=1000). Wants to save, no amount → save_no_amount. Wants money out with a SPECIFIC amount and no urgency → withdraw. Asks about the goal → goal_progress. Asks what she can afford → safe_to_save. SET_GOAL: if she wants to change her dream or names a new goal item → set_goal (see above). GOAL_ACHIEVED: if she says she has bought the item, accomplished her goal, or the dream came true → goal_achieved. Celebrate warmly, then ask what her next dream is. Scared or asks what happens if someone finds out → reassure.
5c. EMERGENCY_CONSULT: if she mentions an emergency, urgent need, crisis, illness, or worry about needing money — e.g. "बच्चा बीमार है", "इमरजेंसी है", "पैसे चाहिए अर्जेंट", "ज़रूरत पड़ गई", "क्या मैं पैसे निकालूँ" — WITHOUT naming a specific amount she wants to take out, set "intent":"emergency_consult", "amount": null. Do NOT withdraw anything. Act as her financial consultant: acknowledge her situation warmly, tell her how much she has (use {{balance}}), explain what the withdrawal would mean for her goal (use {{goal_name}} and {{goal_remaining}}), and ask her to decide how much she actually needs. Be supportive, never dismissive. Say something like "आपके पास {{balance}} रुपये हैं। {{goal_name}} तक {{goal_remaining}} रुपये बाकी हैं। बताइए कितने निकालने हैं, मैं यहाँ हूँ।"
5d. EMERGENCY_WITHDRAW: if she mentions an emergency/urgent need AND names a SPECIFIC amount — e.g. "इमरजेंसी में 500 निकालो", "बच्चे की दवाई के लिए 200 चाहिए", "ज़रूरी है 1000 निकालो" — set "intent":"emergency_withdraw" with the amount. This is a decided action, proceed with past tense confirmation.
SMALLTALK: greeting, chit-chat, OR any general financial question — loan advice, investment questions, money worries → smalltalk. For financial questions, give a warm, practical one-sentence answer as her Bank Sakhi. Unclear → unknown.
5a. RECONCILE: if she states what she ACTUALLY has now — "मेरे पास असल में अठारह हज़ार हैं", "गिनती की तो 18000 निकले" — that is reconcile, and "amount" is the true TOTAL she stated, not a difference. Use this when the app's number has drifted from the cash in her hand. If she instead names an amount she took out ("इमरजेंसी में 500 निकाल लिए"), that is emergency_withdraw with amount 500.
5b. SPENDING: if she mentions money already spent or something bought — खरीदा, खरीदी, खर्च, सामान, सब्ज़ी, राशन — that is spend_mention. Set "amount": null and change nothing.
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

/* Groq's daily token allowance is per MODEL and per ORGANISATION — a second
 * API key on the same account shares the same pot and buys nothing. When the
 * big model's quota runs out mid-demo, drop to the small one, which has its
 * own (much larger) allowance and is faster anyway. */
let activeModel = MODEL;

async function postToGroq(model, messages, signal) {
  return fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model, messages, temperature: 0.3, max_tokens: 400,
      response_format: { type: "json_object" },
    }),
    signal,
  });
}

async function callGroq(transcript, state) {
  if (!GROQ_API_KEY) throw new Error("no-key");
  console.debug("[Tijori] → Groq", transcript.slice(0, 60));

  const messages = [{ role: "system", content: buildSystemPrompt(state) }, ...history,
    { role: "user", content: transcript }];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await postToGroq(activeModel, messages, controller.signal);

    // out of daily tokens on this model — switch for the rest of the session
    if (res.status === 429 && activeModel !== MODEL_FALLBACK) {
      console.warn(`[Tijori] ${activeModel} out of daily quota — switching to ${MODEL_FALLBACK}`);
      activeModel = MODEL_FALLBACK;
      res = await postToGroq(activeModel, messages, controller.signal);
    }
  } catch (e) {
    const errMsg = e.name === "AbortError" ? "timeout" : "network";
    console.error("[Tijori] Groq fetch error:", errMsg, e.message);
    throw new Error(errMsg);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[Tijori] Groq HTTP ${res.status} (${activeModel}):`, body.slice(0, 200));
    throw new Error(res.status === 429 ? "quota" : `http-${res.status}`);
  }
  const data = await res.json();
  const parsed = parseModelJson(data?.choices?.[0]?.message?.content || "");
  if (!parsed) throw new Error("unparseable");
  return parsed;
}

/* Client-side fallback for when Groq forgets to estimate a price.
 * Covers the most common items an Indian woman might save for.
 * Values are rough mid-market averages — Groq's estimate takes priority.
 *
 * Groq sometimes drops vowel marks (मात्रा), e.g. "जूते" → "जुते",
 * so we strip all combining marks before comparison. */
const PRICE_LOOKUP = {
  "टेबल": 3000, "मेज": 3000, "कुर्सी": 1500, "पंखा": 2000, "कूलर": 6000,
  "वॉशिंग मशीन": 15000, "वाशिंग मशीन": 15000, "फ्रिज": 18000, "रेफ्रिजरेटर": 18000,
  "सिलाई मशीन": 8000, "मिक्सर": 3000, "प्रेशर कुकर": 2000,
  "मोबाइल": 12000, "फोन": 12000, "टीवी": 15000, "लैपटॉप": 35000,
  "साइकिल": 6000, "बाइसिकल": 6000, "स्कूटर": 75000, "बाइक": 70000, "कार": 500000,
  "सोना": 25000, "चूड़ी": 5000, "गहने": 20000, "अंगूठी": 15000,
  "जूते": 1500, "जुते": 1500, "जूता": 1500, "जुता": 1500, "शूज": 1500,
  "चप्पल": 500, "सैंडल": 800,
  "कपड़े": 2000, "साड़ी": 2000, "सूट": 2500, "ड्रेस": 1500,
  "स्कूल फीस": 20000, "बच्चों की फीस": 20000, "किताबें": 3000, "किताब": 3000,
  "घड़ी": 3000, "बैग": 1500, "पर्स": 800,
};

/* Strip combining marks so "जूते" and "जुते" both become the same base string. */
const stripMatras = (s) => s.normalize("NFD").replace(/[\u0300-\u036f\u0900-\u0903\u093a-\u094f\u0951-\u0957\u0962-\u0963]/g, "");

function estimatePrice(name) {
  const n = stripMatras((name || "").toLowerCase());
  for (const [key, val] of Object.entries(PRICE_LOOKUP)) {
    if (n.includes(stripMatras(key))) return val;
  }
  return 3000; // generic fallback — safer low default
}

/* ---------- state mutation, then substitution ----------
   Apply first, substitute second, so every spoken number is
   post-transaction truth rather than the model's arithmetic. */
async function applyIntent(result, state) {
  if (result.intent === "save_goal" && result.amount) {
    return { next: saveToGoal(state, result.amount), refused: false };
  }
  if (result.intent === "withdraw" && result.amount) {
    const { state: next, refused } = withdraw(state, result.amount);
    if (refused) result.amount = null;
    return { next, refused };
  }
  if (result.intent === "reconcile" && Number.isFinite(result.amount)) {
    const { state: next } = reconcile(state, result.amount);
    return { next, refused: false };
  }
  if (result.intent === "set_goal" && result.goal_name) {
    /* Priced by a dedicated Groq key (see priceEstimator.js). That call has
     * its own timeout and its own offline table, so a slow or rate-limited
     * estimate degrades to a sensible number instead of blocking the reply.
     * The conversation model's inline guess is the next fallback, then the
     * local lookup. */
    const est = await estimatePriceAPI(result.goal_name);
    const target = est.target || result.goal_target || estimatePrice(result.goal_name);
    result.goal_target = target;
    return {
      next: changeGoal(state, result.goal_name, target, est.nameEn),
      refused: false,
    };
  }
  if (result.intent === "emergency_consult") {
    // No state change — just guidance. The AI will advise her.
    return { next: state, refused: false };
  }
  if (result.intent === "emergency_withdraw" && result.amount) {
    const { state: next, refused } = emergencyWithdraw(state, result.amount);
    if (refused) result.amount = null;
    return { next, refused };
  }
  if (result.intent === "goal_achieved") {
    // Capture name before it's cleared so the reply template can use it.
    if (state.goal) result.goal_name = result.goal_name || state.goal.name;
    const { state: next, refused } = accomplishGoal(state);
    return { next, refused };
  }
  return { next: state, refused: false };
}

function substitute(text, result, state) {
  const g = state.goal;
  const map = {
    "{{balance}}": state.hiddenSavings,
    /* After a goal completes there is no current goal, but the reply is still
     * about the thing she just bought — fall back to the name captured before
     * it was cleared, or "आपकी बकरी खरीद ली" degrades to "आपके लक्ष्य खरीद ली". */
    "{{goal_name}}": g ? g.name : (result.goal_name || "आपके लक्ष्य"),
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
  spend_mention:
    "यह तिजोरी सिर्फ आपकी बचत के लिए है, रोज़ का खर्च यहाँ नहीं जुड़ता। ज़रूरत हो तो बताइए, पैसे निकाल सकती हैं।",
  reconcile: "ठीक है, अब तिजोरी में {{balance}} रुपये दर्ज हैं।",
  set_goal: "बिल्कुल! {{goal_name}} आपका नया सपना है। लक्ष्य {{goal_target}} रुपये रखा है — ठीक है या बदलना है?",
  goal_achieved: "मुबारक हो! आपका सपना पूरा हुआ। अब अगला सपना क्या है?",
  emergency_consult: "आपके पास अभी {{balance}} रुपये हैं। {{goal_name}} तक {{goal_remaining}} रुपये बाकी हैं। बताइए कितने निकालने हैं, मैं यहाँ हूँ।",
  emergency_withdraw: "{{amount}} रुपये ज़रूरी निकासी के रूप में निकाल दिए गए हैं। अब {{balance}} रुपये बचे हैं।",
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

  /* Reaching the target completes the goal on the spot: the price leaves the
   * tijori, the goal clears, and she is asked for the next one. Doing it here
   * rather than waiting for her to announce it means the ledger can never sit
   * in the impossible state of a goal that is 130% funded. */
  const applyAndMaybeComplete = async (result, state) => {
    const outcome = await applyIntent(result, state);
    if (result.intent === "goal_achieved") return outcome;

    /* Naming a goal she can already afford must NOT buy it. Auto-completing
     * here spent ₹1,000 the moment she said "मुझे एक पंखा चाहिए", because the
     * pot already covered it. Tell her she has enough and let her decide. */
    if (result.intent === "set_goal") {
      if (isGoalAchieved(outcome.next)) {
        result.reply =
          "{{goal_name}} के लिए आपके पास पहले से ही पूरे पैसे हैं — " +
          "{{balance}} रुपये। खरीद लें तो बता दीजिए, मैं हिसाब से निकाल दूँगी।";
      }
      return outcome;
    }

    if (!isGoalAchieved(outcome.next)) return outcome;

    const done = accomplishGoal(outcome.next);
    if (!done.completed) return outcome;

    result.intent = "goal_achieved";
    result.amount = null;
    result.reply =
      `बधाई हो! ${done.completed.name} के लिए पूरे पैसे जमा हो गए, ` +
      `और उसकी कीमत तिजोरी से निकल गई। अब {{balance}} रुपये बचे हैं। अगला सपना क्या है?`;
    return { next: done.state, refused: false };
  };

  // Tier 1
  const local = fastPath(transcript);
  if (local) {
    const { next, refused } = await applyAndMaybeComplete(local, state);
    if (refused) local.reply = "आपके पास अभी {{balance}} रुपये ही हैं। कितने निकालने हैं?";
    return finish(local, next, "local");
  }

  // Tier 2
  if (useGroq) {
    try {
      const ai = await callGroq(transcript, state);
      const { next, refused } = await applyAndMaybeComplete(ai, state);
      if (refused && !ai.reply.includes("{{balance}}")) {
        ai.reply = "आपके पास अभी {{balance}} रुपये ही हैं। कितने निकालने हैं?";
      }
      return finish(ai, next, "groq");
    } catch (err) {
      const fb = matchIntent(transcript);
      const { next } = await applyAndMaybeComplete(fb, state);
      const out = finish(fb, next, "fallback");
      out.error = err.message;
      return out;
    }
  }

  // Tier 3
  const fb = matchIntent(transcript);
  const { next } = await applyAndMaybeComplete(fb, state);
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
