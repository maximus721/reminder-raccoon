
// This file re-exports from the refactored finance directory
// for backwards compatibility
export { 
  FinanceProvider,
  useFinance 
} from './finance/context';

export type { 
  Account, 
  Bill, 
  Transaction, 
  Reminder, 
  BillRecurring, 
  AccountType,
  SavingsGoal,
  SavingsGoalStatus
} from './finance/types';
