import React, { useState } from 'react';
import { format } from 'date-fns';
import { Bill } from '@/types/finance';
import { daysUntil, lcarsDueClass } from '@/contexts/finance/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Check, Clock, AlertTriangle } from 'lucide-react';

interface BillPanelProps {
  bill: Bill;
  onMarkPaid: (id: string) => void;
  onSnooze: (id: string, days: number) => void;
  onView?: (id: string) => void;
}

export const BillPanel = ({ bill, onMarkPaid, onSnooze, onView }: BillPanelProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const daysRemaining = daysUntil(bill.dueDate);
  const colorClass = lcarsDueClass(daysRemaining, bill.pastDueDays);
  const isOverdue = daysRemaining < 0;
  const isCritical = !bill.paid && bill.pastDueDays && bill.pastDueDays >= 30;

  const handleMarkPaid = async () => {
    setIsProcessing(true);
    try {
      await onMarkPaid(bill.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSnooze = async (days: number) => {
    setIsProcessing(true);
    try {
      await onSnooze(bill.id, days);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusLabel = () => {
    if (bill.paid) return 'PAID';
    if (isCritical) return 'CRITICAL';
    if (isOverdue) return 'OVERDUE';
    if (daysRemaining <= 7) return 'DUE SOON';
    if (daysRemaining <= 14) return 'UPCOMING';
    return 'SCHEDULED';
  };

  const getStatusColor = () => {
    if (bill.paid) return 'bg-green-600 text-white';
    if (isCritical) return 'bg-red-600 text-white animate-pulse';
    if (isOverdue) return 'bg-red-500 text-white';
    if (daysRemaining <= 7) return 'bg-orange-500 text-white';
    if (daysRemaining <= 14) return 'bg-yellow-500 text-black';
    return 'bg-green-500 text-white';
  };

  return (
    <Card 
      className={`transition-all duration-300 hover:shadow-lg border-l-4 ${colorClass} ${
        isCritical ? 'ring-2 ring-red-400 animate-pulse' : ''
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{bill.name}</h3>
            {isCritical && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                ALERT
              </Badge>
            )}
          </div>
          <Badge className={`${getStatusColor()} text-xs font-mono`}>
            {getStatusLabel()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Amount:</span>
            <p className="font-mono text-lg">${bill.amount.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Due:</span>
            <p className="font-medium">
              {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
            </p>
            {!bill.paid && (
              <p className="text-xs text-muted-foreground">
                {isOverdue 
                  ? `${Math.abs(daysRemaining)} days overdue`
                  : `${daysRemaining} days remaining`
                }
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Recurrence:</span>
            <Badge variant="outline" className="ml-2 capitalize">
              {bill.recurring}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Category:</span>
            <Badge variant="secondary" className="ml-2">
              {bill.category}
            </Badge>
          </div>
        </div>

        {bill.notes && (
          <div className="text-sm">
            <span className="text-muted-foreground">Notes:</span>
            <p className="text-xs mt-1 text-muted-foreground">{bill.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            {!bill.paid && (
              <Button 
                size="sm" 
                onClick={handleMarkPaid}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Mark Paid
              </Button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50">
              {!bill.paid && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Clock className="w-4 h-4 mr-2" />
                    Snooze
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="z-50">
                    <DropdownMenuItem onClick={() => handleSnooze(3)}>
                      3 Days
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSnooze(7)}>
                      7 Days
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSnooze(14)}>
                      14 Days
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSnooze(21)}>
                      21 Days
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              {onView && (
                <DropdownMenuItem onClick={() => onView(bill.id)}>
                  View Details
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};