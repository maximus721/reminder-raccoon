
import React from 'react';
import { format } from 'date-fns';
import { 
  CalendarClock, 
  Calendar, 
  MoreVertical,
  Check,
  Pencil,
  Trash2,
  AlertCircle,
  Clock,
  CalendarX,
  CalendarCheck,
  AlarmClock,
  RotateCcw
} from 'lucide-react';
import { Bill, useFinance } from '@/contexts/FinanceContext';
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'housing': '🏠',
  'utilities': '💡',
  'transportation': '🚗',
  'food': '🍔',
  'insurance': '🛡️',
  'health': '⚕️',
  'entertainment': '🎬',
  'education': '📚',
  'debt': '💳',
  'other': '📋'
};

const BillCard: React.FC<BillCardProps> = ({ bill, onEdit }) => {
  const { deleteBill, markBillAsPaid, markBillAsUnpaid, snoozeBill, isUrgentBill } = useFinance();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(bill.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  const isPaid = bill.paid;
  const isOverdue = !isPaid && dueDate < today;
  const isDueToday = !isPaid && dueDate.getTime() === today.getTime();
  const isDueSoon = !isPaid && dueDate > today && dueDate <= new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
  const isUrgent = !isPaid && isUrgentBill(bill);
  const isSnoozed = !isPaid && bill.snoozedUntil !== null && bill.snoozedUntil !== undefined;
  const pastDueDays = bill.pastDueDays || 0;
  
  let statusColor = 'bg-secondary text-secondary-foreground';
  if (isPaid) statusColor = 'bg-success/20 text-success';
  else if (isUrgent && pastDueDays >= 20) statusColor = 'bg-red-600/20 text-red-600';
  else if (isOverdue) statusColor = 'bg-destructive/20 text-destructive';
  else if (isDueToday) statusColor = 'bg-amber-500/20 text-amber-500';
  else if (isUrgent) statusColor = 'bg-red-500/20 text-red-500'; 
  else if (isDueSoon) statusColor = 'bg-amber-400/20 text-amber-400';

  let statusText = 'Upcoming';
  if (isPaid) statusText = 'Paid';
  else if (pastDueDays > 0) statusText = `${pastDueDays} Days Past Due`;
  else if (isOverdue) statusText = 'Overdue';
  else if (isDueToday) statusText = 'Due Today';
  else if (isSnoozed) statusText = 'Snoozed';
  else if (isUrgent) statusText = 'Urgent';
  else if (isDueSoon) statusText = 'Due Soon';

  let StatusIcon = bill.recurring !== 'once' ? CalendarClock : Calendar;

  if (isPaid) StatusIcon = CalendarCheck;
  else if (isOverdue) StatusIcon = CalendarX;
  else if (isSnoozed) StatusIcon = AlarmClock;
  else if (isUrgent) StatusIcon = AlertCircle;
  else if (isDueToday) StatusIcon = Clock;

  const handleSnooze = async (days: number) => {
    await snoozeBill(bill.id, days);
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 animate-scale-in hover:shadow-md",
      isUrgent && "border-red-500",
      isSnoozed && "border-indigo-500",
      isPaid && "opacity-75"
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
              {CATEGORY_ICONS[bill.category.toLowerCase()] || '📋'}
            </div>
            <div>
              <h3 className={cn(
                "font-medium text-base mb-0.5 flex items-center",
                isUrgent && "text-red-500"
              )}>
                {bill.name}
                {isUrgent && (
                  <span className="ml-2 text-[10px] bg-red-500 text-white px-1 py-0.5 rounded-full flex items-center">
                    <AlertCircle size={8} className="mr-0.5" />
                    Urgent
                  </span>
                )}
                {isSnoozed && (
                  <span className="ml-2 text-[10px] bg-indigo-500 text-white px-1 py-0.5 rounded-full flex items-center">
                    <AlarmClock size={8} className="mr-0.5" />
                    Snoozed
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn(
                  "text-sm font-semibold",
                  isUrgent && "text-red-500"
                )}>
                  ${bill.amount.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">•</span>
                <div className="flex items-center text-xs text-muted-foreground">
                  <StatusIcon size={14} className="mr-1" />
                  <span>
                    {isSnoozed 
                      ? `Snoozed until ${format(new Date(bill.snoozedUntil!), 'MMM d, yyyy')}` 
                      : bill.recurring !== 'once' 
                        ? `${bill.recurring.charAt(0).toUpperCase() + bill.recurring.slice(1)}` 
                        : format(new Date(bill.dueDate), 'MMM d, yyyy')}
                  </span>
                </div>
                {(isSnoozed && bill.originalDueDate) && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar size={14} className="mr-1" />
                    <span>
                      Originally due {format(new Date(bill.originalDueDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                {pastDueDays > 0 && (
                  <div className={cn(
                    "flex items-center text-xs",
                    pastDueDays >= 20 ? "text-red-600 font-medium" : "text-destructive"
                  )}>
                    <CalendarX size={14} className="mr-1" />
                    <span>
                      {pastDueDays} {pastDueDays === 1 ? 'day' : 'days'} past due
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className={cn(
              "text-xs px-2 py-1 rounded-full font-medium mr-2",
              statusColor
            )}>
              {statusText}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 relative z-20">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50">
                {!bill.paid && (
                  <DropdownMenuItem onClick={() => markBillAsPaid(bill.id)}>
                    <Check size={14} className="mr-2" />
                    Mark as Paid
                  </DropdownMenuItem>
                )}
                
                {bill.paid && (
                  <DropdownMenuItem onClick={() => markBillAsUnpaid(bill.id)}>
                    <RotateCcw size={14} className="mr-2" />
                    Mark as Unpaid
                  </DropdownMenuItem>
                )}
                
                {!bill.paid && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <AlarmClock size={14} className="mr-2" />
                      Snooze Bill
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="z-50">
                      <DropdownMenuItem onClick={() => handleSnooze(1)}>
                        1 Day
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSnooze(3)}>
                        3 Days
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSnooze(7)}>
                        1 Week
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSnooze(14)}>
                        2 Weeks
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSnooze(29)}>
                        29 Days
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(bill)}>
                  <Pencil size={14} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive" 
                  onClick={() => deleteBill(bill.id)}
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillCard;
