
import React, { useState } from 'react';
import { format, isToday, isSameMonth, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { ChevronsLeft, ChevronsRight, CalendarIcon } from 'lucide-react';
import Header from '@/components/Header';
import ReminderBanner from '@/components/ReminderBanner';
import { useFinance, Bill } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const CalendarView = () => {
  const { bills } = useFinance();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Helper to get bills due on a specific date
  const getBillsDueOnDate = (date: Date): Bill[] => {
    const dateString = format(date, 'yyyy-MM-dd');
    return bills.filter(bill => bill.dueDate === dateString);
  };

  // Bills for the selected date
  const selectedDateBills = selectedDate ? getBillsDueOnDate(selectedDate) : [];

  // Function to navigate to previous month
  const previousMonth = () => {
    setDate(subMonths(date, 1));
  };

  // Function to navigate to next month
  const nextMonth = () => {
    setDate(addMonths(date, 1));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Payment Calendar</h1>
          <p className="text-muted-foreground">View your payment schedule</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Calendar</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={previousMonth}
                    aria-label="Previous month"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDate(new Date())}
                    aria-label="Today"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextMonth}
                    aria-label="Next month"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-3">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={date}
                    onMonthChange={setDate}
                    className="p-0 pointer-events-auto"
                    modifiersStyles={{
                      today: { fontWeight: 'bold' },
                    }}
                    components={{
                      DayContent: ({ date, ...props }) => {
                        // Check if any bills are due on this date
                        const dateString = format(date, 'yyyy-MM-dd');
                        const dueToday = bills.some(bill => bill.dueDate === dateString);
                        
                        return (
                          <div className="relative w-full h-full flex items-center justify-center">
                            {props.children}
                            {dueToday && (
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1.5 w-1.5 bg-primary rounded-full" />
                            )}
                          </div>
                        );
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected day details */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate
                    ? format(selectedDate, 'MMMM d, yyyy')
                    : 'Select a date'}
                </CardTitle>
                <CardDescription>
                  {selectedDate && isToday(selectedDate)
                    ? 'Today'
                    : selectedDate && !isSameMonth(selectedDate, new Date())
                    ? 'Different month'
                    : '\u00A0'} {/* Non-breaking space for consistent height */}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDateBills.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">
                      {selectedDateBills.length} 
                      {selectedDateBills.length === 1 ? ' bill' : ' bills'} due
                    </h3>
                    <div className="space-y-3">
                      {selectedDateBills.map(bill => (
                        <div
                          key={bill.id}
                          className={cn(
                            "p-3 rounded-md border",
                            bill.paid 
                              ? "bg-success/10 border-success/20" 
                              : "bg-card"
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{bill.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {bill.category}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${bill.amount.toFixed(2)}</p>
                              <Badge variant={bill.paid ? "success" : "outline"} className="mt-1">
                                {bill.paid ? 'Paid' : 'Unpaid'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>No bills due on this date</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Month Summary</CardTitle>
                <CardDescription>
                  {format(date, 'MMMM yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Get all bills due in the current month */}
                  {(() => {
                    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                    
                    const monthBills = bills.filter(bill => {
                      const billDate = new Date(bill.dueDate);
                      return isWithinInterval(billDate, { start: monthStart, end: monthEnd });
                    });
                    
                    const totalAmount = monthBills.reduce((sum, bill) => sum + bill.amount, 0);
                    const paidAmount = monthBills
                      .filter(bill => bill.paid)
                      .reduce((sum, bill) => sum + bill.amount, 0);
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <p className="text-sm">Total Bills:</p>
                          <p className="font-medium">{monthBills.length}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm">Total Amount:</p>
                          <p className="font-medium">${totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm">Paid Amount:</p>
                          <p className="font-medium text-success">${paidAmount.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm">Remaining:</p>
                          <p className="font-medium">${(totalAmount - paidAmount).toFixed(2)}</p>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Payment Progress</span>
                            <span>{totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ 
                                width: totalAmount > 0 ? `${(paidAmount / totalAmount) * 100}%` : '0%'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <ReminderBanner />
    </div>
  );
};

export default CalendarView;
