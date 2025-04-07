import React, { createContext, useContext, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

// Define types
export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO format
  recurring: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  paid: boolean;
  category: string;
  notes?: string;
  interest?: number; // Optional interest rate for debt
};

export type Account = {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'other';
  balance: number;
  currency: string;
  color: string;
};

export type Reminder = {
  id: string;
  billId: string;
  dueDate: string; // ISO format
  billName: string;
  amount: number;
};

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
  loading: boolean;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Validate recurring value
  const validateRecurring = (value: string): 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' => {
    const validValues = ['once', 'daily', 'weekly', 'monthly', 'yearly'];
    return validValues.includes(value) 
      ? value as 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'
      : 'once';
  };

  // Validate account type
  const validateAccountType = (value: string): 'checking' | 'savings' | 'credit' | 'investment' | 'other' => {
    const validValues = ['checking', 'savings', 'credit', 'investment', 'other'];
    return validValues.includes(value) 
      ? value as 'checking' | 'savings' | 'credit' | 'investment' | 'other'
      : 'other';
  };

  // Fetch bills and accounts from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setBills([]);
      setAccounts([]);
      setReminders([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch bills
        const { data: billsData, error: billsError } = await supabase
          .from('bills')
          .select('*')
          .eq('user_id', user.id);
          
        if (billsError) throw billsError;
        
        // Transform database bills to application format with proper type validation
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
        
        // Fetch accounts
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id);
          
        if (accountsError) throw accountsError;
        
        // Transform database accounts to application format with proper type validation
        const transformedAccounts: Account[] = (accountsData || []).map(account => ({
          id: account.id,
          name: account.name,
          type: validateAccountType(account.type),
          balance: account.balance,
          currency: account.currency,
          color: account.color
        }));
        
        setAccounts(transformedAccounts);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load your data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Only set up real-time subscriptions if we're not using the mock client
    if (typeof supabase.channel === 'function') {
      try {
        // Set up a channel for real-time updates
        const billsChannel = supabase
          .channel('bills-changes')
          .on('broadcast', { event: 'bills-change' }, () => {
            console.log('Bills change received');
            // Refresh bills when there's a change
            fetchData();
          })
          .subscribe();
          
        // Set up a channel for real-time updates
        const accountsChannel = supabase
          .channel('accounts-changes')
          .on('broadcast', { event: 'accounts-change' }, () => {
            console.log('Accounts change received');
            // Refresh accounts when there's a change
            fetchData();
          })
          .subscribe();
        
        return () => {
          if (typeof supabase.removeChannel === 'function') {
            if (billsChannel) supabase.removeChannel(billsChannel);
            if (accountsChannel) supabase.removeChannel(accountsChannel);
          }
        };
      } catch (error) {
        console.error('Error setting up real-time subscriptions:', error);
      }
    }
  }, [user]);

  // Calculate upcoming bills and generate reminders
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStr = format(today, 'yyyy-MM-dd');
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    // Generate reminders for upcoming bills
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

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  // Calculate upcoming bills (due within 7 days, not paid)
  const upcomingBills = bills.filter(bill => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(bill.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return !bill.paid && dueDate > today && dueDate <= nextWeek;
  });

  // Calculate bills due today (not paid)
  const dueTodayBills = bills.filter(bill => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return !bill.paid && bill.dueDate === today;
  });

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
      // Convert from application format to database format
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
      
      // Update local state as well (optimistic update)
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
      
      // Update local state
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
      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          user_id: user.id,
          name: account.name,
          type: account.type,
          balance: account.balance,
          currency: account.currency,
          color: account.color
        }])
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        const newAccount: Account = {
          id: data[0].id,
          name: data[0].name,
          type: validateAccountType(data[0].type),
          balance: data[0].balance,
          currency: data[0].currency,
          color: data[0].color
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
      const { error } = await supabase
        .from('accounts')
        .update(updatedFields)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state as well (optimistic update)
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
      
      // Update local state
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
