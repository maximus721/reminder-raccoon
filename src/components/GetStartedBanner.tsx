
import React, { useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

const GetStartedBanner = () => {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isMobile = useIsMobile();
  
  if (dismissed) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center">
      <Alert className={`
        max-w-3xl mx-4 shadow-lg border-primary/20 bg-primary/5 animate-slide-up
        ${isMobile ? 'flex flex-col p-3' : ''}
      `}>
        <div className={`${isMobile ? 'flex flex-col gap-3' : 'flex justify-between items-center'}`}>
          <AlertDescription className={`text-sm ${isMobile ? 'text-center mb-2' : 'flex-1'}`}>
            <span className="font-medium">🚀 New here?</span> Check out our quick start guide to supercharge your financial journey!
          </AlertDescription>
          
          <div className={`${isMobile ? 'flex justify-center w-full' : 'flex items-center gap-2'}`}>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size={isMobile ? "default" : "sm"} className={isMobile ? "w-full mb-1" : "h-8"}>
                  <BookOpen className="h-4 w-4 mr-1" />
                  Getting Started
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[650px] max-h-[80vh] max-w-[90vw] p-4">
                <DialogHeader>
                  <DialogTitle className="text-xl">Welcome to Fintrack - Your Financial Companion</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-6 pt-2">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">What can you do with Fintrack?</h3>
                      <p className="text-muted-foreground mt-1">
                        Fintrack helps you monitor and manage your finances in one place, making it easier to stay on top of your financial life.
                      </p>
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="rounded-lg border p-4 bg-card">
                        <h4 className="font-medium flex items-center text-primary mb-2">
                          <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary items-center justify-center mr-2 text-xs">1</span>
                          Dashboard Overview
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Your dashboard provides at-a-glance insights into your accounts, upcoming bills, and overall financial health.
                        </p>
                      </div>
                      
                      <div className="rounded-lg border p-4 bg-card">
                        <h4 className="font-medium flex items-center text-primary mb-2">
                          <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary items-center justify-center mr-2 text-xs">2</span>
                          Account Management
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Add and track multiple accounts - checking, savings, credit cards, and more. Monitor balances and transaction history.
                        </p>
                      </div>
                      
                      <div className="rounded-lg border p-4 bg-card">
                        <h4 className="font-medium flex items-center text-primary mb-2">
                          <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary items-center justify-center mr-2 text-xs">3</span>
                          Bill Tracking
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Never miss a payment again. Set up bills with due dates and get alerts for upcoming and overdue payments.
                        </p>
                      </div>
                      
                      <div className="rounded-lg border p-4 bg-card">
                        <h4 className="font-medium flex items-center text-primary mb-2">
                          <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary items-center justify-center mr-2 text-xs">4</span>
                          Payment Calendar
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Visualize your financial obligations throughout the month with a calendar view of all upcoming payments.
                        </p>
                      </div>
                      
                      <div className="rounded-lg border p-4 bg-card">
                        <h4 className="font-medium flex items-center text-primary mb-2">
                          <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary items-center justify-center mr-2 text-xs">5</span>
                          Payment Goals
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Set financial goals and track your progress toward achieving them. Celebrate your financial wins!
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-primary mt-4">Pro Tips</h3>
                      <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-muted-foreground">
                        <li>
                          <strong>Mark bills as paid</strong> to keep track of what you've already handled.
                        </li>
                        <li>
                          <strong>Use the calendar view</strong> to plan for financially tight periods.
                        </li>
                        <li>
                          <strong>Update your account balances regularly</strong> for accurate financial insights.
                        </li>
                        <li>
                          <strong>Check the dashboard</strong> daily to stay on top of urgent bills.
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mt-4">
                      <h4 className="font-medium text-primary">We'd love your feedback!</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        This app is continuously improving. If you have suggestions or spot issues, please use the feedback button to let us know.
                      </p>
                    </div>
                  </div>
                </ScrollArea>
                <div className="flex justify-center mt-4">
                  <Button onClick={() => setOpen(false)} className={isMobile ? "w-full" : ""}>Get Started</Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default GetStartedBanner;
