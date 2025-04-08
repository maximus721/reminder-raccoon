
import React, { useState, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { supabase } from '@/lib/supabase';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface ConnectBankAccountProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const ConnectBankAccount: React.FC<ConnectBankAccountProps> = ({ 
  onSuccess,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const { refreshAccounts } = useFinance();

  // Create a link token when the dialog opens
  const createLinkToken = useCallback(async () => {
    try {
      setLoading(true);
      // Get current session
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      if (!accessToken) {
        throw new Error('No active session found');
      }
      
      const response = await fetch('https://aqqxoahqxnxsmtjcgwax.supabase.co/functions/v1/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const { link_token } = await response.json();
      setLinkToken(link_token);
    } catch (error) {
      console.error('Error creating link token:', error);
      toast.error('Failed to initialize bank connection');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle opening the dialog
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && !linkToken) {
      createLinkToken();
    }
  };

  // Configure Plaid Link
  const { open: openPlaidLink } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        
        if (!accessToken) {
          throw new Error('No active session found');
        }
        
        // Exchange public token for access token via our edge function
        const response = await fetch('https://aqqxoahqxnxsmtjcgwax.supabase.co/functions/v1/exchange-public-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ 
            public_token,
            institution: metadata.institution,
            accounts: metadata.accounts
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to connect bank account');
        }
        
        // Refresh accounts after successful connection
        if (refreshAccounts) {
          await refreshAccounts();
        }
        
        toast.success('Bank account connected successfully!');
        setOpen(false);
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error('Error exchanging token:', error);
        toast.error('Failed to connect bank account');
      } finally {
        setLoading(false);
      }
    },
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid Link error:', err, metadata);
      }
    }
  });

  // Start Plaid flow when we have a link token
  const handleConnect = useCallback(() => {
    if (linkToken) {
      openPlaidLink();
    } else {
      toast.error('Unable to initialize bank connection');
    }
  }, [linkToken, openPlaidLink]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button>Connect Bank Account</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect your bank account</DialogTitle>
          <DialogDescription>
            Securely connect your bank accounts to automatically import transactions and keep your balance up to date.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="flex flex-col space-y-2 text-center sm:text-left">
            <h3 className="font-semibold">Benefits of connecting your accounts:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Automatically import transactions</li>
              <li>Keep your balances up-to-date</li>
              <li>Save time on manual data entry</li>
              <li>Get a complete picture of your finances</li>
            </ul>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConnect} 
            disabled={loading || !linkToken}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Connect Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectBankAccount;
