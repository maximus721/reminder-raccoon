
import React, { useState } from 'react';
import { Plus, Search, Filter, Trash, CreditCard, Wallet, PieChart } from 'lucide-react';
import Header from '@/components/Header';
import AccountCard from '@/components/AccountCard';
import AddAccountForm from '@/components/AddAccountForm';
import ReminderBanner from '@/components/ReminderBanner';
import { useFinance, Account } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const Accounts = () => {
  const { accounts, totalBalance } = useFinance();
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const handleAddNewClick = () => {
    setEditingAccount(undefined);
    setIsAddAccountOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsAddAccountOpen(true);
  };

  // Apply filters to accounts
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || account.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Accounts</h1>
            <p className="text-muted-foreground">Manage your financial accounts</p>
          </div>
          <Button onClick={handleAddNewClick} className="mt-4 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Add New Account
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-xl font-bold">${totalBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Accounts</p>
                <p className="text-xl font-bold">{accounts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <PieChart size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Types</p>
                <p className="text-xl font-bold">
                  {new Set(accounts.map(a => a.type)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="checking">Checking</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="credit">Credit Card</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active filters */}
        {(typeFilter !== 'all' || searchQuery) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {typeFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type: {typeFilter}
                <button 
                  onClick={() => setTypeFilter('all')}
                  className="ml-1 h-4 w-4 rounded-full hover:bg-secondary-foreground/20 inline-flex items-center justify-center"
                >
                  <span className="sr-only">Remove</span>
                  <Trash className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchQuery}
                <button 
                  onClick={() => setSearchQuery('')}
                  className="ml-1 h-4 w-4 rounded-full hover:bg-secondary-foreground/20 inline-flex items-center justify-center"
                >
                  <span className="sr-only">Remove</span>
                  <Trash className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6"
              onClick={() => {
                setTypeFilter('all');
                setSearchQuery('');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Account list */}
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <p className="text-muted-foreground mb-2">No accounts found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {accounts.length > 0 
                ? 'Try adjusting your filters' 
                : 'Add your first account to get started'}
            </p>
            <Button onClick={handleAddNewClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Account
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map(account => (
              <AccountCard 
                key={account.id} 
                account={account} 
                onEdit={handleEditAccount} 
              />
            ))}
          </div>
        )}
      </main>

      <AddAccountForm 
        open={isAddAccountOpen}
        onOpenChange={setIsAddAccountOpen}
        editingAccount={editingAccount}
      />
      
      <ReminderBanner />
    </div>
  );
};

export default Accounts;
