
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  ArrowDownRight, 
  ArrowUpRight,
  Download,
  Filter,
  Search,
  Calendar
} from 'lucide-react';
import { Account, Transaction, useFinance } from '@/contexts/FinanceContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AccountTransactionsProps {
  account: Account;
}

const AccountTransactions: React.FC<AccountTransactionsProps> = ({ account }) => {
  const { getTransactions } = useFinance();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (account) {
        setLoading(true);
        try {
          const fetchedTransactions = await getTransactions(account.id);
          setTransactions(fetchedTransactions);
        } catch (error) {
          console.error('Error fetching transactions:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTransactions();
  }, [account, getTransactions]);

  // Apply filters to transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'income' && transaction.amount > 0) ||
      (typeFilter === 'expense' && transaction.amount < 0);
    
    const transactionDate = new Date(transaction.date);
    const matchesDateRange = 
      (!startDate || transactionDate >= startDate) &&
      (!endDate || transactionDate <= endDate);
    
    return matchesSearch && matchesType && matchesDateRange;
  });

  const exportTransactions = () => {
    // In a real app, this would generate a CSV file
    alert('This would export the transactions as a CSV file');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-semibold">Transactions</h3>
        <Button variant="outline" size="sm" onClick={exportTransactions}>
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
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
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="income">Income Only</SelectItem>
            <SelectItem value="expense">Expenses Only</SelectItem>
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                (startDate || endDate) && "text-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {startDate && endDate ? (
                <>
                  {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
                </>
              ) : (
                "Date Range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={startDate}
              selected={{
                from: startDate,
                to: endDate,
              }}
              onSelect={(range) => {
                setStartDate(range?.from);
                setEndDate(range?.to);
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Active filters */}
      {(typeFilter !== 'all' || searchQuery || startDate || endDate) && (
        <div className="flex flex-wrap gap-2">
          {typeFilter !== 'all' && (
            <Badge variant="secondary">Type: {typeFilter}</Badge>
          )}
          
          {searchQuery && (
            <Badge variant="secondary">Search: {searchQuery}</Badge>
          )}
          
          {(startDate || endDate) && (
            <Badge variant="secondary">
              Date: {startDate ? format(startDate, "MMM d, yyyy") : 'Any'} 
              {' - '} 
              {endDate ? format(endDate, "MMM d, yyyy") : 'Any'}
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2"
            onClick={clearFilters}
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Transactions Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No transactions found</p>
          {transactions.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
          )}
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{format(new Date(transaction.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="flex items-center">
                    <span 
                      className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center mr-2",
                        transaction.amount > 0 ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {transaction.amount > 0 ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                    </span>
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell 
                    className={cn(
                      "text-right font-medium",
                      transaction.amount > 0 ? "text-green-600" : ""
                    )}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    {transaction.currency}{Math.abs(transaction.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AccountTransactions;
