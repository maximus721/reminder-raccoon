
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Use the environment variables from the Supabase integration
const supabaseUrl = "https://aqqxoahqxnxsmtjcgwax.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcXhvYWhxeG54c210amNnd2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzAwNzEsImV4cCI6MjA1ODUwNjA3MX0.levhY4ChaLa7ooowuTNUrCiqdz8Jr24usfTrlvWWszE";

// Create the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce', // Use PKCE flow for more secure auth
  }
});

// Helper function for type assertions when accessing tables not in the type definition
export function fromTable(tableName: string) {
  return supabase.from(tableName as any);
}

// Database types
export type Bills = Database['public']['Tables']['bills']['Row'];
export type Accounts = Database['public']['Tables']['accounts']['Row'];

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
