import { createContext, useContext, useMemo, useState } from "react";
import { realData, decoyData } from "../data/initialData";

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [mode, setMode] = useState(null);
  const [real, setReal] = useState(realData);
  const [decoy, setDecoy] = useState(decoyData);

  const value = useMemo(() => {
    const state = mode === "decoy" ? decoy : real;
    const setState = mode === "decoy" ? setDecoy : setReal;

    return {
      mode,
      setMode,
      state,
      setState,
      reset: () => {
        setReal(realData);
        setDecoy(decoyData);
        setMode(null);
      },
    };
  }, [mode, real, decoy]);

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside <FinanceProvider>");
  return ctx;
}