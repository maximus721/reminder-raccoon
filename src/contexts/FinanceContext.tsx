
import React, { createContext, useContext, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
  addBill: (bill: Omit<Bill, 'id'>) => void;
  updateBill: (id: string, bill: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  markBillAsPaid: (id: string) => void;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('financeAppBills');
    return saved ? JSON.parse(saved) : [];
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('financeAppAccounts');
    return saved ? JSON.parse(saved) : [];
  });

  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Save to localStorage whenever bills or accounts change
  useEffect(() => {
    localStorage.setItem('financeAppBills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('financeAppAccounts', JSON.stringify(accounts));
  }, [accounts]);

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

  const addBill = (bill: Omit<Bill, 'id'>) => {
    const newBill = {
      ...bill,
      id: `bill-${Date.now()}`
    };
    setBills(prev => [...prev, newBill]);
    toast.success('Bill added successfully');
  };

  const updateBill = (id: string, updatedFields: Partial<Bill>) => {
    setBills(prev => 
      prev.map(bill => 
        bill.id === id ? { ...bill, ...updatedFields } : bill
      )
    );
    toast.success('Bill updated successfully');
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(bill => bill.id !== id));
    toast.success('Bill deleted successfully');
  };

  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount = {
      ...account,
      id: `account-${Date.now()}`
    };
    setAccounts(prev => [...prev, newAccount]);
    toast.success('Account added successfully');
  };

  const updateAccount = (id: string, updatedFields: Partial<Account>) => {
    setAccounts(prev => 
      prev.map(account => 
        account.id === id ? { ...account, ...updatedFields } : account
      )
    );
    toast.success('Account updated successfully');
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(account => account.id !== id));
    toast.success('Account deleted successfully');
  };

  const markBillAsPaid = (id: string) => {
    setBills(prev => 
      prev.map(bill => 
        bill.id === id ? { ...bill, paid: true } : bill
      )
    );
    toast.success('Bill marked as paid');
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
