export function updateGoal(finance, goalId, amount){

    const updatedGoals = finance.goals.map(goal=>{

        if(goal.id === goalId){

            return {
                ...goal,
                saved: goal.saved + amount
            };

        }

        return goal;

    });


    return {

        ...finance,

        balance: finance.balance - amount,

        goals: updatedGoals,

        transactions:[
            ...finance.transactions,
            {
                id:Date.now(),
                type:"saving",
                amount,
                category:"Goal Deposit",
                date:new Date().toISOString()
            }
        ]

    };

}