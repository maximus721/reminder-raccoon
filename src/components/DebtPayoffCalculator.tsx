
import React, { useState, useMemo } from 'react';
import { useFinance, Bill } from '@/contexts/FinanceContext';
import { addMonths, format, parseISO } from 'date-fns';
import { AlertCircle, DollarSign, CalendarClock, Calculator, PlusCircle, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DebtPayoffCalculator = () => {
  const { bills, accounts, updateBill } = useFinance();
  const { toast } = useToast();
  
  const [selectedDebtId, setSelectedDebtId] = useState<string>('');
  const [lumpSumPayment, setLumpSumPayment] = useState<number>(0);
  const [additionalMonthlyPayment, setAdditionalMonthlyPayment] = useState<number>(0);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  
  // Get all unpaid debt bills
  const debtBills = useMemo(() => {
    return bills.filter(bill => 
      !bill.paid && 
      bill.category.toLowerCase() === 'debt' && 
      bill.recurring !== 'once'
    );
  }, [bills]);
  
  // Get selected debt bill
  const selectedDebt = useMemo(() => {
    return debtBills.find(bill => bill.id === selectedDebtId);
  }, [debtBills, selectedDebtId]);
  
  // Calculate total liquid balance from accounts
  const totalLiquidBalance = useMemo(() => {
    return accounts.reduce((total, account) => {
      // Only consider checking and savings for liquid funds
      if (account.type === 'checking' || account.type === 'savings') {
        return total + account.balance;
      }
      return total;
    }, 0);
  }, [accounts]);
  
  // Calculate standard payoff date
  const standardPayoffInfo = useMemo(() => {
    if (!selectedDebt) return null;
    
    const amount = selectedDebt.amount;
    const monthlyPayment = selectedDebt.amount / 10; // Assuming 10% of total as minimum payment
    const interestRate = selectedDebt.interest || 0;
    
    // Calculate months to pay off with regular payments
    let balance = amount;
    let months = 0;
    let totalInterestPaid = 0;
    
    while (balance > 0 && months < 360) { // Cap at 30 years
      const monthlyInterest = balance * (interestRate / 100 / 12);
      totalInterestPaid += monthlyInterest;
      balance = balance + monthlyInterest - monthlyPayment;
      months++;
    }
    
    const payoffDate = addMonths(new Date(), months);
    
    return {
      months,
      payoffDate,
      totalInterestPaid,
      monthlyPayment
    };
  }, [selectedDebt]);
  
  // Calculate lump sum payoff date
  const lumpSumPayoffInfo = useMemo(() => {
    if (!selectedDebt || !standardPayoffInfo) return null;
    if (lumpSumPayment <= 0) return standardPayoffInfo;
    
    const amount = selectedDebt.amount - lumpSumPayment;
    if (amount <= 0) return { months: 0, payoffDate: new Date(), totalInterestPaid: 0, monthlyPayment: 0 };
    
    const monthlyPayment = standardPayoffInfo.monthlyPayment;
    const interestRate = selectedDebt.interest || 0;
    
    // Calculate months to pay off with lump sum applied
    let balance = amount;
    let months = 0;
    let totalInterestPaid = 0;
    
    while (balance > 0 && months < 360) {
      const monthlyInterest = balance * (interestRate / 100 / 12);
      totalInterestPaid += monthlyInterest;
      balance = balance + monthlyInterest - monthlyPayment;
      months++;
    }
    
    const payoffDate = addMonths(new Date(), months);
    
    return {
      months,
      payoffDate,
      totalInterestPaid,
      monthlyPayment
    };
  }, [selectedDebt, standardPayoffInfo, lumpSumPayment]);
  
  // Calculate increased payment payoff date
  const increasedPaymentInfo = useMemo(() => {
    if (!selectedDebt || !standardPayoffInfo) return null;
    if (additionalMonthlyPayment <= 0) return lumpSumPayment > 0 ? lumpSumPayoffInfo : standardPayoffInfo;
    
    const startAmount = lumpSumPayment > 0 
      ? selectedDebt.amount - lumpSumPayment 
      : selectedDebt.amount;
      
    if (startAmount <= 0) return { months: 0, payoffDate: new Date(), totalInterestPaid: 0, monthlyPayment: 0 };
    
    const baseMonthlyPayment = standardPayoffInfo.monthlyPayment;
    const totalMonthlyPayment = baseMonthlyPayment + additionalMonthlyPayment;
    const interestRate = selectedDebt.interest || 0;
    
    // Calculate months to pay off with increased payments
    let balance = startAmount;
    let months = 0;
    let totalInterestPaid = 0;
    
    while (balance > 0 && months < 360) {
      const monthlyInterest = balance * (interestRate / 100 / 12);
      totalInterestPaid += monthlyInterest;
      balance = balance + monthlyInterest - totalMonthlyPayment;
      months++;
    }
    
    const payoffDate = addMonths(new Date(), months);
    
    // Check if increased payments are sustainable
    const totalMonthlyBillPayments = bills
      .filter(bill => !bill.paid && bill.recurring !== 'once')
      .reduce((sum, bill) => {
        let amount = bill.amount;
        if (bill.id === selectedDebt.id) {
          amount = standardPayoffInfo.monthlyPayment + additionalMonthlyPayment;
        }
        return sum + amount;
      }, 0);
      
    // Show warning if monthly payments exceed liquid balance
    const isWarning = totalMonthlyBillPayments > totalLiquidBalance;
    setShowWarning(isWarning);
    
    return {
      months,
      payoffDate,
      totalInterestPaid,
      monthlyPayment: totalMonthlyPayment
    };
  }, [
    selectedDebt, 
    standardPayoffInfo, 
    lumpSumPayment, 
    additionalMonthlyPayment, 
    lumpSumPayoffInfo,
    bills,
    totalLiquidBalance
  ]);
  
  // Save the updated payment plan
  const applyPaymentPlan = () => {
    if (!selectedDebt) return;
    
    // Make sure there's an increased payment
    if (additionalMonthlyPayment <= 0) {
      toast({
        title: "No changes to apply",
        description: "Please increase the monthly payment amount first.",
        variant: "destructive"
      });
      return;
    }
    
    // Apply lump sum payment if provided
    let updatedAmount = selectedDebt.amount;
    if (lumpSumPayment > 0) {
      updatedAmount -= lumpSumPayment;
    }
    
    // Update the bill
    updateBill(selectedDebt.id, {
      amount: updatedAmount,
      notes: selectedDebt.notes 
        ? `${selectedDebt.notes}\nIncreased monthly payment by $${additionalMonthlyPayment.toFixed(2)}.`
        : `Increased monthly payment by $${additionalMonthlyPayment.toFixed(2)}.`
    })
      .then(() => {
        toast({
          title: "Payment plan updated",
          description: "Your new payment plan has been saved.",
        });
        
        // Reset form
        setLumpSumPayment(0);
        setAdditionalMonthlyPayment(0);
      })
      .catch(error => {
        toast({
          title: "Failed to update payment plan",
          description: "An error occurred while saving your changes.",
          variant: "destructive"
        });
      });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debt Payoff Calculator</CardTitle>
          <CardDescription>
            Plan your debt payoff strategy and see how different payment approaches affect your timeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Debt Selection */}
          <div className="space-y-2">
            <Label htmlFor="debt-select">Select a debt to pay off</Label>
            <Select 
              value={selectedDebtId} 
              onValueChange={setSelectedDebtId}
            >
              <SelectTrigger id="debt-select">
                <SelectValue placeholder="Choose a debt" />
              </SelectTrigger>
              <SelectContent>
                {debtBills.length > 0 ? (
                  debtBills.map(debt => (
                    <SelectItem key={debt.id} value={debt.id}>
                      {debt.name} - ${debt.amount.toFixed(2)}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No eligible debt bills found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {selectedDebt ? (
            <>
              {/* Debt Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-primary" />
                      Current Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">${selectedDebt.amount.toFixed(2)}</p>
                    {selectedDebt.interest && (
                      <p className="text-sm text-muted-foreground">
                        {selectedDebt.interest}% interest
                      </p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center">
                      <CalendarClock className="h-4 w-4 mr-2 text-primary" />
                      Estimated Payoff
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {standardPayoffInfo ? (
                      <>
                        <p className="text-2xl font-bold">
                          {format(standardPayoffInfo.payoffDate, 'MMM yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {standardPayoffInfo.months} months
                        </p>
                      </>
                    ) : (
                      <p>Calculating...</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center">
                      <Calculator className="h-4 w-4 mr-2 text-primary" />
                      Monthly Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {standardPayoffInfo ? (
                      <>
                        <p className="text-2xl font-bold">
                          ${standardPayoffInfo.monthlyPayment.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Minimum payment
                        </p>
                      </>
                    ) : (
                      <p>Calculating...</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Payment Simulation */}
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Payment Simulation</h3>
                  
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="lump-sum">
                    <AccordionTrigger>
                      Apply Lump Sum Payment
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="lump-sum">One-time payment amount</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="lump-sum"
                              type="number"
                              placeholder="0.00"
                              min={0}
                              max={selectedDebt.amount}
                              value={lumpSumPayment}
                              onChange={(e) => setLumpSumPayment(parseFloat(e.target.value) || 0)}
                            />
                            <Button 
                              variant="outline" 
                              onClick={() => setLumpSumPayment(0)}
                            >
                              Reset
                            </Button>
                          </div>
                        </div>
                        
                        {lumpSumPayment > 0 && lumpSumPayoffInfo && standardPayoffInfo && (
                          <div className="p-4 border rounded-md bg-muted/50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">New payoff date:</span>
                              <span className="font-bold">
                                {format(lumpSumPayoffInfo.payoffDate, 'MMM yyyy')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Time saved:</span>
                              <span className="font-bold text-green-600">
                                {standardPayoffInfo.months - lumpSumPayoffInfo.months} months
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Interest saved:</span>
                              <span className="font-bold text-green-600">
                                ${(standardPayoffInfo.totalInterestPaid - lumpSumPayoffInfo.totalInterestPaid).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="additional-payment">
                    <AccordionTrigger>
                      Increase Monthly Payment
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="additional-payment">Additional monthly payment</Label>
                            <span className="text-sm text-muted-foreground">
                              ${additionalMonthlyPayment.toFixed(2)}
                            </span>
                          </div>
                          <Slider
                            id="additional-payment"
                            min={0}
                            max={standardPayoffInfo ? standardPayoffInfo.monthlyPayment * 2 : 100}
                            step={5}
                            value={[additionalMonthlyPayment]}
                            onValueChange={(values) => setAdditionalMonthlyPayment(values[0])}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>+$0</span>
                            <span>+${standardPayoffInfo ? (standardPayoffInfo.monthlyPayment * 2).toFixed(2) : '100.00'}</span>
                          </div>
                        </div>
                        
                        {showWarning && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                              This payment plan may exceed your available funds based on current account balances.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {additionalMonthlyPayment > 0 && increasedPaymentInfo && standardPayoffInfo && (
                          <div className="p-4 border rounded-md bg-muted/50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">New payoff date:</span>
                              <span className="font-bold">
                                {format(increasedPaymentInfo.payoffDate, 'MMM yyyy')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Time saved:</span>
                              <span className="font-bold text-green-600">
                                {standardPayoffInfo.months - increasedPaymentInfo.months} months
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">New monthly payment:</span>
                              <span className="font-bold">
                                ${increasedPaymentInfo.monthlyPayment.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Interest saved:</span>
                              <span className="font-bold text-green-600">
                                ${(standardPayoffInfo.totalInterestPaid - increasedPaymentInfo.totalInterestPaid).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {additionalMonthlyPayment > 0 && (
                          <Button 
                            className="w-full"
                            onClick={applyPaymentPlan}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Apply New Payment Plan
                          </Button>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-1">Select a debt to calculate your payoff timeline</p>
              <p className="text-sm text-muted-foreground">
                Only recurring unpaid bills in the "Debt" category are eligible
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6 block">
          <p className="text-sm text-muted-foreground">
            This calculator provides estimates based on current balance, interest rate, and payment amounts.
            Actual payoff times may vary depending on changes in interest rates and payment consistency.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DebtPayoffCalculator;
