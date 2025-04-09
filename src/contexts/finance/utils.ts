
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
