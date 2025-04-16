
import { toast } from 'sonner';
import { supabase, Bills } from '@/lib/supabase';
import { Bill } from './types';
import { User } from '@supabase/supabase-js';

export const fetchBills = async (userId: string): Promise<Bill[]> => {
  const { data: billsData, error: billsError } = await supabase
    .from('bills')
    .select('*')
    .eq('user_id', userId);
    
  if (billsError) throw billsError;
  
  const transformedBills: Bill[] = (billsData || []).map(bill => ({
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
  }));
  
  return transformedBills;
};

export const addBill = async (user: User | null, bill: Omit<Bill, 'id'>): Promise<Bill | null> => {
  if (!user) {
    toast.error('You must be logged in to add a bill');
    return null;
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
        interest: bill.interest,
        snoozed_until: bill.snoozedUntil || null,
        original_due_date: bill.originalDueDate || bill.dueDate,
        past_due_days: bill.pastDueDays || 0
      }])
      .select();
      
    if (error) throw error;
    
    if (data && data[0]) {
      const newBill: Bill = {
        id: data[0].id,
        name: data[0].name,
        amount: data[0].amount,
        dueDate: data[0].due_date,
        recurring: data[0].recurring as Bill['recurring'],
        paid: data[0].paid,
        category: data[0].category,
        notes: data[0].notes,
        interest: data[0].interest,
        snoozedUntil: data[0].snoozed_until || null,
        originalDueDate: data[0].original_due_date || data[0].due_date,
        pastDueDays: data[0].past_due_days || 0
      };
      
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

export const updateBill = async (user: User | null, id: string, updatedFields: Partial<Bill>): Promise<boolean> => {
  if (!user) {
    toast.error('You must be logged in to update a bill');
    return false;
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
    if ('snoozedUntil' in updatedFields) dbUpdates.snoozed_until = updatedFields.snoozedUntil;
    if ('originalDueDate' in updatedFields) dbUpdates.original_due_date = updatedFields.originalDueDate;
    if ('pastDueDays' in updatedFields) dbUpdates.past_due_days = updatedFields.pastDueDays;
    
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

export const snoozeBill = async (user: User | null, id: string, days: number): Promise<boolean> => {
  if (!user) {
    toast.error('You must be logged in to snooze a bill');
    return false;
  }
  
  if (days <= 0 || days > 29) {
    toast.error('Bills can only be snoozed between 1 and 29 days');
    return false;
  }

  try {
    // First get the current bill to save the original due date
    const { data: currentBill, error: fetchError } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Ensure we're working with the right types
    const billData = currentBill as Bills;
    
    // Calculate the new due date
    const currentDueDate = new Date(billData.due_date);
    const newDueDate = new Date(currentDueDate);
    newDueDate.setDate(currentDueDate.getDate() + days);
    
    // Save the original due date if this is the first time snoozing
    const originalDueDate = (billData as any).original_due_date || billData.due_date;
    
    const { error: updateError } = await supabase
      .from('bills')
      .update({
        due_date: newDueDate.toISOString().split('T')[0],
        original_due_date: originalDueDate,
        snoozed_until: newDueDate.toISOString().split('T')[0]
      })
      .eq('id', id);
      
    if (updateError) throw updateError;
    
    toast.success(`Bill snoozed for ${days} days`);
    return true;
  } catch (error: any) {
    console.error('Error snoozing bill:', error);
    toast.error(error.message || 'Failed to snooze bill');
    return false;
  }
};

export const calculatePastDueDays = async (user: User | null): Promise<void> => {
  if (!user) return;

  try {
    // Get all unpaid bills
    const { data: unpaidBills, error: fetchError } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', user.id)
      .eq('paid', false);
      
    if (fetchError) throw fetchError;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // For each unpaid bill, calculate days past due
    for (const bill of unpaidBills || []) {
      const dueDate = new Date(bill.due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      // If due date is in the past
      if (dueDate < today) {
        const pastDueDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Update the bill with days past due using type assertion for the database schema
        await supabase
          .from('bills')
          .update({ 
            past_due_days: pastDueDays 
          } as any)
          .eq('id', bill.id);
      }
    }
  } catch (error) {
    console.error('Error calculating past due days:', error);
  }
};
