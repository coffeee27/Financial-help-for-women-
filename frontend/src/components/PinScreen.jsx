import { useState } from "react";

export default function PinScreen({ onUnlock }) {
  const [pin, setPin] = useState("");

  const handleClick = (num) => {
    if (pin.length >= 4) return;

    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === 4) {
      setTimeout(() => {
        onUnlock(newPin);
        setPin("");
      }, 200);
    }
  };

  const removeLast = () => {
    setPin(pin.slice(0, -1));
  };

  const numbers = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col justify-center items-center p-6">

      <h1 className="text-3xl font-bold text-pink-700">
        Sakhi Savings
      </h1>

      <p className="text-gray-600 mt-2">
        Enter your PIN
      </p>

      <div className="flex gap-3 mt-8">
        {[0,1,2,3].map((i)=>(
          <div
            key={i}
            className={`w-4 h-4 rounded-full ${
              pin.length>i
                ? "bg-pink-600"
                : "bg-pink-200"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-10">
        {numbers.map((num,index)=>(
          <button
            key={index}
            onClick={()=>{
              if(num==="⌫") removeLast();
              else if(num!=="") handleClick(num);
            }}
            className="w-16 h-16 rounded-full bg-white shadow text-xl font-semibold active:scale-95"
          >
            {num}
          </button>
        ))}
      </div>

    </div>
  );
}