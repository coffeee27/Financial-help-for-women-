// AddGoalForm.jsx
// Form for creating a new financial goal. Connects to FinanceContext's addGoal().

import { useState } from "react";
import { useFinance } from "../context/FinanceContext"; // adjust path if different

export default function AddGoalForm({ onClose }) {
  const { addGoal } = useFinance();
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const amount = Number(targetAmount);

    if (!trimmedTitle) {
      setError("Please enter a goal title.");
      return;
    }
    if (!amount || amount <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }

    addGoal({ title: trimmedTitle, targetAmount: amount });

    // Reset form
    setTitle("");
    setTargetAmount("");
    if (onClose) onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 bg-white rounded-2xl shadow-sm p-4 border border-gray-100"
    >
      <h3 className="font-semibold text-gray-800 text-sm">Add a new goal</h3>

      <div>
        <label className="block text-xs text-gray-500 mb-1" htmlFor="goal-title">
          Goal title
        </label>
        <input
          id="goal-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Emergency Fund"
          className="w-full px-3 py-2 rounded-lg bg-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1" htmlFor="goal-amount">
          Target amount (₹)
        </label>
        <input
          id="goal-amount"
          type="number"
          min="1"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          placeholder="e.g. 5000"
          className="w-full px-3 py-2 rounded-lg bg-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2 mt-1">
        <button
          type="submit"
          className="flex-1 px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition"
        >
          Add Goal
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}