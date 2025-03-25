
import React from 'react';
import { 
  MoreVertical,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Account, useFinance } from '@/contexts/FinanceContext';
import { 
  Card, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
}

const TYPE_LABELS: Record<string, string> = {
  'checking': 'Checking Account',
  'savings': 'Savings Account',
  'credit': 'Credit Card',
  'investment': 'Investment Account',
  'other': 'Other Account'
};

const AccountCard: React.FC<AccountCardProps> = ({ account, onEdit }) => {
  const { deleteAccount } = useFinance();

  // Sample transactions (in a real app, these would come from your data)
  const sampleTransactions = [
    { description: 'Deposit', amount: 245.00, isIncome: true },
    { description: 'Amazon', amount: 29.99, isIncome: false },
  ];

  return (
    <Card className="overflow-hidden transition-all duration-300 animate-scale-in hover:shadow-md">
      <div 
        className="h-2" 
        style={{ backgroundColor: account.color }}
      />
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <div 
              className="h-10 w-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: account.color }}
            >
              {account.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium text-base">{account.name}</h3>
              <p className="text-xs text-muted-foreground">
                {TYPE_LABELS[account.type]}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(account)}>
                <Pencil size={14} className="mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={() => deleteAccount(account.id)}
              >
                <Trash2 size={14} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <h2 className="text-2xl font-semibold mt-1">
            {account.currency}{account.balance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </h2>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/50 px-4 py-3 flex flex-col">
        <p className="text-xs font-medium text-muted-foreground mb-2">Recent Transactions</p>
        <div className="space-y-2 w-full">
          {sampleTransactions.map((transaction, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center">
                <span 
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center mr-2",
                    transaction.isIncome ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                  )}
                >
                  {transaction.isIncome ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                </span>
                <span className="text-xs">{transaction.description}</span>
              </div>
              <span 
                className={cn(
                  "text-xs font-medium",
                  transaction.isIncome ? "text-success" : ""
                )}
              >
                {transaction.isIncome ? "+" : "-"}
                ${transaction.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AccountCard;
