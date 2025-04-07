
import React, { useMemo } from 'react';
import { useFinance, Bill } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BillsSummary = () => {
  const { bills } = useFinance();

  const summary = useMemo(() => {
    const result = {
      total: 0,
      debt: 0,
      other: 0,
      categorySummary: {} as Record<string, number>,
    };

    bills.forEach(bill => {
      if (!bill.paid) {
        // Add to total
        result.total += bill.amount;
        
        // Add to category totals
        if (!result.categorySummary[bill.category]) {
          result.categorySummary[bill.category] = 0;
        }
        result.categorySummary[bill.category] += bill.amount;
        
        // Add to specific categories we track
        if (bill.category.toLowerCase() === 'debt') {
          result.debt += bill.amount;
        } else {
          result.other += bill.amount;
        }
      }
    });

    return result;
  }, [bills]);

  // Group bills by category
  const billsByCategory = useMemo(() => {
    const grouped: Record<string, Bill[]> = {};
    
    bills.forEach(bill => {
      if (!bill.paid) {
        if (!grouped[bill.category]) {
          grouped[bill.category] = [];
        }
        grouped[bill.category].push(bill);
      }
    });
    
    return grouped;
  }, [bills]);

  // Calculate total with interest for debt items
  const totalWithInterest = useMemo(() => {
    let interestTotal = 0;
    
    bills.forEach(bill => {
      if (!bill.paid && bill.category.toLowerCase() === 'debt' && bill.interest) {
        // Simple interest calculation: amount * (interest rate / 100) / 12 (for monthly)
        const monthlyInterest = bill.amount * (bill.interest / 100) / 12;
        interestTotal += monthlyInterest;
      }
    });
    
    return summary.total + interestTotal;
  }, [bills, summary.total]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bills Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm">Total Owed</p>
              <p className="text-2xl font-bold">${summary.total.toFixed(2)}</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-1">
                <p className="text-muted-foreground text-sm mr-1">With Interest</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px]">
                    <p className="text-xs">
                      Includes estimated monthly interest for debt items based on annual rates
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-2xl font-bold">${totalWithInterest.toFixed(2)}</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm">Debt</p>
              <p className="text-2xl font-bold">${summary.debt.toFixed(2)}</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm">Other</p>
              <p className="text-2xl font-bold">${summary.other.toFixed(2)}</p>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="category-breakdown">
              <AccordionTrigger>Category Breakdown</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {Object.entries(billsByCategory).map(([category, categoryBills]) => {
                    const totalAmount = categoryBills.reduce((sum, bill) => sum + bill.amount, 0);
                    return (
                      <div key={category} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2 capitalize">
                            {category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ({categoryBills.length} bills)
                          </span>
                        </div>
                        <span className="font-medium">${totalAmount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillsSummary;
