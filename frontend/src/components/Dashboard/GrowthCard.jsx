import { motion } from "framer-motion";
import { projectGrowth } from "../../services/growthService";

/* बढ़ता पैसा — what her savings do depending on where they sit.
 *
 * The teaching is the comparison, not the number: money at home stays still,
 * a bank account moves it a little, a deposit moves it more. Three bars, one
 * year, one honest assumed rate printed on the card.
 *
 * Deliberately NOT advice: no bank, no scheme, no product, no promise. It says
 * so on the card. A demo that implied a guaranteed return would be both wrong
 * and the easiest thing in the room for a judge to pull apart.
 */
export default function GrowthCard({ state }) {
  const g = projectGrowth(state);
  if (!g.principal) return null;

  const rows = [
    { label: "घर में रखें", en: "At home", value: g.home, pct: 0, tone: "bg-sand-400" },
    { label: "बचत खाते में", en: "Savings account", value: g.savings, pct: g.savingsPct, tone: "bg-olive-400" },
    { label: "आवर्ती जमा में", en: "Recurring deposit", value: g.rd, pct: g.ratePct, tone: "bg-clay-500" },
  ];
  const max = Math.max(...rows.map((r) => r.value)) || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-5xl bg-sand-50 shadow-card border border-sand-300/60 p-6"
    >
      <div className="flex items-baseline justify-between">
        <div>
          <div className="deva text-[10px] tracking-[.22em] uppercase text-bark-500">
            बढ़ता पैसा
          </div>
          <h3 className="deva text-[17px] font-semibold text-bark-900 mt-1.5">
            एक साल में क्या होगा?
          </h3>
        </div>
        <span className="text-[10px] tracking-[.14em] uppercase text-bark-500
                         border border-sand-400 rounded-full px-2.5 py-1">
          1 वर्ष
        </span>
      </div>

      <div className="mt-5 space-y-3.5">
        {rows.map((r, i) => (
          <div key={r.label}>
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="flex items-baseline gap-2">
                <span className="deva text-[13.5px] text-bark-900">{r.label}</span>
                {r.pct > 0 && (
                  <span className="text-[10.5px] text-bark-500 tnum">~{r.pct}%</span>
                )}
              </div>
              <span className="font-display text-[15px] font-semibold text-bark-900 tnum">
                ₹{r.value.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="h-2 rounded-full bg-sand-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(r.value / max) * 100}%` }}
                transition={{ duration: 1, delay: 0.35 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-full ${r.tone}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-3xl bg-olive-500/10 border border-olive-400/25 px-4 py-3">
        <p className="deva text-[13.5px] leading-relaxed text-bark-900">
          वही पैसा, अलग जगह — फ़र्क{" "}
          <span className="font-semibold text-olive-600">
            ₹{g.gain.toLocaleString("en-IN")}
          </span>{" "}
          का।
          {g.perWeek > 0 && (
            <>
              {" "}हर हफ्ते ₹{g.perWeek} और जोड़ें तो लगभग{" "}
              <span className="font-semibold text-olive-600">
                ₹{g.withWeekly.toLocaleString("en-IN")}
              </span>
              ।
            </>
          )}
        </p>
      </div>

      <p className="deva text-[11px] leading-relaxed text-bark-500 mt-3">
        यह सिर्फ जानकारी है, सलाह नहीं। ब्याज दरें बदलती रहती हैं और यह अनुमान है।
      </p>
    </motion.div>
  );
}
