
import { createClient } from '@supabase/supabase-js';

// Try to get the environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if environment variables are missing and log an error
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Create a mock Supabase client if variables are missing
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      // Provide mock implementations to prevent runtime errors
      auth: {
        getSession: async () => ({ data: { session: null } }),
        getUser: async () => ({ data: { user: null } }),
        onAuthStateChange: () => ({ 
          data: { 
            subscription: { 
              unsubscribe: () => {} 
            } 
          } 
        }),
        signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
        signUp: async () => ({ error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: null }),
        resetPasswordForEmail: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            data: [],
            error: null
          })
        }),
        insert: () => ({
          select: () => ({
            data: null,
            error: null
          })
        }),
        update: () => ({
          eq: () => ({
            error: null
          })
        }),
        delete: () => ({
          eq: () => ({
            error: null
          })
        })
      }),
      channel: () => ({
        on: () => ({
          subscribe: () => {}
        })
      }),
      removeChannel: () => {}
    };

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
