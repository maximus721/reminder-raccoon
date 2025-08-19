import React, { useState, useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Layout } from '@/components/ui/layout';
import { BillPanel } from '@/components/lcars/BillPanel';
import { SummaryStrip } from '@/components/lcars/SummaryStrip';
import { Filters } from '@/components/lcars/Filters';
import { BudgetScorePanel } from '@/components/lcars/BudgetScorePanel';
import { CreditImpactSimulator } from '@/components/lcars/CreditImpactSimulator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { daysUntil } from '@/contexts/finance/utils';
import { addDays, isBefore } from 'date-fns';
import { Plus, FileText, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardV2 = () => {
  const { 
    bills, 
    loading, 
    markBillAsPaid, 
    snoozeBill 
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'next30' | 'overdue'>('all');

  // Filter bills based on search and filter criteria
  const filteredBills = useMemo(() => {
    let filtered = bills.filter(bill => 
      bill.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (activeFilter) {
      case 'next30':
        filtered = filtered.filter(bill => {
          const days = daysUntil(bill.dueDate);
          return !bill.paid && days <= 30 && days >= 0;
        });
        break;
      case 'overdue':
        filtered = filtered.filter(bill => {
          const days = daysUntil(bill.dueDate);
          return !bill.paid && days < 0;
        });
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    return filtered;
  }, [bills, searchTerm, activeFilter]);

  // Sort bills by urgency
  const sortedBills = useMemo(() => {
    return [...filteredBills].sort((a, b) => {
      const aDays = daysUntil(a.dueDate);
      const bDays = daysUntil(b.dueDate);
      
      // Paid bills go to the end
      if (a.paid && !b.paid) return 1;
      if (!a.paid && b.paid) return -1;
      if (a.paid && b.paid) return 0;
      
      // Critical bills (overdue >= 30 days) come first
      const aCritical = (a.pastDueDays || 0) >= 30;
      const bCritical = (b.pastDueDays || 0) >= 30;
      if (aCritical && !bCritical) return -1;
      if (!aCritical && bCritical) return 1;
      
      // Then sort by days until due (ascending)
      return aDays - bDays;
    });
  }, [filteredBills]);

  const handleSnooze = async (id: string, days: number) => {
    try {
      await snoozeBill(id, days);
    } catch (error) {
      console.error('Failed to snooze bill:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading financial data...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Empty state
  if (bills.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-6 py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">LCARS Financial System</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                No financial data detected. Initialize your financial tracking system by adding bills or importing existing data.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/bills">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bills
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/bills">
                  <Download className="w-4 h-4 mr-2" />
                  Import Data
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">LCARS Financial Dashboard</h1>
            <p className="text-muted-foreground">
              Advanced financial monitoring and analysis system
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-sm">
            System Online
          </Badge>
        </div>

        {/* Summary Strip */}
        <SummaryStrip bills={bills} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="bills" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bills">Bill Management</TabsTrigger>
            <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
            <TabsTrigger value="credit">Credit Simulator</TabsTrigger>
          </TabsList>

          <TabsContent value="bills" className="space-y-6">
            {/* Filters */}
            <Filters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              resultCount={filteredBills.length}
            />

            {/* Bills Grid */}
            {sortedBills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedBills.map((bill) => (
                  <BillPanel
                    key={bill.id}
                    bill={bill}
                    onMarkPaid={markBillAsPaid}
                    onSnooze={handleSnooze}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">No bills match your criteria</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or filters
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <BudgetScorePanel bills={bills} />
          </TabsContent>

          <TabsContent value="credit" className="space-y-6">
            <CreditImpactSimulator />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DashboardV2;