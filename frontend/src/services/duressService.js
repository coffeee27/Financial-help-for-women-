const pinStates = {

    "1234":{
        state:"normal",
        dashboard:"financial"
    },


    "9999":{
        state:"duress",
        dashboard:"safe"
    }

};


export function verifyPIN(pin){

    return pinStates[pin] || {

        state:"invalid"

    };

}