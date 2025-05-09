
import React from 'react';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DebtPayoffCalculator from '@/components/DebtPayoffCalculator';
import SavingsGoalsCalculator from '@/components/SavingsGoalsCalculator';

const PaymentGoals = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Payment Goals</h1>
          <p className="text-muted-foreground">Plan and track your debt payoff and savings goals</p>
        </div>
        
        <Tabs defaultValue="debt-payoff" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="debt-payoff">Debt Payoff Calculator</TabsTrigger>
            <TabsTrigger value="savings-goals">Savings Goals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="debt-payoff" className="mt-6">
            <DebtPayoffCalculator />
          </TabsContent>
          
          <TabsContent value="savings-goals" className="mt-6">
            <SavingsGoalsCalculator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PaymentGoals;
