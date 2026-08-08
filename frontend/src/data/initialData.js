export const realData = {
  user: {
    name: "Priya",
    greeting: "greetings.evening"
  },

  mode: "real",

  hiddenSavings: 18540,

  weekDelta: 620,

  safeToSave: 150,


  goal: {
    id: 1,
    name: "goals.sewingMachine",
    nameEn: "Own tailoring machine",
    target: 25000,
    saved: 18540,
  },


  transactions: [
  {
    id: 1,
    type: "save",
    amount: 200,
    label: "transactions.weeklySaving",
    date: "dates.today",
  },
  {
    id: 2,
    type: "save",
    amount: 150,
    label: "transactions.weeklySaving",
    date: "dates.threeDaysAgo",
  },
  {
    id: 3,
    type: "save",
    amount: 270,
    label: "transactions.tailoringWork",
    date: "dates.lastWeek",
  },
]

};



export const decoyData = {

  user:{
    name:"Priya",
    greeting:"greetings.evening"
  },


  mode:"decoy",

  hiddenSavings:240,

  weekDelta:0,

  safeToSave:0,


  goal:null,


  transactions:[

    {
      id:1,
      type:"spend",
      amount:60,
      label:"transactions.vegetables",
      date:"dates.yesterday"
    },


    {
      id:2,
      type:"spend",
      amount:120,
      label:"transactions.groceries",
      date:"dates.fourDaysAgo"
    }

  ]

};