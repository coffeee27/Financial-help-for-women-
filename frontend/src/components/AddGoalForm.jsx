// AddGoalForm.jsx
// Creates a new dream goal using FinanceContext changeGoal()

import { useState } from "react";
import { useFinance } from "../context/FinanceContext";

export default function AddGoalForm({ onClose }) {
  const { state, setState } = useFinance();

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const goalName = name.trim();
    const amount = Number(target);

    if (!goalName) {
      setError("Please enter a goal name.");
      return;
    }

    if (!amount || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    const newGoal = {
      id: Date.now(),
      name: goalName,
      nameEn: goalName,
      target: amount,
      saved: state.hiddenSavings || 0,
    };

    setState({
      ...state,
      goal: newGoal,
      transactions: [
        {
          id: Date.now(),
          type: "save",
          amount,
          label: `नया लक्ष्य: ${goalName}`,
          date: "अभी",
        },
        ...state.transactions,
      ],
    });

    setName("");
    setTarget("");
    setError("");

    if (onClose) onClose();
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-sand-50 border border-sand-300/60 p-5 shadow-card space-y-4"
    >

      <h3 className="font-semibold text-bark-900 text-lg">
        Add Dream Goal
      </h3>


      <div>
        <label className="text-sm text-bark-500">
          Goal name
        </label>

        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="Example: New Phone, Emergency Fund"
          className="
          w-full mt-1 px-4 py-3 rounded-xl
          bg-white border border-sand-300
          focus:outline-none focus:ring-2 focus:ring-orange-300
          "
        />
      </div>


      <div>
        <label className="text-sm text-bark-500">
          Target amount (₹)
        </label>

        <input
          type="number"
          value={target}
          onChange={(e)=>setTarget(e.target.value)}
          placeholder="5000"
          className="
          w-full mt-1 px-4 py-3 rounded-xl
          bg-white border border-sand-300
          focus:outline-none focus:ring-2 focus:ring-orange-300
          "
        />
      </div>


      {error && (
        <p className="text-red-500 text-sm">
          {error}
        </p>
      )}


      <div className="flex gap-3">

        <button
          type="submit"
          className="
          flex-1 rounded-full
          bg-clay-500 text-white
          py-3 font-semibold
          hover:opacity-90
          "
        >
          Create Goal
        </button>


        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="
            px-5 rounded-full
            bg-sand-200 text-bark-700
            "
          >
            Cancel
          </button>
        )}

      </div>

    </form>
  );
}