import { DashboardMode } from "../types/finance";

const REAL_PIN = "1234";

const DECOY_PIN = "0000";

export function verifyPin(pin: string): DashboardMode | null {

  if(pin===REAL_PIN) return "real";

  if(pin===DECOY_PIN) return "decoy";

  return null;
}