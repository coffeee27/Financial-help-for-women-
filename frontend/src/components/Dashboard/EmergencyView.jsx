import { motion } from "framer-motion";
import { emergencyWithdraw, weeksAtPace } from "../../services/goalService";
import { speak } from "../../lib/voiceEngine";
import VoicePanel from "../VoicePanel";
import { useTranslation } from "react-i18next";


export default function EmergencyView({ state, setState, voice }) {

  const { t } = useTranslation();

  const pending = voice.pending;
  const goal = state.goal;

  const after = pending 
    ? Math.max(0, state.hiddenSavings - pending.amount) 
    : state.hiddenSavings;

  const weeksNow = weeksAtPace(state);

  const weeksAfter = goal
    ? weeksAtPace({
        ...state,
        goal: {
          ...goal,
          saved: Math.max(
            0,
            goal.saved - (pending?.amount || 0)
          )
        }
      })
    : null;

  const weeksCost =
    weeksNow != null && weeksAfter != null
      ? weeksAfter - weeksNow
      : null;


  const confirm = () => {

    const { state: next, refused } =
      emergencyWithdraw(state, pending.amount);

    if (!refused) {

      setState(next);

      speak(
        `${pending.amount} ${t("emergency.rupeesWithdrawn")} 
        ${next.hiddenSavings} ${t("emergency.remaining")}`
      );

    }

    voice.clearPending();

  };


  const cancel = () => {

    voice.clearPending();

    speak(t("emergency.cancelVoice"));

  };


  return (

    <div className="space-y-4">


      {pending ? (

        <motion.div

          initial={{opacity:0,y:16}}

          animate={{opacity:1,y:0}}

          transition={{
            duration:0.5,
            ease:[0.16,1,0.3,1]
          }}

          className="rounded-5xl bg-sand-50 shadow-card 
          border border-clay-400/40 p-7"

        >


          <div className="text-[10px] tracking-[.26em] uppercase text-bark-500">

            {t("emergency.withdrawalRequested")}

          </div>


          <div className="mt-3 flex items-baseline gap-1.5">

            <span className="font-display text-2xl text-bark-500">
              ₹
            </span>

            <span className="font-display text-[42px] leading-none 
            font-semibold text-bark-900 tnum">

              {pending.amount.toLocaleString("en-IN")}

            </span>

          </div>



          <div className="mt-6 grid grid-cols-2 gap-3">


            <div className="rounded-3xl bg-sand-100 p-4">

              <div className="text-[9px] tracking-[.18em] uppercase text-bark-500">

                {t("emergency.now")}

              </div>


              <div className="font-display text-[18px] font-semibold text-bark-900">

                ₹{state.hiddenSavings.toLocaleString("en-IN")}

              </div>


            </div>



            <div className="rounded-3xl bg-sand-100 p-4">

              <div className="text-[9px] tracking-[.18em] uppercase text-bark-500">

                {t("emergency.after")}

              </div>


              <div className="font-display text-[18px] font-semibold text-clay-500">

                ₹{after.toLocaleString("en-IN")}

              </div>


            </div>


          </div>



          {goal && weeksCost != null && weeksCost > 0 && (

            <p className="deva mt-5 text-[14px] leading-relaxed text-bark-700">

              {t(goal.name)} {t("emergency.goalDelay")}

              <span className="font-semibold text-clay-600">

                {weeksCost} {t("emergency.weeks")}

              </span>

            </p>

          )}



          <p className="deva mt-2 text-[13px] leading-relaxed text-bark-500">

            {t("emergency.warning")}

          </p>



          <div className="mt-6 grid grid-cols-2 gap-3">


            <button

              onClick={cancel}

              className="deva rounded-3xl border border-sand-400 
              bg-sand-50 py-3.5 text-[15px]"

            >

              {t("emergency.cancel")}

            </button>



            <button

              onClick={confirm}

              className="deva rounded-3xl bg-clay-500 
              py-3.5 text-[15px] text-sand-50"

            >

              {t("emergency.confirm")}

            </button>


          </div>


        </motion.div>


      ) : (


        <motion.div

          initial={{opacity:0,y:16}}

          animate={{opacity:1,y:0}}

          className="rounded-5xl bg-sand-50 shadow-card 
          border border-sand-300/60 p-8 text-center"

        >


          <div className="mx-auto w-12 h-12 rounded-full 
          bg-olive-500/15 flex items-center justify-center mb-4">

            ❤️

          </div>



          <p className="deva text-[15.5px] text-bark-900 font-medium">

            {t("emergency.noWithdrawal")}

          </p>



          <p className="deva text-[13px] text-bark-500 mt-2">

            {t("emergency.noWithdrawalDesc")}

          </p>


        </motion.div>


      )}



      <div>

        <div className="text-[10px] tracking-[.26em] uppercase text-bark-500 mb-3 px-1">

          {t("emergency.talk")}

        </div>


        <VoicePanel voice={voice}/>


      </div>


    </div>

  );

}