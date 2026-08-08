import { motion } from "framer-motion";
import MicButton from "./MicButton";
import VoicePanel from "../VoicePanel";
import { useTranslation } from "react-i18next";


export default function VoiceView({ voice }) {

  const { t, i18n } = useTranslation();

  const suggestions = [
    {
      hi: t("voice.suggestions.save"),
      en: t("voice.suggestions.saveEn")
    },
    {
      hi: t("voice.suggestions.twoHundred"),
      en: t("voice.suggestions.twoHundredEn")
    },
    {
      hi: t("voice.suggestions.goal"),
      en: t("voice.suggestions.goalEn")
    },
    {
      hi: t("voice.suggestions.private"),
      en: t("voice.suggestions.privateEn")
    }
  ];


  return (
    <div className="space-y-5">

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.16,1,0.3,1]
        }}
        className="rounded-5xl bg-sand-50 shadow-card 
        border border-sand-300/60 p-8 flex flex-col items-center"
      >

        <div className="text-[10px] tracking-[.26em] uppercase text-bark-500 mb-6">
          {t("voice.title")}
        </div>


        <MicButton
          listening={voice.listening}
          thinking={voice.thinking}
          onTap={voice.start}
          disabled={voice.thinking}
        />


        <p className="deva text-[13px] text-bark-500 mt-4 text-center">

          {voice.listening
            ? t("voice.listening")
            : voice.thinking
            ? t("voice.thinking")
            : t("voice.speak")
          }

        </p>


      </motion.div>



      <motion.div
        initial={{ opacity:0,y:16 }}
        animate={{opacity:1,y:0}}
        transition={{
          duration:0.5,
          delay:0.08
        }}
      >


        <div className="text-[10px] tracking-[.26em] uppercase text-bark-500 mb-3 px-1">

          {t("voice.try")}

        </div>



        <div className="space-y-2">


          {suggestions.map((s,index)=>(

            <button

              key={index}

              onClick={() => voice.send(s.hi)}

              disabled={voice.thinking}

              className="w-full text-left rounded-3xl bg-sand-50 
              border border-sand-300/70 px-5 py-3.5 
              hover:border-clay-400 transition-colors
              disabled:opacity-50 shadow-card"

            >

              <div className="deva text-[15px] text-bark-900">

                {s.hi}

              </div>


              <div className="text-[11.5px] text-bark-500 mt-0.5">

                {s.en}

              </div>


            </button>

          ))}


        </div>


      </motion.div>



      <VoicePanel voice={voice}/>


    </div>
  );
}