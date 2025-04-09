
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Bill } from './types';
import { User } from '@supabase/supabase-js';
import { format, differenceInDays } from 'date-fns';

export interface RemindersService {
  generateReminders: (bills: Bill[]) => Bill[];
  getBillsDueToday: (bills: Bill[]) => Bill[];
  getUpcomingBills: (bills: Bill[]) => Bill[];
  getBillsDueWithinDays: (bills: Bill[], days: number) => Bill[];
  getUrgentBills: (bills: Bill[]) => Bill[];
  isUrgentBill: (bill: Bill) => boolean;
}

export const remindersService: RemindersService = {
  generateReminders: (bills: Bill[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return bills.filter(bill => !bill.paid && new Date(bill.dueDate) <= nextWeek);
  },
  
  getBillsDueToday: (bills: Bill[]) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return bills.filter(bill => !bill.paid && bill.dueDate === today);
  },
  
  getUpcomingBills: (bills: Bill[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date();
    dueDate.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return bills.filter(bill => {
      const billDueDate = new Date(bill.dueDate);
      billDueDate.setHours(0, 0, 0, 0);
      return !bill.paid && billDueDate > today && billDueDate <= nextWeek;
    });
  },
  
  getBillsDueWithinDays: (bills: Bill[], days: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const cutoffDate = new Date(today);
    cutoffDate.setDate(today.getDate() + days);
    
    return bills.filter(bill => {
      const billDueDate = new Date(bill.dueDate);
      billDueDate.setHours(0, 0, 0, 0);
      return !bill.paid && billDueDate > today && billDueDate <= cutoffDate;
    });
  },

  isUrgentBill: (bill: Bill) => {
    // Bills that are snoozed are automatically urgent
    if (bill.snoozedUntil) {
      return true;
    }

    // Bills approaching 30 days past due are urgent
    if (bill.pastDueDays && bill.pastDueDays >= 20) {
      return true;
    }

    // Bills due within 5 days are urgent
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const billDueDate = new Date(bill.dueDate);
    billDueDate.setHours(0, 0, 0, 0);
    
    const daysUntilDue = differenceInDays(billDueDate, today);
    
    // If due date is in the future but within 5 days
    if (daysUntilDue >= 0 && daysUntilDue <= 5) {
      return true;
    }

    // If already past due
    if (daysUntilDue < 0) {
      return true;
    }

    return false;
  },

  getUrgentBills: (bills: Bill[]) => {
    return bills.filter(bill => !bill.paid && remindersService.isUrgentBill(bill));
  }
};
