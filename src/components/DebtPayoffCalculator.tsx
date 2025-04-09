
import React, { useState, useEffect } from 'react';
import { useFinance, Bill } from '@/contexts/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BanknoteIcon, Calculator, DollarSign } from "lucide-react";
import { toast } from 'sonner';

const DebtPayoffCalculator = () => {
  const { bills } = useFinance();
  const [debts, setDebts] = useState<Bill[]>([]);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(500);
  const [payoffStrategy, setPayoffStrategy] = useState<'highest-interest' | 'snowball'>('highest-interest');
  const [results, setResults] = useState<{months: number, totalInterest: number, payoffDate: Date} | null>(null);

  useEffect(() => {
    // Filter bills with interest rates (these are debts)
    const debtBills = bills.filter(bill => bill.interest && bill.interest > 0);
    setDebts(debtBills);
  }, [bills]);

  const calculatePayoff = () => {
    if (debts.length === 0) {
      toast.error("You don't have any debts with interest rates configured");
      return;
    }

    if (monthlyPayment <= 0) {
      toast.error("Monthly payment must be greater than zero");
      return;
    }

    // Sort the debts based on the selected strategy
    const sortedDebts = [...debts].sort((a, b) => {
      if (payoffStrategy === 'highest-interest') {
        return (b.interest || 0) - (a.interest || 0);
      } else { // snowball method (smallest balance first)
        return a.amount - b.amount;
      }
    });

    let remainingDebts = sortedDebts.map(debt => ({
      ...debt,
      remainingAmount: debt.amount
    }));
    
    let months = 0;
    let totalInterest = 0;
    let allPaidOff = false;
    let monthlyPaymentLeft = 0;
    
    while (!allPaidOff && months < 600) { // 50 years max to prevent infinite loops
      months++;
      monthlyPaymentLeft = monthlyPayment;
      
      // Apply interest to all debts
      remainingDebts = remainingDebts.map(debt => {
        const monthlyInterestRate = (debt.interest || 0) / 100 / 12;
        const interestThisMonth = debt.remainingAmount * monthlyInterestRate;
        totalInterest += interestThisMonth;
        
        return {
          ...debt,
          remainingAmount: debt.remainingAmount + interestThisMonth
        };
      });
      
      // Apply payments starting with the first debt
      for (let i = 0; i < remainingDebts.length; i++) {
        if (remainingDebts[i].remainingAmount > 0 && monthlyPaymentLeft > 0) {
          // Pay as much as possible towards this debt
          const payment = Math.min(remainingDebts[i].remainingAmount, monthlyPaymentLeft);
          remainingDebts[i].remainingAmount -= payment;
          monthlyPaymentLeft -= payment;
        }
      }
      
      // Check if all debts are paid off
      allPaidOff = remainingDebts.every(debt => debt.remainingAmount <= 0);
    }
    
    const today = new Date();
    const payoffDate = new Date(today);
    payoffDate.setMonth(today.getMonth() + months);
    
    setResults({
      months,
      totalInterest,
      payoffDate
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Calculator className="h-6 w-6 mr-2" />
        <h2 className="text-2xl font-bold">Debt Payoff Calculator</h2>
      </div>
      
      {debts.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <BanknoteIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No Debts Found</h3>
              <p className="text-muted-foreground">
                Add bills with interest rates in the Bills section to calculate payoff strategies.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your Debts</CardTitle>
              <CardDescription>
                These are your bills that have interest rates configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Interest Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {debts.map(debt => (
                        <tr key={debt.id}>
                          <td className="px-4 py-3 text-sm">{debt.name}</td>
                          <td className="px-4 py-3 text-sm text-right">${debt.amount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-right">{debt.interest}%</td>
                        </tr>
                      ))}
                      <tr className="bg-muted/50">
                        <td className="px-4 py-3 text-sm font-medium">Total</td>
                        <td className="px-4 py-3 text-sm font-medium text-right">
                          ${debts.reduce((sum, debt) => sum + debt.amount, 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Calculate Payoff Strategy</CardTitle>
              <CardDescription>
                Set your monthly payment and preferred strategy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="monthlyPayment">Monthly Payment Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="monthlyPayment"
                      type="number"
                      min="0"
                      step="10"
                      className="pl-8"
                      value={monthlyPayment}
                      onChange={(e) => setMonthlyPayment(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="strategy">Payoff Strategy</Label>
                  <Select
                    value={payoffStrategy}
                    onValueChange={(value) => setPayoffStrategy(value as 'highest-interest' | 'snowball')}
                  >
                    <SelectTrigger id="strategy">
                      <SelectValue placeholder="Select a strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highest-interest">Highest Interest First (Avalanche)</SelectItem>
                      <SelectItem value="snowball">Smallest Balance First (Snowball)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={calculatePayoff} className="mt-4 w-full">
                Calculate Payoff Plan
              </Button>
            </CardContent>
          </Card>
          
          {results && (
            <Card>
              <CardHeader>
                <CardTitle>Payoff Results</CardTitle>
                <CardDescription>
                  Based on your current debts and payment plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Time to Pay Off</h4>
                    <p className="text-2xl font-bold">
                      {results.months} {results.months === 1 ? 'month' : 'months'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Payoff Date</h4>
                    <p className="text-2xl font-bold">
                      {results.payoffDate.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Total Interest</h4>
                    <p className="text-2xl font-bold text-destructive">
                      ${results.totalInterest.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default DebtPayoffCalculator;
