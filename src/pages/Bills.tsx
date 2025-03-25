
import React, { useState } from 'react';
import { Plus, Search, Filter, Trash } from 'lucide-react';
import Header from '@/components/Header';
import BillCard from '@/components/BillCard';
import AddBillForm from '@/components/AddBillForm';
import ReminderBanner from '@/components/ReminderBanner';
import { useFinance, Bill } from '@/contexts/FinanceContext';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Bills = () => {
  const { bills } = useFinance();
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleAddNewClick = () => {
    setEditingBill(undefined);
    setIsAddBillOpen(true);
  };

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setIsAddBillOpen(true);
  };

  // Apply filters to bills
  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bill.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || bill.category.toLowerCase() === categoryFilter.toLowerCase();
    
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'paid' && bill.paid) ||
                          (statusFilter === 'unpaid' && !bill.paid);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories from bills
  const categories = ['all', ...new Set(bills.map(bill => bill.category.toLowerCase()))];

  // Group bills by month/date for better organization
  const paidBills = filteredBills.filter(bill => bill.paid);
  const unpaidBills = filteredBills.filter(bill => !bill.paid);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Bills</h1>
            <p className="text-muted-foreground">Manage and track your bills and payments</p>
          </div>
          <Button onClick={handleAddNewClick} className="mt-4 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Add New Bill
          </Button>
        </div>

        {/* Search and filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bills..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem 
                  key={category} 
                  value={category}
                  className="capitalize"
                >
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active filters */}
        {(categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categoryFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {categoryFilter}
                <button 
                  onClick={() => setCategoryFilter('all')}
                  className="ml-1 h-4 w-4 rounded-full hover:bg-secondary-foreground/20 inline-flex items-center justify-center"
                >
                  <span className="sr-only">Remove</span>
                  <Trash className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {statusFilter}
                <button 
                  onClick={() => setStatusFilter('all')}
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
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6">
                  Clear All Filters
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Filters</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all your current bill filters. Are you sure?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setCategoryFilter('all');
                      setStatusFilter('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All Bills ({filteredBills.length})
            </TabsTrigger>
            <TabsTrigger value="unpaid">
              Unpaid ({unpaidBills.length})
            </TabsTrigger>
            <TabsTrigger value="paid">
              Paid ({paidBills.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {filteredBills.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <p className="text-muted-foreground mb-2">No bills found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {bills.length > 0 
                    ? 'Try adjusting your filters' 
                    : 'Add your first bill to get started'}
                </p>
                <Button onClick={handleAddNewClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Bill
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBills.map(bill => (
                  <BillCard 
                    key={bill.id} 
                    bill={bill} 
                    onEdit={handleEditBill} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="unpaid" className="mt-6">
            {unpaidBills.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <p className="text-muted-foreground mb-2">No unpaid bills found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {bills.length > 0 
                    ? 'Try adjusting your filters' 
                    : 'Add your first bill to get started'}
                </p>
                <Button onClick={handleAddNewClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Bill
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpaidBills.map(bill => (
                  <BillCard 
                    key={bill.id} 
                    bill={bill} 
                    onEdit={handleEditBill} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="paid" className="mt-6">
            {paidBills.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <p className="text-muted-foreground mb-2">No paid bills found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {bills.length > 0 
                    ? 'Try adjusting your filters'
                    : 'Mark bills as paid to see them here'}
                </p>
                <Button onClick={handleAddNewClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Bill
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paidBills.map(bill => (
                  <BillCard 
                    key={bill.id} 
                    bill={bill} 
                    onEdit={handleEditBill} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AddBillForm 
        open={isAddBillOpen}
        onOpenChange={setIsAddBillOpen}
        editingBill={editingBill}
      />
      
      <ReminderBanner />
    </div>
  );
};

export default Bills;
