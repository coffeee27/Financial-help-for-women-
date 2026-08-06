import { useFinance } from "../context/FinanceContext";
import { updateGoal } from "../services/goalService";
import { getSavingsInsight } from "../services/insightService";


export default function DataTest() {

  const { finance, setFinance } = useFinance();


  const saveMoney = () => {

    const updated = updateGoal(finance, 1, 500);

    setFinance(updated);

  };


  return (

    <div className="bg-white rounded-3xl shadow-2xl p-8 w-96">

      <h2 className="text-3xl font-bold text-purple-700 mb-6">
        Finance Dashboard 💰
      </h2>


      <div className="bg-purple-100 rounded-xl p-5 mb-5">

        <p className="text-gray-600">
          Current Balance
        </p>

        <h1 className="text-4xl font-bold text-purple-900">
          ₹{finance.balance}
        </h1>

      </div>


      <button
        onClick={saveMoney}
        className="bg-purple-600 text-white w-full py-3 rounded-xl font-bold hover:bg-purple-700"
      >
        Save ₹500
      </button>


      <div className="bg-pink-100 rounded-xl p-4 mt-5">

        <h3 className="font-bold text-pink-700">
          AI Insight 🤖
        </h3>

        <p className="text-gray-700 mt-2">
          {getSavingsInsight(finance).message}
        </p>

      </div>


    </div>

  );
}