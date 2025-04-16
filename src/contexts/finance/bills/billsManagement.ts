
import { supabase, Bills } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

/**
 * Snoozes a bill by changing its due date and tracking original due date
 */
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
    const originalDueDate = billData.original_due_date || billData.due_date;
    
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

/**
 * Calculates and updates how many days a bill is past due
 */
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
        
        // Update the bill with days past due
        await supabase
          .from('bills')
          .update({ past_due_days: pastDueDays })
          .eq('id', bill.id);
      }
    }
  } catch (error) {
    console.error('Error calculating past due days:', error);
  }
};
