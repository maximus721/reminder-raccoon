
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiggyBank, Plus, Trash2 } from "lucide-react";
import { useFinance } from '@/contexts/FinanceContext';
import { SavingsGoal } from '@/types/finance';
import { toast } from 'sonner';

const defaultGoal = {
  name: '',
  targetAmount: 0,
  currentAmount: 0,
  category: 'General',
  deadline: null,
  notes: null,
  status: 'in-progress' as const,
  accountId: null
};

const SavingsGoalsCalculator = () => {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useFinance();
  const [newGoal, setNewGoal] = useState<Omit<SavingsGoal, 'id'>>(defaultGoal);
  const [formVisible, setFormVisible] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({
      ...prev,
      [name]: name === 'targetAmount' || name === 'currentAmount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSavingsGoal(newGoal)
      .then(() => {
        setNewGoal(defaultGoal);
        setFormVisible(false);
        toast.success('Savings goal added successfully');
      })
      .catch(error => {
        toast.error('Failed to add savings goal');
        console.error(error);
      });
  };

  const calculateProgress = (goal: SavingsGoal): number => {
    if (goal.targetAmount <= 0) return 0;
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    return Math.min(progress, 100);
  };

  const updateGoalAmount = (goal: SavingsGoal, amount: number) => {
    const newAmount = goal.currentAmount + amount;
    if (newAmount < 0) {
      toast.error("Amount can't be negative");
      return;
    }
    
    updateSavingsGoal(goal.id, { currentAmount: newAmount })
      .then(() => {
        toast.success('Goal progress updated');
        if (newAmount >= goal.targetAmount) {
          updateSavingsGoal(goal.id, { status: 'completed' });
          toast.success('🎉 Congratulations! Goal reached!');
        }
      })
      .catch(error => {
        toast.error('Failed to update goal');
        console.error(error);
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Savings Goals</h2>
        <Button 
          onClick={() => setFormVisible(!formVisible)} 
          variant={formVisible ? "secondary" : "default"}
        >
          {formVisible ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Add Goal</>}
        </Button>
      </div>

      {formVisible && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Savings Goal</CardTitle>
            <CardDescription>Set a new financial goal to work towards</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Goal Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newGoal.name}
                    onChange={handleInputChange}
                    placeholder="Vacation, Emergency Fund, etc."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={newGoal.category}
                    onChange={handleInputChange}
                    placeholder="Travel, Emergency, etc."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount ($)</Label>
                  <Input
                    id="targetAmount"
                    name="targetAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newGoal.targetAmount || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentAmount">Current Amount ($)</Label>
                  <Input
                    id="currentAmount"
                    name="currentAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newGoal.currentAmount || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Target Date (Optional)</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={newGoal.deadline || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={newGoal.notes || ''}
                    onChange={handleInputChange}
                    placeholder="Additional details"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Create Goal</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {savingsGoals.length === 0 && !formVisible ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <PiggyBank className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-medium">No savings goals yet</h3>
              <p className="text-muted-foreground mb-4">Create your first savings goal to start tracking your progress</p>
              <Button onClick={() => setFormVisible(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Goal
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savingsGoals.map((goal) => (
            <Card key={goal.id} className={goal.status === 'completed' ? 'border-green-500' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{goal.name}</CardTitle>
                    <CardDescription>{goal.category}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this goal?")) {
                        deleteSavingsGoal(goal.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress: {calculateProgress(goal).toFixed(0)}%</span>
                    <span>${goal.currentAmount.toFixed(2)} of ${goal.targetAmount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${goal.status === 'completed' ? 'bg-green-500' : 'bg-primary'}`}
                      style={{ width: `${calculateProgress(goal)}%` }}
                    ></div>
                  </div>
                </div>
                {goal.deadline && (
                  <div className="text-sm text-muted-foreground">
                    Target date: {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                )}
                {goal.notes && (
                  <div className="text-sm italic">{goal.notes}</div>
                )}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => updateGoalAmount(goal, -10)}
                  >
                    -$10
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => updateGoalAmount(goal, 10)}
                  >
                    +$10
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => updateGoalAmount(goal, 100)}
                  >
                    +$100
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavingsGoalsCalculator;
