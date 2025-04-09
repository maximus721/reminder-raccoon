
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { fromTable } from '@/lib/supabase';
import { Transaction } from './types';
import { User } from '@supabase/supabase-js';

export const fetchTransactions = async (userId: string, accountId?: string, limit?: number): Promise<Transaction[]> => {
  try {
    // Check if transactions table exists
    const { data: checkData } = await supabase.rpc('check_if_table_exists', { 
      table_name: 'transactions' 
    });
    
    if (!checkData) {
      console.log('Transactions table does not exist yet');
      return [];
    }
    
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
      
    // Filter by account_id if provided
    if (accountId) {
      query = query.eq('account_id', accountId);
    }
    
    // Limit results if provided
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(tx => ({
      id: tx.id,
      accountId: tx.account_id,
      date: tx.date,
      description: tx.description,
      amount: tx.amount,
      category: tx.category || 'Uncategorized',
      currency: tx.currency || 'USD',
      plaidTransactionId: tx.plaid_transaction_id
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const getRecentTransactions = (transactions: Transaction[], accountId: string, limit = 5): Transaction[] => {
  return transactions
    .filter(tx => tx.accountId === accountId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};
