
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
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
    interest: bill.interest
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
        recurring: data[0].recurring as Bill['recurring'],
        paid: data[0].paid,
        category: data[0].category,
        notes: data[0].notes,
        interest: data[0].interest
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
