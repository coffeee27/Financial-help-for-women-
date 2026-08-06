"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { FinanceState } from "../types/finance";
import { initialFinanceState } from "../lib/mockData";
import { saveMoney, withdrawMoney } from "../lib/financeEngine";
import { generateInsight } from "../lib/insightEngine";
import { verifyPin } from "../lib/pinEngine";

interface FinanceContextType {
  finance: FinanceState;

  login: (pin: string) => boolean;

  save: (amount: number) => void;

  withdraw: (amount: number) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [finance, setFinance] = useState(initialFinanceState);

  const login = (pin: string) => {
  const mode = verifyPin(pin);

  if (!mode) return false;

  setFinance((prev) => ({
    ...prev,
    dashboardMode: mode,
  }));

  return true;
};

const save = (amount: number) => {
  setFinance((prev) => {
    const updated = saveMoney(prev, amount);

    return {
      ...updated,
      weeklyInsight: generateInsight(),
    };
  });
};
const withdraw = (amount: number) => {
  setFinance((prev) => withdrawMoney(prev, amount));
};

  // We'll add the functions next

  return (
    <FinanceContext.Provider
      value={{
        finance,
        login,
        save,
        withdraw,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error("useFinance must be used inside FinanceProvider");
  }

  return context;
}