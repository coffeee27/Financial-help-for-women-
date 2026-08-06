export function getSavingsInsight(finance){

    const possibleSaving = 150;


    return {

        message:
        `You can safely save ₹${possibleSaving} this week`,

        amount: possibleSaving,

        confidence:"demo"

    };

}