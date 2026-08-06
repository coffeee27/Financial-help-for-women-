const pinStates = {

  "1234": {
    mode: "real",
    dashboard: "financial"
  },

  "9999": {
    mode: "decoy",
    dashboard: "safe"
  }

};


export function checkPIN(pin) {

  return pinStates[pin] || {
    mode: "invalid"
  };

}