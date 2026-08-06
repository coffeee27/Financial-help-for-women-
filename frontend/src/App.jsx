import { useState } from "react";
import PinScreen from "./components/PinScreen";
import DataTest from "./components/DataTest";
import { checkPIN } from "./services/duressService";

export default function App() {

  const [screen, setScreen] = useState("pin");

  const unlock = (pin)=>{

const result = checkPIN(pin);


if(result.mode==="real"){
 setScreen("real");
}

else if(result.mode==="decoy"){
 setScreen("decoy");
}

else{
 alert("Wrong PIN");
}

};


  if (screen === "pin") {
    return <PinScreen onUnlock={unlock} />;
  }


  if (screen === "real") {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">

      <DataTest />

    </div>
  );



    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">

        <div className="bg-white rounded-3xl shadow-2xl p-10">

          <h1 className="text-4xl font-bold text-purple-700 mb-6">
            AI Finance Dashboard 💰
          </h1>

          <DataTest />

        </div>

      </div>
    );

  }


  return (
    <div className="min-h-screen flex items-center justify-center">

      <h1 className="text-3xl p-10">
        Decoy Dashboard
      </h1>

    </div>
  );

}