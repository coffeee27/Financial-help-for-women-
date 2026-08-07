/* Price estimation for a new dream goal.
 *
 * Deliberately on its own Groq key: estimation is a different kind of traffic
 * from the voice loop, and if it gets rate-limited or the key is rotated, the
 * coach keeps working.
 *
 * The model is asked for a realistic Indian retail price. It will sometimes be
 * wrong, so the number is always presented to her as an estimate she can
 * correct, never as a fact.
 */

const ESTIMATE_KEY = import.meta.env.VITE_GROQ_ESTIMATE_KEY || "";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
/* The small model on purpose. Pricing one item is an easy task, and Groq's
 * daily token allowance is per model — spending the big model's quota on
 * estimates is what leaves the voice coach with nothing left to say. */
const MODEL = "llama-3.1-8b-instant";
const TIMEOUT_MS = 7000;

/* Offline floor. If the API is unreachable at the venue, a sensible number is
 * far better than a broken goal card. Keys are matched loosely. */
const FALLBACK = [
  [/सिलाई|silai|sewing|tailor/i, "सिलाई मशीन", "Sewing machine", 25000],
  [/फ्रिज|फ़्रिज|fridge|refrigerator/i, "फ्रिज", "Refrigerator", 18000],
  [/बकरी|bakri|goat/i, "बकरी", "Goat", 8000],
  [/साइकिल|cycle|bicycle/i, "साइकिल", "Bicycle", 6000],
  [/मोबाइल|फ़ोन|फोन|mobile|phone/i, "मोबाइल फ़ोन", "Mobile phone", 9000],
  [/गाय|भैंस|cow|buffalo/i, "भैंस", "Buffalo", 60000],
  [/दुकान|shop|stall/i, "छोटी दुकान", "Small shop", 40000],
  [/पढ़ाई|स्कूल|फ़ीस|school|fees|education/i, "बच्चों की पढ़ाई", "Children's education", 15000],
  [/पंखा|fan/i, "पंखा", "Fan", 2500],
  [/चूल्हा|गैस|stove|lpg/i, "गैस चूल्हा", "Gas stove", 3500],
];

function fallbackFor(item) {
  for (const [re, hi, en, price] of FALLBACK) {
    if (re.test(item)) return { name: hi, nameEn: en, target: price, estimated: false };
  }
  return { name: item.trim() || "नया लक्ष्य", nameEn: "", target: 10000, estimated: false };
}

function parseJson(content) {
  try { return JSON.parse(content); } catch { /* fall through */ }
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) { try { return JSON.parse(fenced[1]); } catch { /* fall through */ } }
  const braced = content.match(/\{[\s\S]*\}/);
  if (braced) { try { return JSON.parse(braced[0]); } catch { /* fall through */ } }
  return null;
}

/* Rounds to something a person would actually say out loud. */
function tidy(n) {
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n < 1000) return Math.round(n / 50) * 50;
  if (n < 20000) return Math.round(n / 500) * 500;
  return Math.round(n / 1000) * 1000;
}

export async function estimatePrice(item) {
  const cleaned = (item || "").trim();
  if (!cleaned) return fallbackFor("");
  if (!ESTIMATE_KEY) return fallbackFor(cleaned);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ESTIMATE_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        max_tokens: 160,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You price everyday goods for a low-income household in small-town India.

Reply with JSON only:
{ "name_hi": "item name in Devanagari, 1-3 words",
  "name_en": "item name in English",
  "price_inr": integer rupees, no commas, no symbols }

Rules:
- price_inr is a realistic mid-range retail price in India, for the cheapest model a working woman would actually buy — not a premium one.
- Livestock, tools and second-hand goods are common goals; price them as they are actually bought in a village market.
- If the item is vague ("something for the house"), pick the most likely concrete item and price that.
- Never return 0, never return a range, never explain.`,
          },
          { role: "user", content: cleaned },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`http-${res.status}`);
    const data = await res.json();
    const parsed = parseJson(data?.choices?.[0]?.message?.content || "");
    const price = tidy(Number(parsed?.price_inr));
    if (!parsed || !price) throw new Error("unparseable");

    return {
      name: (parsed.name_hi || cleaned).trim(),
      nameEn: (parsed.name_en || "").trim(),
      target: price,
      estimated: true,
    };
  } catch {
    return fallbackFor(cleaned);
  } finally {
    clearTimeout(timer);
  }
}
