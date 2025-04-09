
import React from 'react';
import { X, AlertCircle, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ReminderBanner = () => {
  const { dueTodayBills, upcomingBills, urgentBills, markBillAsPaid } = useFinance();
  const [dismissed, setDismissed] = React.useState(false);

  // If no reminders or dismissed, don't show
  if ((dueTodayBills.length === 0 && upcomingBills.length === 0) || dismissed) {
    return null;
  }

  // Helper function to check if a bill is urgent
  const isUrgent = (billId: string) => {
    return urgentBills.some(bill => bill.id === billId);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:max-w-md z-40 animate-slide-up">
      <div className="bg-card shadow-lg rounded-xl overflow-hidden border">
        <div className={cn(
          "px-4 py-3 flex justify-between items-center",
          urgentBills.length > 0 ? "bg-red-500/10" : "bg-primary/10"
        )}>
          <div className="flex items-center space-x-2">
            <AlertCircle size={18} className={urgentBills.length > 0 ? "text-red-500" : "text-primary"} />
            <h3 className="font-medium text-sm">
              {urgentBills.length > 0 ? "Urgent Payment Reminders" : "Payment Reminders"}
            </h3>
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
                      isUrgent(bill.id)
                        ? "bg-red-500/10 border-red-500/20"
                        : new Date(bill.dueDate) <= new Date(new Date().setDate(new Date().getDate() + 2))
                          ? "bg-amber-500/10 border-amber-500/20"
                          : "bg-secondary border-secondary/80"
                    )}
                  >
                    <div>
                      <p className={cn(
                        "font-medium text-sm flex items-center",
                        isUrgent(bill.id) && "text-red-500"
                      )}>
                        {bill.name}
                        {isUrgent(bill.id) && (
                          <span className="ml-2 text-[10px] bg-red-500 text-white px-1 py-0.5 rounded-full">
                            Urgent
                          </span>
                        )}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-muted-foreground">${bill.amount.toFixed(2)}</p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(bill.dueDate), 'MMM d')}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "rounded-full h-6 w-6 flex items-center justify-center",
                      isUrgent(bill.id)
                        ? "bg-red-500/20 text-red-500" 
                        : "bg-amber-500/20 text-amber-500"
                    )}>
                      {isUrgent(bill.id) ? <AlertCircle size={14} /> : <Calendar size={14} />}
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
