
// Define shared finance-related types for the application

export type BillRecurring = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'other';
export type SavingsGoalStatus = 'in-progress' | 'completed' | 'paused';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO format
  recurring: BillRecurring;
  paid: boolean;
  category: string;
  notes?: string;
  interest?: number | null; // Optional interest rate for debt
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  plaidAccountId?: string | null; // Optional Plaid account ID for linked accounts
  plaidItemId?: string | null; // Optional Plaid item ID for linked accounts
  lastUpdated?: string | null; // Optional timestamp of last update
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string; // ISO format
  description: string;
  amount: number; // Negative for expenses, positive for income
  category: string;
  currency: string;
  plaidTransactionId?: string | null; // Optional Plaid transaction ID for imported transactions
}

export interface Reminder {
  id: string;
  billId: string;
  dueDate: string; // ISO format
  billName: string;
  amount: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null; // Optional ISO format date
  notes?: string | null;
  category: string;
  status: SavingsGoalStatus;
  accountId?: string | null; // Optional linked account
}

