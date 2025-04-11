
import React, { useState, useEffect } from 'react';
import { MessageSquarePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
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
import { useLanguage } from "@/i18n/context";
import { useTheme } from "@/theme/ThemeContext";

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
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      name: "",
      email: "",
      feedback: "",
    },
  });
  
  useEffect(() => {
    if (!sessionPopupShown) {
      const randomDelay = Math.floor(Math.random() * (180000 - 60000) + 60000);
      const timer = setTimeout(() => {
        setDismissed(false);
        setSessionPopupShown(true);
      }, randomDelay);
      
      return () => clearTimeout(timer);
    }
  }, [sessionPopupShown, setSessionPopupShown]);
  
  const onSubmit = async (data: FeedbackFormValues) => {
    setLoading(true);
    
    try {
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
      
      toast.success(t('feedbackSuccess'));
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error sending feedback:", error);
      
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
        max-w-3xl mx-4 shadow-lg border-primary/20 
        ${resolvedTheme === 'dark' ? 'bg-[hsl(var(--banner-bg))] text-[hsl(var(--banner-text))]' : 'bg-[#D3E4FD]'}
        animate-slide-up
        ${isMobile ? 'flex flex-col p-3' : ''}
      `}>
        <div className={`${isMobile ? 'flex flex-col gap-3' : 'flex justify-between items-center'}`}>
          <AlertDescription className={`text-sm ${resolvedTheme === 'dark' ? 'text-[hsl(var(--banner-text))]' : 'text-foreground'} ${isMobile ? 'text-center mb-2' : 'flex-1'}`}>
            <span className="font-medium">{t('thankYou')}</span> {t('requestFeatures')}
          </AlertDescription>
          
          <div className={`${isMobile ? 'flex justify-center w-full' : 'flex items-center gap-2'}`}>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size={isMobile ? "default" : "sm"} className={isMobile ? "w-full mb-1" : "h-8"}>
                  <MessageSquarePlus className="h-4 w-4 mr-1" />
                  {t('sendFeedback')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] max-w-[90vw] p-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('yourName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('yourName')} {...field} />
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
                          <FormLabel>{t('yourEmail')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('yourEmail')} type="email" {...field} />
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
                          <FormLabel>{t('feedback')}</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={t('feedbackPlaceholder')}
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            {t('feedbackHelp')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={loading} className={isMobile ? "w-full" : ""}>
                        {loading ? t('submitting') : t('submit')}
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
