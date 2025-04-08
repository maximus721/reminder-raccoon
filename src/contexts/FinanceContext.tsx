
import React, { createContext, useContext, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { 
  Account, 
  AccountType, 
  Bill, 
  BillRecurring, 
  Reminder, 
  Transaction 
} from '@/types/finance';

type FinanceContextType = {
  bills: Bill[];
  accounts: Account[];
  reminders: Reminder[];
  totalBalance: number;
  upcomingBills: Bill[];
  dueTodayBills: Bill[];
  addBill: (bill: Omit<Bill, 'id'>) => Promise<void>;
  updateBill: (id: string, bill: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  markBillAsPaid: (id: string) => Promise<void>;
  getTransactions: (accountId: string) => Promise<Transaction[]>;
  refreshAccounts: () => Promise<void>;
  recentTransactions: (accountId: string, limit?: number) => Transaction[];
  loading: boolean;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const validateRecurring = (value: string): BillRecurring => {
    const validValues = ['once', 'daily', 'weekly', 'monthly', 'yearly'];
    return validValues.includes(value) 
      ? value as BillRecurring
      : 'once';
  };

  const validateAccountType = (value: string): AccountType => {
    const validValues = ['checking', 'savings', 'credit', 'investment', 'other'];
    return validValues.includes(value) 
      ? value as AccountType
      : 'other';
  };

  useEffect(() => {
    if (!user) {
      setBills([]);
      setAccounts([]);
      setTransactions([]);
      setReminders([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: billsData, error: billsError } = await supabase
          .from('bills')
          .select('*')
          .eq('user_id', user.id);
          
        if (billsError) throw billsError;
        
        const transformedBills: Bill[] = (billsData || []).map(bill => ({
          id: bill.id,
          name: bill.name,
          amount: bill.amount,
          dueDate: bill.due_date,
          recurring: validateRecurring(bill.recurring),
          paid: bill.paid,
          category: bill.category,
          notes: bill.notes,
          interest: bill.interest
        }));
        
        setBills(transformedBills);
        
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id);
          
        if (accountsError) throw accountsError;
        
        const transformedAccounts: Account[] = (accountsData || []).map(account => ({
          id: account.id,
          name: account.name,
          type: validateAccountType(account.type),
          balance: account.balance,
          currency: account.currency,
          color: account.color,
          plaidAccountId: account.plaid_account_id,
          plaidItemId: account.plaid_item_id,
          lastUpdated: account.last_updated
        }));
        
        setAccounts(transformedAccounts);
        
        if (transformedAccounts.length > 0) {
          try {
            // Check if transactions table exists first
            const { count, error: checkError } = await supabase
              .from('transactions')
              .select('*', { count: 'exact', head: true })
              .limit(1);
              
            if (!checkError) {
              const { data: transactionsData, error: transactionsError } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(100);
                
              if (!transactionsError) {
                const transformedTransactions: Transaction[] = (transactionsData || []).map(tx => ({
                  id: tx.id,
                  accountId: tx.account_id,
                  date: tx.date,
                  description: tx.description,
                  amount: tx.amount,
                  category: tx.category || 'Uncategorized',
                  currency: tx.currency || 'USD',
                  plaidTransactionId: tx.plaid_transaction_id
                }));
                
                setTransactions(transformedTransactions);
              }
            } else {
              console.log('Transactions table may not exist yet:', checkError);
            }
          } catch (error) {
            console.log('Transactions table may not exist yet:', error);
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
        
        return () => {
          if (typeof supabase.removeChannel === 'function') {
            if (billsChannel) supabase.removeChannel(billsChannel);
            if (accountsChannel) supabase.removeChannel(accountsChannel);
            if (transactionsChannel) supabase.removeChannel(transactionsChannel);
          }
        };
      } catch (error) {
        console.error('Error setting up real-time subscriptions:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStr = format(today, 'yyyy-MM-dd');
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const newReminders = bills
      .filter(bill => !bill.paid && new Date(bill.dueDate) <= nextWeek)
      .map(bill => ({
        id: `reminder-${bill.id}`,
        billId: bill.id,
        dueDate: bill.dueDate,
        billName: bill.name,
        amount: bill.amount
      }));
    
    setReminders(newReminders);
  }, [bills]);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const upcomingBills = bills.filter(bill => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(bill.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return !bill.paid && dueDate > today && dueDate <= nextWeek;
  });

  const dueTodayBills = bills.filter(bill => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return !bill.paid && bill.dueDate === today;
  });

  const recentTransactions = (accountId: string, limit: number = 5): Transaction[] => {
    return transactions
      .filter(tx => tx.accountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };

  const getTransactions = async (accountId: string): Promise<Transaction[]> => {
    if (!user) {
      toast.error('You must be logged in to view transactions');
      return [];
    }

    try {
      // First, check if transactions table exists
      try {
        const { count, error: checkError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .limit(1);
          
        if (checkError) {
          console.log('Transactions table may not exist yet:', checkError);
          return [];
        }
      } catch (error) {
        console.log('Error checking transactions table:', error);
        return [];
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('account_id', accountId)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      return (data || []).map(tx => ({
        id: tx.id,
        accountId: tx.account_id,
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        category: tx.category || 'Uncategorized',
        currency: tx.currency || 'USD',
        plaidTransactionId: tx.plaid_transaction_id
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
      return [];
    }
  };

  const refreshAccounts = async (): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to refresh accounts');
      return;
    }

    try {
      setLoading(true);
      
      const { data } = await supabase.auth.getSession();
      const accessToken = data?.session?.access_token;
      
      if (!accessToken) {
        throw new Error('No active session found');
      }
      
      const response = await fetch('https://aqqxoahqxnxsmtjcgwax.supabase.co/functions/v1/sync-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync accounts');
      }
      
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);
        
      if (accountsError) throw accountsError;
      
      const transformedAccounts: Account[] = (accountsData || []).map(account => ({
        id: account.id,
        name: account.name,
        type: validateAccountType(account.type),
        balance: account.balance,
        currency: account.currency,
        color: account.color,
        plaidAccountId: account.plaid_account_id,
        plaidItemId: account.plaid_item_id,
        lastUpdated: account.last_updated
      }));
      
      setAccounts(transformedAccounts);
      
      try {
        // Check if transactions table exists first
        const { count, error: checkError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .limit(1);
          
        if (!checkError) {
          const { data: transactionsData, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(100);
            
          if (!transactionsError) {
            const transformedTransactions: Transaction[] = (transactionsData || []).map(tx => ({
              id: tx.id,
              accountId: tx.account_id,
              date: tx.date,
              description: tx.description,
              amount: tx.amount,
              category: tx.category || 'Uncategorized',
              currency: tx.currency || 'USD',
              plaidTransactionId: tx.plaid_transaction_id
            }));
            
            setTransactions(transformedTransactions);
          }
        }
      } catch (error) {
        console.log('Error fetching transactions:', error);
      }
      
      toast.success('Accounts updated successfully');
    } catch (error) {
      console.error('Error refreshing accounts:', error);
      toast.error('Failed to refresh accounts');
    } finally {
      setLoading(false);
    }
  };

  const addBill = async (bill: Omit<Bill, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to add a bill');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bills')
        .insert([{
          user_id: user.id,
          name: bill.name,
          amount: bill.amount,
          due_date: bill.dueDate,
          recurring: bill.recurring,
          paid: bill.paid,
          category: bill.category,
          notes: bill.notes,
          interest: bill.interest
        }])
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        const newBill: Bill = {
          id: data[0].id,
          name: data[0].name,
          amount: data[0].amount,
          dueDate: data[0].due_date,
          recurring: validateRecurring(data[0].recurring),
          paid: data[0].paid,
          category: data[0].category,
          notes: data[0].notes,
          interest: data[0].interest
        };
        
        setBills(prev => [...prev, newBill]);
        toast.success('Bill added successfully');
      }
    } catch (error: any) {
      console.error('Error adding bill:', error);
      toast.error(error.message || 'Failed to add bill');
    }
  };

  const updateBill = async (id: string, updatedFields: Partial<Bill>) => {
    if (!user) {
      toast.error('You must be logged in to update a bill');
      return;
    }

    try {
      const dbUpdates: any = {};
      if ('name' in updatedFields) dbUpdates.name = updatedFields.name;
      if ('amount' in updatedFields) dbUpdates.amount = updatedFields.amount;
      if ('dueDate' in updatedFields) dbUpdates.due_date = updatedFields.dueDate;
      if ('recurring' in updatedFields) dbUpdates.recurring = updatedFields.recurring;
      if ('paid' in updatedFields) dbUpdates.paid = updatedFields.paid;
      if ('category' in updatedFields) dbUpdates.category = updatedFields.category;
      if ('notes' in updatedFields) dbUpdates.notes = updatedFields.notes;
      if ('interest' in updatedFields) dbUpdates.interest = updatedFields.interest;
      
      const { error } = await supabase
        .from('bills')
        .update(dbUpdates)
        .eq('id', id);
        
      if (error) throw error;
      
      setBills(prev => 
        prev.map(bill => 
          bill.id === id ? { ...bill, ...updatedFields } : bill
        )
      );
      
      toast.success('Bill updated successfully');
    } catch (error: any) {
      console.error('Error updating bill:', error);
      toast.error(error.message || 'Failed to update bill');
    }
  };

  const deleteBill = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete a bill');
      return;
    }

    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setBills(prev => prev.filter(bill => bill.id !== id));
      toast.success('Bill deleted successfully');
    } catch (error: any) {
      console.error('Error deleting bill:', error);
      toast.error(error.message || 'Failed to delete bill');
    }
  };

  const addAccount = async (account: Omit<Account, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to add an account');
      return;
    }

    try {
      const dbAccount = {
        user_id: user.id,
        name: account.name,
        type: account.type,
        balance: account.balance,
        currency: account.currency,
        color: account.color,
        plaid_account_id: account.plaidAccountId,
        plaid_item_id: account.plaidItemId,
        last_updated: account.lastUpdated
      };
      
      const { data, error } = await supabase
        .from('accounts')
        .insert([dbAccount])
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        const newAccount: Account = {
          id: data[0].id,
          name: data[0].name,
          type: validateAccountType(data[0].type),
          balance: data[0].balance,
          currency: data[0].currency,
          color: data[0].color,
          plaidAccountId: data[0].plaid_account_id,
          plaidItemId: data[0].plaid_item_id,
          lastUpdated: data[0].last_updated
        };
        
        setAccounts(prev => [...prev, newAccount]);
        toast.success('Account added successfully');
      }
    } catch (error: any) {
      console.error('Error adding account:', error);
      toast.error(error.message || 'Failed to add account');
    }
  };

  const updateAccount = async (id: string, updatedFields: Partial<Account>) => {
    if (!user) {
      toast.error('You must be logged in to update an account');
      return;
    }

    try {
      const dbUpdates: any = {};
      if ('name' in updatedFields) dbUpdates.name = updatedFields.name;
      if ('type' in updatedFields) dbUpdates.type = updatedFields.type;
      if ('balance' in updatedFields) dbUpdates.balance = updatedFields.balance;
      if ('currency' in updatedFields) dbUpdates.currency = updatedFields.currency;
      if ('color' in updatedFields) dbUpdates.color = updatedFields.color;
      if ('plaidAccountId' in updatedFields) dbUpdates.plaid_account_id = updatedFields.plaidAccountId;
      if ('plaidItemId' in updatedFields) dbUpdates.plaid_item_id = updatedFields.plaidItemId;
      if ('lastUpdated' in updatedFields) dbUpdates.last_updated = updatedFields.lastUpdated;
      
      const { error } = await supabase
        .from('accounts')
        .update(dbUpdates)
        .eq('id', id);
        
      if (error) throw error;
      
      setAccounts(prev => 
        prev.map(account => 
          account.id === id ? { ...account, ...updatedFields } : account
        )
      );
      
      toast.success('Account updated successfully');
    } catch (error: any) {
      console.error('Error updating account:', error);
      toast.error(error.message || 'Failed to update account');
    }
  };

  const deleteAccount = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete an account');
      return;
    }

    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setAccounts(prev => prev.filter(account => account.id !== id));
      toast.success('Account deleted successfully');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Failed to delete account');
    }
  };

  const markBillAsPaid = async (id: string) => {
    await updateBill(id, { paid: true });
  };

  const value = {
    bills,
    accounts,
    reminders,
    totalBalance,
    upcomingBills,
    dueTodayBills,
    addBill,
    updateBill,
    deleteBill,
    addAccount,
    updateAccount,
    deleteAccount,
    markBillAsPaid,
    getTransactions,
    refreshAccounts,
    recentTransactions,
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

// Re-export the types from the types file for components to use
export type { Account, Bill, Transaction, Reminder, BillRecurring, AccountType } from '@/types/finance';
