import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import BalanceCard from "./Dashboard/BalanceCard";
import TransactionList from "./Dashboard/TransactionList";
import BottomNav from "./Dashboard/BottomNav";

/* The decoy.
 *
 * Design rule: identical skeleton to the real dashboard — same header, same
 * card stack, same nav, same type, same colours. Someone who has only ever
 * seen this screen must have no reason to suspect another one exists.
 *
 * The differences are all plausible absence rather than visible removal:
 *   · a small believable balance, not ₹0 — an empty account invites
 *     "where did the money go?", which is the opposite of the point
 *   · no dream goal; she simply hasn't set one up
 *   · household spends instead of deposits
 *   · the voice coach reads as a feature never switched on
 *
 * Every tab is reachable, because a nav where three buttons do nothing is
 * itself a tell. And nothing in here mentions a hidden account, a second PIN
 * or silent transactions — that would hand over the very thing it protects.
 * Notifications are ON, as they would be on an ordinary account.
 */

const TITLES = {
  goals: { hi: "लक्ष्य", en: "Goals" },
  voice: { hi: "आवाज़", en: "Voice" },
  emergency: { hi: "मदद", en: "Support" },
  settings: { hi: "सेटिंग्स", en: "Settings" },
};

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div className="deva text-[14.5px] text-bark-900">{label}</div>
      <span className="deva text-[12.5px] text-bark-500">{value}</span>
    </div>
  );
}

export default function DecoyDashboard({ onLock }) {
  const { state } = useFinance();
  const [tab, setTab] = useState("home");
  const scrollRef = useRef(null);

  const changeTab = (next) => {
    setTab(next);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div className="h-[var(--app-h)] overflow-hidden flex flex-col bg-sand-200 paper">
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-5 pt-9 pb-6 max-w-md w-full mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-7"
        >
          <div>
            {tab === "home" ? (
              <>
                <p className="deva text-[13px] text-bark-500">{state.user.greeting}</p>
                <h1 className="deva text-[26px] leading-tight font-semibold text-bark-900">
                  {state.user.name}
                </h1>
              </>
            ) : (
              <>
                <p className="text-[10px] tracking-[.26em] uppercase text-bark-500">
                  {TITLES[tab].en}
                </p>
                <h1 className="deva text-[26px] leading-tight font-semibold text-bark-900">
                  {TITLES[tab].hi}
                </h1>
              </>
            )}
          </div>
          <button
            onClick={onLock}
            className="w-11 h-11 rounded-full bg-sand-50 shadow-card border border-sand-300/70
                       flex items-center justify-center text-bark-500"
            aria-label="Lock"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round">
              <rect x="4" y="10" width="16" height="11" rx="2.5" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </button>
        </motion.header>

        {/* Keyed enter animation, deliberately NOT wrapped in AnimatePresence —
            see the note in RealDashboard: nesting one deadlocked App's exit. */}
        <div key={tab}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {tab === "home" && (
              <div className="space-y-4">
                <BalanceCard amount={state.hiddenSavings} weekDelta={0} decoy />
                <div className="rounded-5xl border-2 border-dashed border-sand-400
                                bg-sand-100/60 p-7 text-center">
                  <div className="text-[10px] tracking-[.26em] uppercase text-bark-500">
                    Dream Goal
                  </div>
                  <p className="deva mt-3 text-[15px] text-bark-500">अभी कोई लक्ष्य नहीं</p>
                  <button className="deva mt-4 text-[13px] text-bark-700 bg-sand-50
                                     border border-sand-300 rounded-full px-5 py-2 shadow-card">
                    लक्ष्य बनाइए
                  </button>
                </div>
                <TransactionList transactions={state.transactions} />
              </div>
            )}

            {tab === "goals" && (
              <div className="rounded-5xl border-2 border-dashed border-sand-400
                              bg-sand-100/60 p-10 text-center">
                <p className="deva text-[16px] text-bark-700">अभी कोई लक्ष्य नहीं</p>
                <p className="deva text-[12.5px] text-bark-500 mt-2 leading-relaxed">
                  बचत का लक्ष्य बनाइए और हर हफ्ते थोड़ा-थोड़ा जोड़िए।
                </p>
                <button className="deva mt-5 text-[13.5px] text-sand-50 bg-bark-900
                                   rounded-full px-6 py-2.5">
                  लक्ष्य बनाइए
                </button>
              </div>
            )}

            {tab === "voice" && (
              <div className="rounded-5xl bg-sand-50 shadow-card border border-sand-300/60
                              p-10 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-sand-200
                                flex items-center justify-center mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B5A798"
                       strokeWidth="1.8" strokeLinecap="round">
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0" />
                    <path d="M12 18v4" />
                  </svg>
                </div>
                <p className="deva text-[15px] text-bark-700">आवाज़ सुविधा चालू नहीं है</p>
                <p className="deva text-[12.5px] text-bark-500 mt-2 leading-relaxed">
                  इसे चालू करने के लिए माइक की अनुमति चाहिए।
                </p>
                <button className="deva mt-5 text-[13.5px] text-bark-700 bg-sand-100
                                   border border-sand-300 rounded-full px-6 py-2.5">
                  चालू कीजिए
                </button>
              </div>
            )}

            {/* Ordinary help page. Nothing here hints that a withdrawal review
                exists on the other side, because that review is only meaningful
                for savings this account does not appear to have. */}
            {tab === "emergency" && (
              <div className="rounded-5xl bg-sand-50 shadow-card border border-sand-300/60
                              p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-sand-200
                                flex items-center justify-center mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B5A798"
                       strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
                  </svg>
                </div>
                <p className="deva text-[15px] text-bark-700">मदद चाहिए?</p>
                <p className="deva text-[12.5px] text-bark-500 mt-2 leading-relaxed">
                  खाते से जुड़ी किसी भी दिक्कत के लिए अपनी बैंक सखी से बात कीजिए।
                </p>
              </div>
            )}

            {tab === "settings" && (
              <div className="space-y-4">
                <div className="rounded-5xl bg-sand-50 shadow-card border border-sand-300/60 px-6 py-3">
                  <div className="text-[10px] tracking-[.26em] uppercase text-bark-500 pt-3 pb-1">
                    Account
                  </div>
                  <div className="divide-y divide-sand-300/70">
                    <Row label="नाम" value={state.user.name} />
                    <Row label="भाषा" value="हिंदी" />
                    <Row label="एसएमएस अलर्ट" value="चालू" />
                    <Row label="नोटिफिकेशन" value="चालू" />
                  </div>
                </div>
                <div className="rounded-5xl bg-sand-50 shadow-card border border-sand-300/60 px-6 py-3">
                  <div className="text-[10px] tracking-[.26em] uppercase text-bark-500 pt-3 pb-1">
                    About
                  </div>
                  <div className="divide-y divide-sand-300/70">
                    <Row label="मदद" value="›" />
                    <Row label="वर्ज़न" value="1.0.0" />
                  </div>
                </div>
                <button
                  onClick={onLock}
                  className="deva w-full rounded-4xl bg-bark-900 text-sand-50 py-4 text-[15px] font-medium"
                >
                  बाहर निकलिए
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <BottomNav active={tab} onChange={changeTab} />
    </div>
  );
}
