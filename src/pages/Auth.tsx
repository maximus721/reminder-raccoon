
import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const { user, loading } = useAuth();

  // Redirect to home if already logged in
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Finance Tracker</h1>
          <p className="text-muted-foreground">
            Manage your bills and track your finances with ease
          </p>
          <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
            <p className="text-sm font-medium">
              Note: Supabase environment variables are missing. 
              <br />
              Please set them in your environment to enable authentication and database features.
            </p>
          </div>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;
