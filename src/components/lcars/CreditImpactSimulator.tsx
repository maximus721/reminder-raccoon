import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface SimulationResult {
  scenario: string;
  direction: 'up' | 'down' | 'neutral';
  shortTerm: { min: number; max: number };
  longTerm?: { min: number; max: number };
  description: string;
}

export const CreditImpactSimulator = () => {
  const [currentScore, setCurrentScore] = useState(720);
  const [onTimePercent, setOnTimePercent] = useState([95]);
  const [utilization, setUtilization] = useState([25]);
  const [openAccounts, setOpenAccounts] = useState(8);
  const [creditAge, setCreditAge] = useState(5);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const calculateImpact = (scenario: string): SimulationResult => {
    const baseScore = currentScore;
    const onTime = onTimePercent[0];
    const util = utilization[0];

    switch (scenario) {
      case 'missed-payment':
        return {
          scenario: 'Miss One Payment',
          direction: 'down',
          shortTerm: { min: 30, max: 90 },
          longTerm: { min: 10, max: 30 },
          description: 'Payment history is 35% of your score. Recovery takes 3-6 months with perfect payments.'
        };

      case 'reduce-utilization':
        const utilizationReduction = Math.min(util, 10);
        const impact = Math.round(utilizationReduction * 2); // Rough estimate
        return {
          scenario: 'Reduce Utilization by 10%',
          direction: 'up',
          shortTerm: { min: Math.max(5, impact - 5), max: impact + 10 },
          description: 'Utilization is 30% of your score. Lower utilization shows better credit management.'
        };

      case 'continue-ontime-6mo':
        const onTimeBonus = onTime < 95 ? 15 : 8;
        return {
          scenario: '6 Months Perfect Payments',
          direction: 'up',
          shortTerm: { min: 5, max: onTimeBonus },
          longTerm: { min: 10, max: 25 },
          description: 'Consistent payment history builds trust. Greater impact if currently below 95% on-time.'
        };

      case 'continue-ontime-12mo':
        const yearBonus = onTime < 90 ? 35 : onTime < 95 ? 25 : 15;
        return {
          scenario: '12 Months Perfect Payments',
          direction: 'up',
          shortTerm: { min: 10, max: Math.round(yearBonus * 0.6) },
          longTerm: { min: Math.round(yearBonus * 0.8), max: yearBonus },
          description: 'Long-term consistency shows reliability. Larger improvements for those rebuilding credit.'
        };

      case 'open-new-account':
        return {
          scenario: 'Open New Credit Account',
          direction: 'down',
          shortTerm: { min: 5, max: 15 },
          longTerm: { min: 0, max: 5 },
          description: 'Hard inquiry and lower average account age. Impact lessens over time.'
        };

      default:
        return {
          scenario: 'No Change',
          direction: 'neutral',
          shortTerm: { min: 0, max: 0 },
          description: 'Maintain current credit behaviors.'
        };
    }
  };

  const scenarios = [
    'missed-payment',
    'reduce-utilization',
    'continue-ontime-6mo',
    'continue-ontime-12mo',
    'open-new-account'
  ];

  const getScoreColor = (score: number): string => {
    if (score >= 800) return 'text-green-600';
    if (score >= 740) return 'text-blue-600';
    if (score >= 670) return 'text-yellow-600';
    if (score >= 580) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 800) return 'Excellent';
    if (score >= 740) return 'Very Good';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
  };

  const currentResult = selectedScenario ? calculateImpact(selectedScenario) : null;

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Credit Impact Simulator
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="w-4 h-4" />
          Educational estimate only - not a real FICO calculation
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Score Display */}
        <div className="text-center space-y-2">
          <div className={`text-3xl font-bold font-mono ${getScoreColor(currentScore)}`}>
            {currentScore}
          </div>
          <Badge variant="outline" className={getScoreColor(currentScore)}>
            {getScoreLabel(currentScore)}
          </Badge>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="credit-score">Current Credit Score</Label>
            <Input
              id="credit-score"
              type="number"
              min="300"
              max="850"
              value={currentScore}
              onChange={(e) => setCurrentScore(Number(e.target.value))}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="open-accounts">Open Accounts</Label>
            <Input
              id="open-accounts"
              type="number"
              min="0"
              max="50"
              value={openAccounts}
              onChange={(e) => setOpenAccounts(Number(e.target.value))}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label>On-Time Payment % (24 months): {onTimePercent[0]}%</Label>
            <Slider
              value={onTimePercent}
              onValueChange={setOnTimePercent}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Credit Utilization: {utilization[0]}%</Label>
            <Slider
              value={utilization}
              onValueChange={setUtilization}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-age">Average Credit Age (years)</Label>
            <Input
              id="credit-age"
              type="number"
              min="0"
              max="50"
              value={creditAge}
              onChange={(e) => setCreditAge(Number(e.target.value))}
              className="font-mono"
            />
          </div>
        </div>

        {/* Scenario Buttons */}
        <div className="space-y-3">
          <Label>Simulate Credit Scenarios:</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {scenarios.map((scenario) => {
              const result = calculateImpact(scenario);
              return (
                <Button
                  key={scenario}
                  variant={selectedScenario === scenario ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedScenario(scenario)}
                  className="justify-start h-auto py-2 px-3"
                >
                  <div className="flex items-center gap-2 w-full">
                    {result.direction === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {result.direction === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    <span className="text-sm">{result.scenario}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Results Display */}
        {currentResult && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              {currentResult.direction === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
              {currentResult.direction === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
              Impact: {currentResult.scenario}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Short-term (1-3 months):</span>
                <p className={`font-mono ${
                  currentResult.direction === 'up' ? 'text-green-600' : 
                  currentResult.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {currentResult.direction === 'up' && '+'}
                  {currentResult.direction === 'down' && '-'}
                  {currentResult.shortTerm.min} to {currentResult.shortTerm.max} points
                </p>
              </div>
              
              {currentResult.longTerm && (
                <div>
                  <span className="text-muted-foreground">Long-term (6-12 months):</span>
                  <p className={`font-mono ${
                    currentResult.direction === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {currentResult.direction === 'up' && '+'}
                    {currentResult.direction === 'down' && '-'}
                    {currentResult.longTerm.min} to {currentResult.longTerm.max} points
                  </p>
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              {currentResult.description}
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="w-4 h-4" />
            Important Disclaimer
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            This simulator provides educational estimates only and is not affiliated with FICO or any credit bureau. 
            Actual credit score changes depend on many factors and may vary significantly from these projections.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};