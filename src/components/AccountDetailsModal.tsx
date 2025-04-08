
import React from 'react';
import { Account } from '@/contexts/FinanceContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AccountTransactions from './AccountTransactions';
import ConnectBankAccount from './ConnectBankAccount';
import { Button } from '@/components/ui/button';
import { LinkIcon } from 'lucide-react';

interface AccountDetailsModalProps {
  account: Account;
  children: React.ReactNode;
}

const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({ 
  account,
  children
}) => {
  const isLinked = account.plaidAccountId !== undefined;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div 
              className="h-6 w-6 rounded-full"
              style={{ backgroundColor: account.color }}
            ></div>
            {account.name}
            {isLinked && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Linked</span>
            )}
          </DialogTitle>
          <DialogDescription>
            {account.type.charAt(0).toUpperCase() + account.type.slice(1)} Account • 
            Balance: {account.currency}{account.balance.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {!isLinked && (
            <div className="mb-6 p-4 border rounded-md bg-muted/20">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-medium">Link this account to your bank</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to automatically import transactions and keep your balance up-to-date
                  </p>
                </div>
                <ConnectBankAccount 
                  trigger={
                    <Button>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Connect
                    </Button>
                  }
                />
              </div>
            </div>
          )}

          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="details">Account Details</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions" className="py-4">
              <AccountTransactions account={account} />
            </TabsContent>
            <TabsContent value="details" className="py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Account Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm">Type</div>
                      <div className="text-sm font-medium">{account.type.charAt(0).toUpperCase() + account.type.slice(1)}</div>
                      
                      <div className="text-sm">Current Balance</div>
                      <div className="text-sm font-medium">{account.currency}{account.balance.toFixed(2)}</div>
                      
                      <div className="text-sm">Currency</div>
                      <div className="text-sm font-medium">{account.currency}</div>
                      
                      {isLinked && (
                        <>
                          <div className="text-sm">Connection Status</div>
                          <div className="text-sm font-medium text-green-600">Connected</div>
                          
                          <div className="text-sm">Last Updated</div>
                          <div className="text-sm font-medium">Just now</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Account Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">This Month's Deposits</span>
                        <span className="text-sm font-medium text-green-600">+$1,245.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">This Month's Withdrawals</span>
                        <span className="text-sm font-medium">-$876.32</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t">
                        <span className="text-sm font-medium">Net Change</span>
                        <span className="text-sm font-medium text-green-600">+$368.68</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDetailsModal;
