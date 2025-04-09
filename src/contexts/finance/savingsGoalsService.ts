
import { toast } from 'sonner';
import { supabase, fromTable } from '@/lib/supabase';
import { SavingsGoal } from './types';
import { User } from '@supabase/supabase-js';

export const fetchSavingsGoals = async (userId: string): Promise<SavingsGoal[]> => {
  try {
    // Check if savings_goals table exists
    const { data: checkData } = await supabase.rpc('check_if_table_exists', { 
      table_name: 'savings_goals' 
    } as any);
    
    if (!checkData) {
      console.log('Savings goals table does not exist yet');
      return [];
    }
    
    // Use REST API to avoid type issues
    const response = await fetch(`https://aqqxoahqxnxsmtjcgwax.supabase.co/rest/v1/savings_goals?user_id=eq.${userId}`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcXhvYWhxeG54c210amNnd2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzAwNzEsImV4cCI6MjA1ODUwNjA3MX0.levhY4ChaLa7ooowuTNUrCiqdz8Jr24usfTrlvWWszE',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcXhvYWhxeG54c210amNnd2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzAwNzEsImV4cCI6MjA1ODUwNjA3MX0.levhY4ChaLa7ooowuTNUrCiqdz8Jr24usfTrlvWWszE`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch savings goals');
    }
    
    const goalsData = await response.json();
    const transformedGoals: SavingsGoal[] = goalsData.map((goal: any) => ({
      id: goal.id,
      name: goal.name,
      targetAmount: goal.target_amount,
      currentAmount: goal.current_amount,
      deadline: goal.deadline,
      notes: goal.notes,
      category: goal.category,
      status: goal.status as SavingsGoal['status'],
      accountId: goal.account_id
    }));
    
    return transformedGoals;
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    return [];
  }
};

export const addSavingsGoal = async (user: User | null, goal: Omit<SavingsGoal, 'id'>): Promise<SavingsGoal | null> => {
  if (!user) {
    toast.error('You must be logged in to add a savings goal');
    return null;
  }

  try {
    // Check if savings_goals table exists
    const { data: checkData } = await supabase.rpc('check_if_table_exists', { 
      table_name: 'savings_goals' 
    } as any);
    
    if (!checkData) {
      console.error('Savings goals table does not exist. Please create it first.');
      toast.error('Unable to save goal. Table not set up.');
      return null;
    }
    
    const goalToInsert = {
      user_id: user.id,
      name: goal.name,
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount,
      deadline: goal.deadline,
      notes: goal.notes,
      category: goal.category,
      status: goal.status,
      account_id: goal.accountId
    };
    
    const response = await fetch(`https://aqqxoahqxnxsmtjcgwax.supabase.co/rest/v1/savings_goals`, {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcXhvYWhxeG54c210amNnd2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzAwNzEsImV4cCI6MjA1ODUwNjA3MX0.levhY4ChaLa7ooowuTNUrCiqdz8Jr24usfTrlvWWszE',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcXhvYWhxeG54c210amNnd2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzAwNzEsImV4cCI6MjA1ODUwNjA3MX0.levhY4ChaLa7ooowuTNUrCiqdz8Jr24usfTrlvWWszE`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(goalToInsert)
    });
    
    if (!response.ok) {
      throw new Error('Failed to add savings goal');
    }
    
    const data = await response.json();
    
    if (data && data[0]) {
      const newGoal: SavingsGoal = {
        id: data[0].id,
        name: data[0].name,
        targetAmount: data[0].target_amount,
        currentAmount: data[0].current_amount,
        deadline: data[0].deadline,
        notes: data[0].notes,
        category: data[0].category,
        status: data[0].status as SavingsGoal['status'],
        accountId: data[0].account_id
      };
      
      toast.success('Savings goal added successfully');
      return newGoal;
    }
    return null;
  } catch (error: any) {
    console.error('Error adding savings goal:', error);
    toast.error(error.message || 'Failed to add savings goal');
    return null;
  }
};

export const updateSavingsGoal = async (user: User | null, id: string, updatedFields: Partial<SavingsGoal>): Promise<boolean> => {
  if (!user) {
    toast.error('You must be logged in to update a savings goal');
    return false;
  }

  try {
    const dbUpdates: any = {};
    if ('name' in updatedFields) dbUpdates.name = updatedFields.name;
    if ('targetAmount' in updatedFields) dbUpdates.target_amount = updatedFields.targetAmount;
    if ('currentAmount' in updatedFields) dbUpdates.current_amount = updatedFields.currentAmount;
    if ('deadline' in updatedFields) dbUpdates.deadline = updatedFields.deadline;
    if ('notes' in updatedFields) dbUpdates.notes = updatedFields.notes;
    if ('category' in updatedFields) dbUpdates.category = updatedFields.category;
    if ('status' in updatedFields) dbUpdates.status = updatedFields.status;
    if ('accountId' in updatedFields) dbUpdates.account_id = updatedFields.accountId;
    
    const response = await fetch(`https://aqqxoahqxnxsmtjcgwax.supabase.co/rest/v1/savings_goals?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcXhvYWhxeG54c210amNnd2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzAwNzEsImV4cCI6MjA1ODUwNjA3MX0.levhY4ChaLa7ooowuTNUrCiqdz8Jr24usfTrlvWWszE',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcXhvYWhxeG54c210amNnd2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzAwNzEsImV4cCI6MjA1ODUwNjA3MX0.levhY4ChaLa7ooowuTNUrCiqdz8Jr24usfTrlvWWszE`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dbUpdates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update savings goal');
    }
    
    toast.success('Savings goal updated successfully');
    return true;
  } catch (error: any) {
    console.error('Error updating savings goal:', error);
    toast.error(error.message || 'Failed to update savings goal');
    return false;
  }
};

export const deleteSavingsGoal = async (user: User | null, id: string): Promise<boolean> => {
  if (!user) {
    toast.error('You must be logged in to delete a savings goal');
    return false;
  }

  try {
    const response = await fetch(`https://aqqxoahqxnxsmtjcgwax.supabase.co/rest/v1/savings_goals?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcXhvYWhxeG54c210amNnd2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzAwNzEsImV4cCI6MjA1ODUwNjA3MX0.levhY4ChaLa7ooowuTNUrCiqdz8Jr24usfTrlvWWszE',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcXhvYWhxeG54c210amNnd2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzAwNzEsImV4cCI6MjA1ODUwNjA3MX0.levhY4ChaLa7ooowuTNUrCiqdz8Jr24usfTrlvWWszE`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete savings goal');
    }
    
    toast.success('Savings goal deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting savings goal:', error);
    toast.error(error.message || 'Failed to delete savings goal');
    return false;
  }
};
