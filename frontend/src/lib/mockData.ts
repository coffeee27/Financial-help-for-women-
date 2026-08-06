import { FinanceState } from "../types/finance";

export const initialFinanceState: FinanceState = {
  balance: 12500,

  hiddenSavings: 2650,

  dashboardMode: "real",

  weeklyInsight: "You can safely save ₹150 this week.",

  goals: [
    {
      id: "goal-1",
      title: "Emergency Fund",
      target: 5000,
      saved: 2650,
    },
  ],

  transactions: [
    {
      id: "txn-1",
      type: "save",
      amount: 300,
      date: new Date().toLocaleDateString(),
    },
  ],
};