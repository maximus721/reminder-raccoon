
import { createClient } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';

// Use the environment variables from the Supabase integration
const supabaseUrl = "https://aqqxoahqxnxsmtjcgwax.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcXhvYWhxeG54c210amNnd2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzAwNzEsImV4cCI6MjA1ODUwNjA3MX0.levhY4ChaLa7ooowuTNUrCiqdz8Jr24usfTrlvWWszE";

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

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
