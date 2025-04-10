
import React, { useState, useEffect } from 'react';
import { MessageSquarePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import useLocalStorage from "@/hooks/useLocalStorage";

const feedbackFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  feedback: z.string().min(10, {
    message: "Feedback must be at least 10 characters.",
  }),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

const FeedbackBanner = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [sessionPopupShown, setSessionPopupShown] = useLocalStorage('feedback-popup-shown', false);
  const isMobile = useIsMobile();
  
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      name: "",
      email: "",
      feedback: "",
    },
  });
  
  useEffect(() => {
    // Show popup randomly during session (if not already shown this session)
    if (!sessionPopupShown) {
      const randomDelay = Math.floor(Math.random() * (180000 - 60000) + 60000); // Between 1-3 minutes
      const timer = setTimeout(() => {
        setDismissed(false); // Make sure it's visible
        setSessionPopupShown(true); // Mark as shown for this session
      }, randomDelay);
      
      return () => clearTimeout(timer);
    }
  }, [sessionPopupShown, setSessionPopupShown]);
  
  const onSubmit = async (data: FeedbackFormValues) => {
    setLoading(true);
    
    try {
      // Using a simple mailto URL to avoid exposing the email address in the frontend code
      const response = await fetch("/api/send-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send feedback");
      }
      
      toast.success("Feedback sent successfully! Thank you for your input.");
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error sending feedback:", error);
      
      // Fallback method using mailto
      const subject = encodeURIComponent("App Feedback");
      const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\nFeedback:\n${data.feedback}`);
      window.location.href = `mailto:robby72174@gmail.com?subject=${subject}&body=${body}`;
      
      toast.success("Opening email client to send feedback. Thank you!");
      form.reset();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };
  
  if (dismissed) {
    return null;
  }
  
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
      <Alert className={`
        max-w-3xl mx-4 shadow-lg border-primary/20 bg-primary/5 animate-slide-up
        ${isMobile ? 'flex flex-col p-3' : ''}
      `}>
        <div className={`${isMobile ? 'flex flex-col gap-3' : 'flex justify-between items-center'}`}>
          <AlertDescription className={`text-sm ${isMobile ? 'text-center mb-2' : 'flex-1'}`}>
            <span className="font-medium">Thank you for helping test this app.</span> Feel free to request features and give feedback!
          </AlertDescription>
          
          <div className={`${isMobile ? 'flex justify-center w-full' : 'flex items-center gap-2'}`}>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size={isMobile ? "default" : "sm"} className={isMobile ? "w-full mb-1" : "h-8"}>
                  <MessageSquarePlus className="h-4 w-4 mr-1" />
                  Send Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] max-w-[90vw] p-4">
                <DialogHeader>
                  <DialogTitle>Send Feedback</DialogTitle>
                  <DialogDescription>
                    Share your thoughts, ideas, or report issues to help improve the app.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="feedback"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Feedback</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Share your thoughts, feature requests, or report issues..."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Your feedback will help improve the app for everyone.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={loading} className={isMobile ? "w-full" : ""}>
                        {loading ? "Sending..." : "Submit Feedback"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
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

export default FeedbackBanner;
