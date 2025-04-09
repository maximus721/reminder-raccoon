
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Account } from './types';
import { User } from '@supabase/supabase-js';
import { validateAccountType } from './utils';

export const fetchAccounts = async (userId: string): Promise<Account[]> => {
  const { data: accountsData, error: accountsError } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId);
    
  if (accountsError) throw accountsError;
  
  const transformedAccounts: Account[] = (accountsData || []).map(account => ({
    id: account.id,
    name: account.name,
    type: validateAccountType(account.type),
    balance: account.balance,
    currency: account.currency,
    color: account.color,
    plaidAccountId: account.plaid_account_id,
    plaidItemId: account.plaid_item_id,
    lastUpdated: account.last_updated
  }));
  
  return transformedAccounts;
};

export const addAccount = async (user: User | null, account: Omit<Account, 'id'>): Promise<Account | null> => {
  if (!user) {
    toast.error('You must be logged in to add an account');
    return null;
  }

  try {
    const dbAccount = {
      user_id: user.id,
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      color: account.color,
      plaid_account_id: account.plaidAccountId,
      plaid_item_id: account.plaidItemId,
      last_updated: account.lastUpdated
    };
    
    const { data, error } = await supabase
      .from('accounts')
      .insert([dbAccount])
      .select();
      
    if (error) throw error;
    
    if (data && data[0]) {
      const newAccount: Account = {
        id: data[0].id,
        name: data[0].name,
        type: validateAccountType(data[0].type),
        balance: data[0].balance,
        currency: data[0].currency,
        color: data[0].color,
        plaidAccountId: data[0].plaid_account_id,
        plaidItemId: data[0].plaid_item_id,
        lastUpdated: data[0].last_updated
      };
      
      toast.success('Account added successfully');
      return newAccount;
    }
    return null;
  } catch (error: any) {
    console.error('Error adding account:', error);
    toast.error(error.message || 'Failed to add account');
    return null;
  }
};

export const updateAccount = async (user: User | null, id: string, updatedFields: Partial<Account>): Promise<boolean> => {
  if (!user) {
    toast.error('You must be logged in to update an account');
    return false;
  }

  try {
    const dbUpdates: any = {};
    if ('name' in updatedFields) dbUpdates.name = updatedFields.name;
    if ('type' in updatedFields) dbUpdates.type = updatedFields.type;
    if ('balance' in updatedFields) dbUpdates.balance = updatedFields.balance;
    if ('currency' in updatedFields) dbUpdates.currency = updatedFields.currency;
    if ('color' in updatedFields) dbUpdates.color = updatedFields.color;
    if ('plaidAccountId' in updatedFields) dbUpdates.plaid_account_id = updatedFields.plaidAccountId;
    if ('plaidItemId' in updatedFields) dbUpdates.plaid_item_id = updatedFields.plaidItemId;
    if ('lastUpdated' in updatedFields) dbUpdates.last_updated = updatedFields.lastUpdated;
    
    const { error } = await supabase
      .from('accounts')
      .update(dbUpdates)
      .eq('id', id);
      
    if (error) throw error;
    
    toast.success('Account updated successfully');
    return true;
  } catch (error: any) {
    console.error('Error updating account:', error);
    toast.error(error.message || 'Failed to update account');
    return false;
  }
};

export const deleteAccount = async (user: User | null, id: string): Promise<boolean> => {
  if (!user) {
    toast.error('You must be logged in to delete an account');
    return false;
  }

  try {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    toast.success('Account deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting account:', error);
    toast.error(error.message || 'Failed to delete account');
    return false;
  }
};

export const refreshAccounts = async (user: User | null): Promise<Account[] | null> => {
  if (!user) {
    toast.error('You must be logged in to refresh accounts');
    return null;
  }

  try {
    const { data } = await supabase.auth.getSession();
    const accessToken = data?.session?.access_token;
    
    if (!accessToken) {
      throw new Error('No active session found');
    }
    
    const response = await fetch('https://aqqxoahqxnxsmtjcgwax.supabase.co/functions/v1/sync-accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync accounts');
    }
    
    // Fetch updated accounts
    const accounts = await fetchAccounts(user.id);
    
    toast.success('Accounts updated successfully');
    return accounts;
  } catch (error: any) {
    console.error('Error refreshing accounts:', error);
    toast.error(error.message || 'Failed to refresh accounts');
    return null;
  }
};
