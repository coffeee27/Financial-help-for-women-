import { motion } from "framer-motion";

/* Settings, real side.
 *
 * This screen is the privacy architecture written out in plain Hindi — it is
 * where a judge who taps around finds the actual argument. Everything here is
 * display-only for the demo; the values reflect how the product behaves.
 */

function Row({ label, sub, value, on, roadmap }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <div className="deva text-[14.5px] text-bark-900">{label}</div>
        {sub && <div className="deva text-[11.5px] text-bark-500 mt-0.5 leading-relaxed">{sub}</div>}
      </div>
      {roadmap ? (
        <span className="shrink-0 text-[9.5px] tracking-[.14em] uppercase text-bark-500
                         border border-sand-400 rounded-full px-2.5 py-1">
          Roadmap
        </span>
      ) : (
        <span className={`shrink-0 text-[12px] font-medium rounded-full px-3 py-1
          ${on ? "bg-olive-500/15 text-olive-600" : "bg-sand-300 text-bark-500"}`}>
          {value}
        </span>
      )}
    </div>
  );
}

export default function SettingsView({ onLock }) {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-5xl bg-sand-50 shadow-card border border-sand-300/60 px-6 py-3"
      >
        <div className="text-[10px] tracking-[.26em] uppercase text-bark-500 pt-3 pb-1">
          Privacy
        </div>
        <div className="divide-y divide-sand-300/70">
          <Row label="चुपचाप लेन-देन" sub="कोई एसएमएस नहीं, कोई नोटिफिकेशन नहीं" value="चालू" on />
          <Row label="छुपा हुआ खाता" sub="सिर्फ आपके पिन के पीछे दिखता है" value="चालू" on />
          <Row label="दूसरा पिन" sub="दबाव में डालने पर अलग स्क्रीन खुलती है" value="चालू" on />
          <Row label="ऐप का नाम छुपाएँ" sub="होम स्क्रीन पर सादा नाम" value="बंद" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="rounded-5xl bg-sand-50 shadow-card border border-sand-300/60 px-6 py-3"
      >
        <div className="text-[10px] tracking-[.26em] uppercase text-bark-500 pt-3 pb-1">
          Voice &amp; Language
        </div>
        <div className="divide-y divide-sand-300/70">
          <Row label="भाषा" value="हिंदी" on />
          <Row label="फ़ोन पर ही सोचने वाला कोच" sub="बिना इंटरनेट, कोई रिकॉर्ड नहीं" roadmap />
          <Row label="22 भाषाएँ" sub="भाषिणी के ज़रिए" roadmap />
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16 }}
        onClick={onLock}
        className="deva w-full rounded-4xl bg-bark-900 text-sand-50 py-4 text-[15px] font-medium"
      >
        तिजोरी बंद कीजिए
      </motion.button>
    </div>
  );
}
