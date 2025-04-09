import React, { createContext, useContext, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../AuthContext';

// Import finance types
import { 
  Account, 
  Bill, 
  Transaction, 
  Reminder,
  SavingsGoal
} from './types';

// Import finance services
import * as billsService from './billsService';
import * as accountsService from './accountsService';
import * as transactionsService from './transactionsService';
import * as savingsGoalsService from './savingsGoalsService';
import { remindersService } from './subscriptionsService';

type FinanceContextType = {
  bills: Bill[];
  accounts: Account[];
  reminders: Reminder[];
  savingsGoals: SavingsGoal[];
  totalBalance: number;
  upcomingBills: Bill[];
  dueTodayBills: Bill[];
  urgentBills: Bill[];
  pastDueBills: Bill[];
  addBill: (bill: Omit<Bill, 'id'>) => Promise<void>;
  updateBill: (id: string, bill: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  markBillAsPaid: (id: string) => Promise<void>;
  markBillAsUnpaid: (id: string) => Promise<void>;
  snoozeBill: (id: string, days: number) => Promise<void>;
  isUrgentBill: (bill: Bill) => boolean;
  getTransactions: (accountId: string) => Promise<Transaction[]>;
  refreshAccounts: () => Promise<void>;
  recentTransactions: (accountId: string, limit?: number) => Transaction[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  loading: boolean;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBills([]);
      setAccounts([]);
      setTransactions([]);
      setReminders([]);
      setSavingsGoals([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Calculate past due days for bills
        await billsService.calculatePastDueDays(user);
        
        // Fetch bills
        const fetchedBills = await billsService.fetchBills(user.id);
        setBills(fetchedBills);
        
        // Fetch accounts
        const fetchedAccounts = await accountsService.fetchAccounts(user.id);
        setAccounts(fetchedAccounts);
        
        // Fetch savings goals if the table exists
        try {
          const fetchedGoals = await savingsGoalsService.fetchSavingsGoals(user.id);
          setSavingsGoals(fetchedGoals);
        } catch (error) {
          console.log('Error checking savings goals table:', error);
        }

        // Fetch transactions if accounts exist
        if (fetchedAccounts.length > 0) {
          try {
            // Fetch transactions for all accounts
            const fetchedTransactions = await transactionsService.fetchTransactions(user.id, undefined, 100);
            setTransactions(fetchedTransactions);
          } catch (error) {
            console.log('Error checking transactions table:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load your data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscriptions
    if (typeof supabase.channel === 'function') {
      try {
        const billsChannel = supabase
          .channel('bills-changes')
          .on('broadcast', { event: 'bills-change' }, () => {
            console.log('Bills change received');
            fetchData();
          })
          .subscribe();
          
        const accountsChannel = supabase
          .channel('accounts-changes')
          .on('broadcast', { event: 'accounts-change' }, () => {
            console.log('Accounts change received');
            fetchData();
          })
          .subscribe();
          
        const transactionsChannel = supabase
          .channel('transactions-changes')
          .on('broadcast', { event: 'transactions-change' }, () => {
            console.log('Transactions change received');
            fetchData();
          })
          .subscribe();
        
        const savingsGoalsChannel = supabase
          .channel('savings-goals-changes')
          .on('broadcast', { event: 'savings-goals-change' }, () => {
            console.log('Savings goals change received');
            fetchData();
          })
          .subscribe();
        
        return () => {
          if (typeof supabase.removeChannel === 'function') {
            if (billsChannel) supabase.removeChannel(billsChannel);
            if (accountsChannel) supabase.removeChannel(accountsChannel);
            if (transactionsChannel) supabase.removeChannel(transactionsChannel);
            if (savingsGoalsChannel) supabase.removeChannel(savingsGoalsChannel);
          }
        };
      } catch (error) {
        console.error('Error setting up real-time subscriptions:', error);
      }
    }
  }, [user]);

  // Generate reminders from bills
  useEffect(() => {
    const billsForReminders = remindersService.generateReminders(bills);
    
    const newReminders: Reminder[] = billsForReminders.map(bill => ({
      id: `reminder-${bill.id}`,
      billId: bill.id,
      dueDate: bill.dueDate,
      billName: bill.name,
      amount: bill.amount
    }));
    
    setReminders(newReminders);
  }, [bills]);

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  // Get bills due today
  const dueTodayBills = remindersService.getBillsDueToday(bills);

  // Get upcoming bills
  const upcomingBills = remindersService.getUpcomingBills(bills);

  // Get urgent bills
  const urgentBills = remindersService.getUrgentBills(bills);

  // Get past due bills
  const pastDueBills = bills.filter(bill => !bill.paid && bill.pastDueDays && bill.pastDueDays > 0);

  // Check if bill is urgent
  const isUrgentBill = (bill: Bill) => {
    return remindersService.isUrgentBill(bill);
  };

  // Get recent transactions for an account
  const recentTransactions = (accountId: string, limit: number = 5): Transaction[] => {
    return transactionsService.getRecentTransactions(transactions, accountId, limit);
  };

  // Get all transactions for an account
  const getTransactions = async (accountId: string): Promise<Transaction[]> => {
    if (!user) {
      toast.error('You must be logged in to view transactions');
      return [];
    }
    
    return transactionsService.fetchTransactions(user.id, accountId);
  };

  // Refresh accounts (sync with external services)
  const refreshAccounts = async (): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to refresh accounts');
      return;
    }

    try {
      setLoading(true);
      const updatedAccounts = await accountsService.refreshAccounts(user);
      
      if (updatedAccounts) {
        setAccounts(updatedAccounts);
        
        // Refresh transactions after account refresh
        const updatedTransactions = await transactionsService.fetchTransactions(user.id, undefined, 100);
        setTransactions(updatedTransactions);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add new bill
  const addBill = async (bill: Omit<Bill, 'id'>) => {
    const newBill = await billsService.addBill(user, bill);
    if (newBill) {
      setBills(prev => [...prev, newBill]);
    }
  };

  // Update existing bill
  const updateBill = async (id: string, updatedFields: Partial<Bill>) => {
    const success = await billsService.updateBill(user, id, updatedFields);
    if (success) {
      setBills(prev => 
        prev.map(bill => 
          bill.id === id ? { ...bill, ...updatedFields } : bill
        )
      );
    }
  };

  // Delete bill
  const deleteBill = async (id: string) => {
    const success = await billsService.deleteBill(user, id);
    if (success) {
      setBills(prev => prev.filter(bill => bill.id !== id));
    }
  };

  // Snooze bill
  const snoozeBill = async (id: string, days: number) => {
    const success = await billsService.snoozeBill(user, id, days);
    if (success) {
      // Refetch bills to get updated data
      const updatedBills = await billsService.fetchBills(user!.id);
      setBills(updatedBills);
    }
  };

  // Add new account
  const addAccount = async (account: Omit<Account, 'id'>) => {
    const newAccount = await accountsService.addAccount(user, account);
    if (newAccount) {
      setAccounts(prev => [...prev, newAccount]);
    }
  };

  // Update existing account
  const updateAccount = async (id: string, updatedFields: Partial<Account>) => {
    const success = await accountsService.updateAccount(user, id, updatedFields);
    if (success) {
      setAccounts(prev => 
        prev.map(account => 
          account.id === id ? { ...account, ...updatedFields } : account
        )
      );
    }
  };

  // Delete account
  const deleteAccount = async (id: string) => {
    const success = await accountsService.deleteAccount(user, id);
    if (success) {
      setAccounts(prev => prev.filter(account => account.id !== id));
    }
  };

  // Add savings goal
  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal = await savingsGoalsService.addSavingsGoal(user, goal);
    if (newGoal) {
      setSavingsGoals(prev => [...prev, newGoal]);
    }
  };

  // Update savings goal
  const updateSavingsGoal = async (id: string, updatedFields: Partial<SavingsGoal>) => {
    const success = await savingsGoalsService.updateSavingsGoal(user, id, updatedFields);
    if (success) {
      setSavingsGoals(prev => 
        prev.map(goal => 
          goal.id === id ? { ...goal, ...updatedFields } : goal
        )
      );
    }
  };

  // Delete savings goal
  const deleteSavingsGoal = async (id: string) => {
    const success = await savingsGoalsService.deleteSavingsGoal(user, id);
    if (success) {
      setSavingsGoals(prev => prev.filter(goal => goal.id !== id));
    }
  };

  // Mark bill as paid
  const markBillAsPaid = async (id: string) => {
    await updateBill(id, { paid: true });
  };

  // Mark bill as unpaid
  const markBillAsUnpaid = async (id: string) => {
    await updateBill(id, { paid: false });
  };

  const value = {
    bills,
    accounts,
    reminders,
    savingsGoals,
    totalBalance,
    upcomingBills,
    dueTodayBills,
    urgentBills,
    pastDueBills,
    addBill,
    updateBill,
    deleteBill,
    addAccount,
    updateAccount,
    deleteAccount,
    markBillAsPaid,
    markBillAsUnpaid,
    snoozeBill,
    isUrgentBill,
    getTransactions,
    refreshAccounts,
    recentTransactions,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    loading
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
