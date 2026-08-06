import { useState } from "react";
import PinScreen from "./components/PinScreen";

export default function App() {

  const [screen, setScreen] = useState("pin");

  const REAL_PIN = "1234";
  const DURESS_PIN = "9999";

  const unlock = (pin) => {

    if (pin === REAL_PIN) {
      setScreen("real");
    }

    else if (pin === DURESS_PIN) {
      setScreen("decoy");
    }

    else {
      alert("Wrong PIN");
    }
  };

  if (screen === "pin") {
    return <PinScreen onUnlock={unlock} />;
  }

  if (screen === "real") {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-10">
        <h1 className="text-5xl font-bold text-purple-700">
          Tailwind Works 🎉
        </h1>
      </div>
    </div>
  );
}

  return (
    <h1 className="text-3xl p-10">
      Decoy Dashboard
    </h1>
  );
}