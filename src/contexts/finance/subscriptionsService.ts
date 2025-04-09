
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Bill } from './types';
import { User } from '@supabase/supabase-js';
import { format } from 'date-fns';

export interface RemindersService {
  generateReminders: (bills: Bill[]) => Bill[];
  getBillsDueToday: (bills: Bill[]) => Bill[];
  getUpcomingBills: (bills: Bill[]) => Bill[];
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
  }
};
