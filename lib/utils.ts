import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = "AZN"): string {
  const num = Number(price) || 0;
  if (currency === "USD") {
    return `$${(num / 1.70).toFixed(2)}`;
  }
  if (currency === "EUR") {
    return `€${(num / 1.85).toFixed(2)}`;
  }
  return `${num.toFixed(2)} ₼`;
}
