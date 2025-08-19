import React from 'react';
import { Bill } from '@/types/finance';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import { isThisMonth, addDays, isBefore } from 'date-fns';

interface SummaryStripProps {
  bills: Bill[];
}

export const SummaryStrip = ({ bills }: SummaryStripProps) => {
  const today = new Date();
  const next7Days = addDays(today, 7);

  // Calculate MTD paid total
  const mtdPaid = bills
    .filter(bill => bill.paid && isThisMonth(new Date(bill.dueDate)))
    .reduce((sum, bill) => sum + bill.amount, 0);

  // Calculate next 7 days total due
  const next7DaysTotal = bills
    .filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return !bill.paid && isBefore(dueDate, next7Days) && !isBefore(dueDate, today);
    })
    .reduce((sum, bill) => sum + bill.amount, 0);

  // Count overdue bills
  const overdueCount = bills.filter(bill => {
    const dueDate = new Date(bill.dueDate);
    return !bill.paid && isBefore(dueDate, today);
  }).length;

  // Count critical bills (overdue >= 30 days)
  const criticalCount = bills.filter(bill => 
    !bill.paid && (bill.pastDueDays || 0) >= 30
  ).length;

  const summaryItems = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: 'MTD Paid',
      value: `$${mtdPaid.toFixed(2)}`,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Next 7 Days',
      value: `$${next7DaysTotal.toFixed(2)}`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      label: 'Overdue',
      value: overdueCount.toString(),
      color: overdueCount > 0 ? 'text-red-600' : 'text-gray-500',
      bgColor: overdueCount > 0 ? 'bg-red-50 dark:bg-red-950' : 'bg-gray-50 dark:bg-gray-950'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Critical',
      value: criticalCount.toString(),
      color: criticalCount > 0 ? 'text-red-600' : 'text-gray-500',
      bgColor: criticalCount > 0 ? 'bg-red-50 dark:bg-red-950' : 'bg-gray-50 dark:bg-gray-950',
      pulse: criticalCount > 0
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {summaryItems.map((item, index) => (
        <Card 
          key={index} 
          className={`transition-all duration-300 hover:shadow-md ${item.bgColor} ${
            item.pulse ? 'animate-pulse' : ''
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground truncate">
                  {item.label}
                </p>
                <p className={`text-xl font-bold ${item.color} font-mono`}>
                  {item.value}
                </p>
              </div>
            </div>
            {item.label === 'Critical' && criticalCount > 0 && (
              <Badge variant="destructive" className="mt-2 text-xs">
                Requires Attention
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};