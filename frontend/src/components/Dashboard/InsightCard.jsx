import { motion } from "framer-motion";
import { getSavingsInsight } from "../../services/insightService";
import { useTranslation } from "react-i18next";

export default function InsightCard({ state }) {

  const { t } = useTranslation();

  const insight = getSavingsInsight(state);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay: 0.16,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="rounded-5xl bg-olive-500/10 border border-olive-400/30 p-6"
    >

      <div className="flex items-start gap-3.5">

        <div
          className="mt-0.5 w-8 h-8 shrink-0 rounded-full 
          bg-olive-500/20 flex items-center justify-center"
        >

          <motion.div

            animate={{
              scale:[1,1.3,1],
              opacity:[0.55,1,0.55]
            }}

            transition={{
              repeat:Infinity,
              duration:2.4,
              ease:"easeInOut"
            }}

            className="w-2.5 h-2.5 rounded-full bg-olive-500"

          />

        </div>


        <div>


          <div className="deva text-[10px] tracking-[.2em] uppercase text-olive-600 mb-1.5">

            {t("insight.thisWeek")}

          </div>


          <p className="deva text-[15.5px] leading-relaxed text-bark-900 font-medium">

            {t(`insight.${insight.messageKey}`, insight.values)}

          </p>


          {insight.subtext && (

            <p className="deva text-[12.5px] text-bark-500 mt-1.5">

             {t(`insight.${insight.subtextKey}`, insight.subValues)}

            </p>

          )}


        </div>


      </div>


    </motion.div>
  );
}