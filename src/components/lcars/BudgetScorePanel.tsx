import React, { useState } from 'react';
import { Bill } from '@/types/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';

interface BudgetScorePanelProps {
  bills: Bill[];
}

export const BudgetScorePanel = ({ bills }: BudgetScorePanelProps) => {
  const [simulatedIncome, setSimulatedIncome] = useState(0);

  // Calculate monthly recurring expenses from bills
  const calculateMonthlyAmount = (amount: number, recurring: string): number => {
    switch (recurring) {
      case 'daily': return amount * 30.44; // Average days per month
      case 'weekly': return amount * 4.33; // Average weeks per month
      case 'monthly': return amount;
      case 'yearly': return amount / 12;
      default: return 0; // 'once' doesn't count as recurring
    }
  };

  const monthlyExpenses = bills
    .filter(bill => bill.recurring !== 'once')
    .reduce((sum, bill) => sum + calculateMonthlyAmount(bill.amount, bill.recurring), 0);

  // For demo purposes, estimate income as 1.5x expenses (adjust based on actual data if available)
  const estimatedMonthlyIncome = monthlyExpenses * 1.5 + simulatedIncome;
  const netMargin = estimatedMonthlyIncome - monthlyExpenses;
  const marginRatio = estimatedMonthlyIncome > 0 ? netMargin / estimatedMonthlyIncome : 0;

  // Calculate Comfort Score (0-100)
  const calculateComfortScore = (ratio: number): number => {
    if (ratio >= 0.20) return Math.min(100, 85 + (ratio - 0.20) * 75); // Very Comfortable: 85-100
    if (ratio >= 0.10) return 70 + (ratio - 0.10) * 140; // Comfortable: 70-84
    if (ratio >= 0) return 50 + ratio * 200; // Tight: 50-69
    return Math.max(0, 50 + ratio * 125); // Overextended: 0-49
  };

  const comfortScore = Math.round(calculateComfortScore(marginRatio));

  const getScoreLabel = (score: number): string => {
    if (score >= 85) return 'Very Comfortable';
    if (score >= 70) return 'Comfortable';
    if (score >= 50) return 'Tight';
    return 'Overextended';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number): string => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const simulateIncomeChange = (amount: number) => {
    const newIncome = estimatedMonthlyIncome + amount;
    const newMargin = newIncome - monthlyExpenses;
    const newRatio = newIncome > 0 ? newMargin / newIncome : 0;
    return Math.round(calculateComfortScore(newRatio));
  };

  const simulationAmounts = [100, 250, 500];

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Budget Comfort Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Score Display */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <div className={`text-4xl font-bold font-mono ${getScoreColor(comfortScore)}`}>
              {comfortScore}
            </div>
            <Badge 
              className={`text-sm px-3 py-1 ${getScoreColor(comfortScore)} bg-transparent border`}
              variant="outline"
            >
              {getScoreLabel(comfortScore)}
            </Badge>
          </div>
          
          <div className="w-full">
            <Progress 
              value={comfortScore} 
              className="h-3"
              style={{
                background: `linear-gradient(to right, ${getProgressColor(comfortScore)} ${comfortScore}%, hsl(var(--muted)) ${comfortScore}%)`
              }}
            />
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-muted-foreground">Monthly Income</span>
            <p className="font-mono text-lg text-green-600">
              ${estimatedMonthlyIncome.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Monthly Expenses</span>
            <p className="font-mono text-lg text-red-600">
              ${monthlyExpenses.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Net Margin</span>
            <p className={`font-mono text-lg ${netMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netMargin.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Scenario Simulation */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            What improves my score?
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {simulationAmounts.map((amount) => {
              const newScore = simulateIncomeChange(amount);
              const improvement = newScore - comfortScore;
              return (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-2 transition-all duration-200 hover:shadow-md"
                  onClick={() => setSimulatedIncome(amount)}
                >
                  <span className="text-xs text-muted-foreground">+${amount}</span>
                  <span className="font-mono text-sm">
                    {newScore}
                  </span>
                  {improvement > 0 && (
                    <span className="text-xs text-green-600">
                      +{improvement}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
          {simulatedIncome > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSimulatedIncome(0)}
              className="text-xs"
            >
              Reset simulation
            </Button>
          )}
        </div>

        {/* Tips */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Tips to improve your score:
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
            <li>Increase recurring income sources</li>
            <li>Reduce or eliminate non-essential recurring expenses</li>
            <li>Negotiate better rates on existing bills</li>
            <li>Consider consolidating high-interest debt</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};