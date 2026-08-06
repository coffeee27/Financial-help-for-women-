export const initialFinanceData = {
  user: {
    name: "Priya",
    monthlyIncome: 30000
  },

  balance: 12000,

  goals: [
    {
      id: 1,
      title: "Emergency Fund",
      target: 10000,
      saved: 4000
    },
    {
      id: 2,
      title: "Skill Course",
      target: 5000,
      saved: 1500
    }
  ],

  transactions: [
    {
      id: 1,
      type: "expense",
      amount: 500,
      category: "Food",
      date: "2026-08-01"
    }
  ]
};