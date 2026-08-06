export type DashboardMode = "real" | "decoy";

export interface Goal {
  id: string;
  title: string;
  target: number;
  saved: number;
}

export interface Transaction {
  id: string;
  type: "save" | "withdraw";
  amount: number;
  date: string;
}

export interface FinanceState {
  balance: number;
  hiddenSavings: number;
  goals: Goal[];
  transactions: Transaction[];
  dashboardMode: DashboardMode;
  weeklyInsight: string;
}