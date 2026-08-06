import { FinanceState, Transaction } from "../types/finance";

export function saveMoney(
  state: FinanceState,
  amount: number
): FinanceState {

  if (amount <= 0) return state;

  const updatedGoal = {
    ...state.goals[0],
    saved: state.goals[0].saved + amount,
  };

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    type: "save",
    amount,
    date: new Date().toLocaleDateString(),
  };

  return {
    ...state,

    balance: state.balance - amount,

    hiddenSavings: state.hiddenSavings + amount,

    goals: [updatedGoal],

    transactions: [transaction, ...state.transactions],
  };
}