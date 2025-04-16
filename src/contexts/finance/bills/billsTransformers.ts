
import { Bills } from '@/lib/supabase';
import { Bill } from '../types';

/**
 * Transforms a database bill object to a Bill domain object
 */
export const transformDbBillToBill = (bill: Bills): Bill => {
  return {
    id: bill.id,
    name: bill.name,
    amount: bill.amount,
    dueDate: bill.due_date,
    recurring: bill.recurring as Bill['recurring'],
    paid: bill.paid,
    category: bill.category,
    notes: bill.notes,
    interest: bill.interest,
    snoozedUntil: bill.snoozed_until || null,
    originalDueDate: bill.original_due_date || bill.due_date,
    pastDueDays: bill.past_due_days || 0
  };
};

/**
 * Prepares a database bill object from a Bill domain object
 */
export const prepareDbBillFromBill = (userId: string, bill: Omit<Bill, 'id'>): Record<string, any> => {
  return {
    user_id: userId,
    name: bill.name,
    amount: bill.amount,
    due_date: bill.dueDate,
    recurring: bill.recurring,
    paid: bill.paid,
    category: bill.category,
    notes: bill.notes,
    interest: bill.interest,
    snoozed_until: bill.snoozedUntil || null,
    original_due_date: bill.originalDueDate || bill.dueDate,
    past_due_days: bill.pastDueDays || 0
  };
};
