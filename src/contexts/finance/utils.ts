
import { BillRecurring, AccountType } from './types';

// Validation utility functions
export const validateRecurring = (value: string): BillRecurring => {
  const validValues = ['once', 'daily', 'weekly', 'monthly', 'yearly'];
  return validValues.includes(value) 
    ? value as BillRecurring
    : 'once';
};

export const validateAccountType = (value: string): AccountType => {
  const validValues = ['checking', 'savings', 'credit', 'investment', 'other'];
  return validValues.includes(value) 
    ? value as AccountType
    : 'other';
};

// LCARS Dashboard utility functions
export function daysUntil(dateIso: string): number {
  const today = new Date();
  const due = new Date(dateIso);
  return Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function lcarsDueClass(days: number, pastDueDays?: number): string {
  if (days < 0) {
    const serious = typeof pastDueDays === 'number' ? pastDueDays >= 30 : Math.abs(days) >= 30;
    return serious ? 'ring-2 animate-pulse border-red-600' : 'bg-red-600';
  }
  if (days <= 7) return 'bg-orange-500';
  if (days <= 14) return 'bg-yellow-400';
  return 'bg-green-500';
}
