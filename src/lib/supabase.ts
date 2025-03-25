
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Database types
export type Tables = {
  bills: {
    id: string;
    created_at: string;
    user_id: string;
    name: string;
    amount: number;
    due_date: string;
    recurring: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    paid: boolean;
    category: string;
    notes?: string;
  };
  accounts: {
    id: string;
    created_at: string;
    user_id: string;
    name: string;
    type: 'checking' | 'savings' | 'credit' | 'investment' | 'other';
    balance: number;
    currency: string;
    color: string;
  };
};

// Helper function to check if user is logged in
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
