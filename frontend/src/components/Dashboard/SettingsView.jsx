import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

/*
 * Settings screen
 * Fully translated using i18next.
 */

function Row({ label, sub, value, on, roadmap, t }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <div className="deva text-[14.5px] text-bark-900">
          {label}
        </div>

        {sub && (
          <div className="deva text-[11.5px] text-bark-500 mt-0.5 leading-relaxed">
            {sub}
          </div>
        )}
      </div>

      {roadmap ? (
        <span
          className="
          shrink-0 text-[9.5px] tracking-[.14em] uppercase text-bark-500
          border border-sand-400 rounded-full px-2.5 py-1
          "
        >
          {t("settings.roadmap")}
        </span>
      ) : (
        <span
          className={`
          shrink-0 text-[12px] font-medium rounded-full px-3 py-1
          ${
            on
              ? "bg-olive-500/15 text-olive-600"
              : "bg-sand-300 text-bark-500"
          }
          `}
        >
          {value}
        </span>
      )}
    </div>
  );
}


export default function SettingsView({ onLock }) {

  const { t } = useTranslation();

  return (
    <div className="space-y-4">

      {/* Privacy Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="
        rounded-5xl bg-sand-50 shadow-card
        border border-sand-300/60 px-6 py-3
        "
      >

        <div
          className="
          text-[10px] tracking-[.26em] uppercase
          text-bark-500 pt-3 pb-1
          "
        >
          {t("settings.privacy")}
        </div>


        <div className="divide-y divide-sand-300/70">

          <Row
            t={t}
            label={t("settings.silentTransactions")}
            sub={t("settings.silentTransactionsSub")}
            value={t("settings.on")}
            on
          />


          <Row
            t={t}
            label={t("settings.hiddenAccount")}
            sub={t("settings.hiddenAccountSub")}
            value={t("settings.on")}
            on
          />


          <Row
            t={t}
            label={t("settings.secondPin")}
            sub={t("settings.secondPinSub")}
            value={t("settings.on")}
            on
          />


          <Row
            t={t}
            label={t("settings.hideApp")}
            sub={t("settings.hideAppSub")}
            value={t("settings.off")}
          />

        </div>

      </motion.div>



      {/* Voice Section */}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.08,
        }}
        className="
        rounded-5xl bg-sand-50 shadow-card
        border border-sand-300/60 px-6 py-3
        "
      >

        <div
          className="
          text-[10px] tracking-[.26em] uppercase
          text-bark-500 pt-3 pb-1
          "
        >
          {t("settings.voiceLanguage")}
        </div>


        <div className="divide-y divide-sand-300/70">

          <Row
            t={t}
            label={t("settings.language")}
            value={t("settings.currentLanguage")}
            on
          />


          <Row
            t={t}
            label={t("settings.offlineCoach")}
            sub={t("settings.offlineCoachSub")}
            roadmap
          />


          <Row
            t={t}
            label={t("settings.languages")}
            sub={t("settings.languagesSub")}
            roadmap
          />

        </div>

      </motion.div>




      {/* Lock Button */}

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.16,
        }}
        onClick={onLock}
        className="
        deva w-full rounded-4xl
        bg-bark-900 text-sand-50
        py-4 text-[15px] font-medium
        "
      >
        {t("settings.lock")}
      </motion.button>


    </div>
  );
}