
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Auth = () => {
  const { user, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Redirect to home if already logged in
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <Label className="text-base font-medium">{t('language')}</Label>
            </div>
            <RadioGroup
              value={language}
              onValueChange={(value) => setLanguage(value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="auth-en" />
                <Label htmlFor="auth-en">{t('english')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="es" id="auth-es" />
                <Label htmlFor="auth-es">{t('spanish')}</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Finance Tracker</h1>
          <p className="text-muted-foreground">
            {t('language') === 'es' 
              ? 'Administre sus facturas y realice un seguimiento de sus finanzas con facilidad'
              : 'Manage your bills and track your finances with ease'}
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;
