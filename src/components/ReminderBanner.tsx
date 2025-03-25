
import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ReminderBanner = () => {
  const { dueTodayBills, upcomingBills, markBillAsPaid } = useFinance();
  const [dismissed, setDismissed] = React.useState(false);

  // If no reminders or dismissed, don't show
  if ((dueTodayBills.length === 0 && upcomingBills.length === 0) || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:max-w-md z-40 animate-slide-up">
      <div className="bg-card shadow-lg rounded-xl overflow-hidden border">
        <div className="bg-primary/10 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <AlertCircle size={18} className="text-primary" />
            <h3 className="font-medium text-sm">Payment Reminders</h3>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={() => setDismissed(true)}
          >
            <X size={16} />
          </Button>
        </div>
        
        <div className="px-4 py-3 max-h-[40vh] overflow-auto">
          {dueTodayBills.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs uppercase font-medium text-muted-foreground mb-2">Due Today</h4>
              <div className="space-y-2">
                {dueTodayBills.map(bill => (
                  <div 
                    key={bill.id}
                    className="flex items-center justify-between p-2 rounded bg-destructive/10 border border-destructive/20"
                  >
                    <div>
                      <p className="font-medium text-sm">{bill.name}</p>
                      <p className="text-xs text-muted-foreground">${bill.amount.toFixed(2)}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => markBillAsPaid(bill.id)}
                    >
                      Mark Paid
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {upcomingBills.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-medium text-muted-foreground mb-2">Upcoming</h4>
              <div className="space-y-2">
                {upcomingBills.map(bill => (
                  <div 
                    key={bill.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded border",
                      new Date(bill.dueDate) <= new Date(new Date().setDate(new Date().getDate() + 2))
                        ? "bg-amber-500/10 border-amber-500/20"
                        : "bg-secondary border-secondary/80"
                    )}
                  >
                    <div>
                      <p className="font-medium text-sm">{bill.name}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-muted-foreground">${bill.amount.toFixed(2)}</p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(bill.dueDate), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderBanner;
