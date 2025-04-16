
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Bill } from '../types';
import { User } from '@supabase/supabase-js';
import { transformDbBillToBill, prepareDbBillFromBill } from './billsTransformers';

/**
 * Fetches all bills for a user from the database
 */
export const fetchBills = async (userId: string): Promise<Bill[]> => {
  const { data: billsData, error: billsError } = await supabase
    .from('bills')
    .select('*')
    .eq('user_id', userId);
    
  if (billsError) throw billsError;
  
  return (billsData || []).map(bill => transformDbBillToBill(bill));
};

/**
 * Adds a new bill to the database
 */
export const addBill = async (user: User | null, bill: Omit<Bill, 'id'>): Promise<Bill | null> => {
  if (!user) {
    toast.error('You must be logged in to add a bill');
    return null;
  }

  try {
    const dbBill = prepareDbBillFromBill(user.id, bill);
    
    const { data, error } = await supabase
      .from('bills')
      .insert([dbBill])
      .select();
      
    if (error) throw error;
    
    if (data && data[0]) {
      const newBill = transformDbBillToBill(data[0]);
      toast.success('Bill added successfully');
      return newBill;
    }
    return null;
  } catch (error: any) {
    console.error('Error adding bill:', error);
    toast.error(error.message || 'Failed to add bill');
    return null;
  }
};

/**
 * Updates an existing bill in the database
 */
export const updateBill = async (user: User | null, id: string, updatedFields: Partial<Bill>): Promise<boolean> => {
  if (!user) {
    toast.error('You must be logged in to update a bill');
    return false;
  }

  try {
    const dbUpdates = convertToDbFormat(updatedFields);
    
    const { error } = await supabase
      .from('bills')
      .update(dbUpdates)
      .eq('id', id);
      
    if (error) throw error;
    
    toast.success('Bill updated successfully');
    return true;
  } catch (error: any) {
    console.error('Error updating bill:', error);
    toast.error(error.message || 'Failed to update bill');
    return false;
  }
};

/**
 * Deletes a bill from the database
 */
export const deleteBill = async (user: User | null, id: string): Promise<boolean> => {
  if (!user) {
    toast.error('You must be logged in to delete a bill');
    return false;
  }

  try {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    toast.success('Bill deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting bill:', error);
    toast.error(error.message || 'Failed to delete bill');
    return false;
  }
};

/**
 * Helper function to convert bill fields to database format
 */
const convertToDbFormat = (fields: Partial<Bill>): Record<string, any> => {
  const dbUpdates: Record<string, any> = {};
  
  if ('name' in fields) dbUpdates.name = fields.name;
  if ('amount' in fields) dbUpdates.amount = fields.amount;
  if ('dueDate' in fields) dbUpdates.due_date = fields.dueDate;
  if ('recurring' in fields) dbUpdates.recurring = fields.recurring;
  if ('paid' in fields) dbUpdates.paid = fields.paid;
  if ('category' in fields) dbUpdates.category = fields.category;
  if ('notes' in fields) dbUpdates.notes = fields.notes;
  if ('interest' in fields) dbUpdates.interest = fields.interest;
  if ('snoozedUntil' in fields) dbUpdates.snoozed_until = fields.snoozedUntil;
  if ('originalDueDate' in fields) dbUpdates.original_due_date = fields.originalDueDate;
  if ('pastDueDays' in fields) dbUpdates.past_due_days = fields.pastDueDays;
  
  return dbUpdates;
};
