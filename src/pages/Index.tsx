
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  CreditCard, 
  Receipt, 
  Wallet, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import ReminderBanner from '@/components/ReminderBanner';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const Index = () => {
  const { accounts, bills, totalBalance, upcomingBills, dueTodayBills, urgentBills } = useFinance();

  const nextBill = [...dueTodayBills, ...upcomingBills].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )[0];

  // Helper function to check if a bill is in the urgent list
  const isUrgent = (billId: string) => {
    return urgentBills.some(bill => bill.id === billId);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Financial Overview */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="staggered-animation">
              <h1 className="text-3xl font-bold mb-6">Financial Overview</h1>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-card">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                        <h3 className="text-2xl font-bold mt-1">${totalBalance.toFixed(2)}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Wallet size={20} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-card">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Accounts</p>
                        <h3 className="text-2xl font-bold mt-1">{accounts.length}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <CreditCard size={20} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-card">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Bills</p>
                        <h3 className="text-2xl font-bold mt-1">{bills.length}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Receipt size={20} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={cn(
                  "bg-card",
                  urgentBills.length > 0 && "border-red-500"
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {urgentBills.length > 0 ? "Urgent Bills" : "Due Today"}
                        </p>
                        <h3 className={cn(
                          "text-2xl font-bold mt-1",
                          urgentBills.length > 0 && "text-red-500"
                        )}>
                          {urgentBills.length > 0 ? urgentBills.length : dueTodayBills.length}
                        </h3>
                      </div>
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        urgentBills.length > 0 
                          ? "bg-red-500/10 text-red-500" 
                          : "bg-amber-500/10 text-amber-500"
                      )}>
                        {urgentBills.length > 0 ? <AlertCircle size={20} /> : <Clock size={20} />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Content */}
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upcoming">Upcoming Bills</TabsTrigger>
                  <TabsTrigger value="accounts">My Accounts</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming" className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>Upcoming Payments</CardTitle>
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/bills">View All</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {dueTodayBills.length === 0 && upcomingBills.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No upcoming bills</p>
                          <Button className="mt-4" asChild>
                            <Link to="/bills">
                              <Plus className="mr-2 h-4 w-4" />
                              Add a Bill
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {dueTodayBills.map(bill => (
                            <div 
                              key={bill.id} 
                              className="flex justify-between items-center p-3 rounded-md bg-amber-500/10 border border-amber-500/20"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="rounded-full bg-amber-500/20 text-amber-500 h-8 w-8 flex items-center justify-center">
                                  <Clock size={16} />
                                </div>
                                <div>
                                  <p className="font-medium">{bill.name}</p>
                                  <p className="text-sm text-muted-foreground">Due Today</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">${bill.amount.toFixed(2)}</p>
                                <Link
                                  to="/bills"
                                  className="text-xs text-primary hover:underline"
                                >
                                  View
                                </Link>
                              </div>
                            </div>
                          ))}
                          
                          {upcomingBills.map(bill => (
                            <div 
                              key={bill.id} 
                              className={cn(
                                "flex justify-between items-center p-3 rounded-md border",
                                isUrgent(bill.id) 
                                  ? "bg-red-500/10 border-red-500/20" 
                                  : "bg-card border"
                              )}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={cn(
                                  "rounded-full h-8 w-8 flex items-center justify-center",
                                  isUrgent(bill.id)
                                    ? "bg-red-500/20 text-red-500"
                                    : "bg-primary/10 text-primary"
                                )}>
                                  {isUrgent(bill.id) ? <AlertCircle size={16} /> : <Calendar size={16} />}
                                </div>
                                <div>
                                  <p className={cn(
                                    "font-medium",
                                    isUrgent(bill.id) && "text-red-500"
                                  )}>
                                    {bill.name}
                                    {isUrgent(bill.id) && (
                                      <span className="ml-2 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                                        Urgent
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Due {format(new Date(bill.dueDate), 'MMM d')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={cn(
                                  "font-semibold",
                                  isUrgent(bill.id) && "text-red-500"
                                )}>
                                  ${bill.amount.toFixed(2)}
                                </p>
                                <Link
                                  to="/bills"
                                  className={cn(
                                    "text-xs hover:underline",
                                    isUrgent(bill.id) ? "text-red-500" : "text-primary"
                                  )}
                                >
                                  View
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="accounts" className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>My Accounts</CardTitle>
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/accounts">View All</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {accounts.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No accounts added yet</p>
                          <Button className="mt-4" asChild>
                            <Link to="/accounts">
                              <Plus className="mr-2 h-4 w-4" />
                              Add an Account
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {accounts.slice(0, 3).map(account => (
                            <div 
                              key={account.id} 
                              className="flex justify-between items-center p-3 rounded-md bg-card border"
                            >
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="rounded-full h-8 w-8 flex items-center justify-center text-white"
                                  style={{ backgroundColor: account.color }}
                                >
                                  {account.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium">{account.name}</p>
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {account.type}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {account.currency}{account.balance.toFixed(2)}
                                </p>
                                <Link
                                  to="/accounts"
                                  className="text-xs text-primary hover:underline"
                                >
                                  View
                                </Link>
                              </div>
                            </div>
                          ))}
                          
                          {accounts.length > 3 && (
                            <Button variant="ghost" className="w-full" asChild>
                              <Link to="/accounts">
                                View All ({accounts.length}) Accounts
                              </Link>
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Right column - Payment reminders and quick actions */}
          <div className="col-span-1 space-y-6">
            <div className="staggered-animation">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center space-y-1">
                    <Link to="/bills">
                      <Receipt size={22} />
                      <span className="text-xs">Add Bill</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center space-y-1">
                    <Link to="/accounts">
                      <CreditCard size={22} />
                      <span className="text-xs">Add Account</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center space-y-1">
                    <Link to="/calendar">
                      <Calendar size={22} />
                      <span className="text-xs">View Calendar</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center space-y-1">
                    <Link to="/accounts">
                      <TrendingUp size={22} />
                      <span className="text-xs">Update Balance</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              {nextBill && (
                <Card className={cn(
                  "bg-card overflow-hidden",
                  isUrgent(nextBill.id) ? "border-t-red-500" : "border-t-amber-500"
                )}>
                  <div className={cn(
                    "text-white px-4 py-1 text-xs font-medium",
                    isUrgent(nextBill.id) ? "bg-red-500" : "bg-amber-500"
                  )}>
                    {isUrgent(nextBill.id) ? "Urgent Payment" : "Next Payment"}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className={cn(
                        "font-semibold text-lg",
                        isUrgent(nextBill.id) && "text-red-500"
                      )}>
                        {nextBill.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Due {format(new Date(nextBill.dueDate), 'EEEE, MMMM d')}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className={cn(
                        "text-xl font-bold",
                        isUrgent(nextBill.id) && "text-red-500"
                      )}>
                        ${nextBill.amount.toFixed(2)}
                      </span>
                      <Button 
                        size="sm" 
                        asChild
                        variant={isUrgent(nextBill.id) ? "destructive" : "default"}
                      >
                        <Link to="/bills">Pay Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Sample activities - would be real in a production app */}
                    <div className="flex items-start space-x-3">
                      <div className="rounded-full bg-green-500/10 text-green-500 h-8 w-8 flex items-center justify-center mt-0.5">
                        <ArrowDownRight size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Direct Deposit</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(Date.now() - 86400000), 'MMM d')} • Checking
                            </p>
                          </div>
                          <span className="text-green-500 font-medium">+$1,250.00</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="rounded-full bg-muted h-8 w-8 flex items-center justify-center mt-0.5">
                        <ArrowUpRight size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Netflix</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(Date.now() - 172800000), 'MMM d')} • Credit Card
                            </p>
                          </div>
                          <span className="font-medium">-$14.99</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="rounded-full bg-muted h-8 w-8 flex items-center justify-center mt-0.5">
                        <ArrowUpRight size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Electric Bill</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(Date.now() - 259200000), 'MMM d')} • Checking
                            </p>
                          </div>
                          <span className="font-medium">-$78.35</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <ReminderBanner />
    </div>
  );
};

export default Index;
