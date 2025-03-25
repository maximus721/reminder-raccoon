
import React from 'react';
import { format } from 'date-fns';
import { 
  CalendarClock, 
  Calendar, 
  MoreVertical,
  Check,
  Pencil,
  Trash2
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
  const { deleteBill, markBillAsPaid } = useFinance();

  // Determine status
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(bill.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  const isPaid = bill.paid;
  const isOverdue = !isPaid && dueDate < today;
  const isDueToday = !isPaid && dueDate.getTime() === today.getTime();
  const isDueSoon = !isPaid && dueDate > today && dueDate <= new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
  
  let statusColor = 'bg-secondary text-secondary-foreground';
  if (isPaid) statusColor = 'bg-success/20 text-success';
  else if (isOverdue) statusColor = 'bg-destructive/20 text-destructive';
  else if (isDueToday) statusColor = 'bg-amber-500/20 text-amber-500';
  else if (isDueSoon) statusColor = 'bg-amber-400/20 text-amber-400';

  let statusText = 'Upcoming';
  if (isPaid) statusText = 'Paid';
  else if (isOverdue) statusText = 'Overdue';
  else if (isDueToday) statusText = 'Due Today';
  else if (isDueSoon) statusText = 'Due Soon';

  const RecurringIcon = bill.recurring !== 'once' ? CalendarClock : Calendar;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 animate-scale-in hover:shadow-md",
      isPaid && "opacity-75"
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
              {CATEGORY_ICONS[bill.category.toLowerCase()] || '📋'}
            </div>
            <div>
              <h3 className="font-medium text-base mb-0.5">{bill.name}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">${bill.amount.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">•</span>
                <div className="flex items-center text-xs text-muted-foreground">
                  <RecurringIcon size={14} className="mr-1" />
                  <span>
                    {bill.recurring !== 'once' 
                      ? `${bill.recurring.charAt(0).toUpperCase() + bill.recurring.slice(1)}` 
                      : format(new Date(bill.dueDate), 'MMM d, yyyy')}
                  </span>
                </div>
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
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!bill.paid && (
                  <DropdownMenuItem onClick={() => markBillAsPaid(bill.id)}>
                    <Check size={14} className="mr-2" />
                    Mark as Paid
                  </DropdownMenuItem>
                )}
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
