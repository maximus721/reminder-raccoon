
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { z } from 'zod';
import { CalendarIcon, InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFinance, Bill } from '@/contexts/FinanceContext';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  amount: z.coerce.number().positive({
    message: 'Amount must be a positive number.',
  }),
  dueDate: z.date({
    required_error: 'A due date is required.',
  }),
  recurring: z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly'], {
    required_error: 'Please select a recurring option.',
  }),
  category: z.string({
    required_error: 'Please select a category.',
  }),
  notes: z.string().optional(),
  interest: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddBillFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBill?: Bill;
}

const AddBillForm: React.FC<AddBillFormProps> = ({ 
  open, 
  onOpenChange,
  editingBill 
}) => {
  const { addBill, updateBill } = useFinance();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editingBill ? {
      name: editingBill.name,
      amount: editingBill.amount,
      dueDate: new Date(editingBill.dueDate),
      recurring: editingBill.recurring,
      category: editingBill.category,
      notes: editingBill.notes || '',
      interest: editingBill.interest || undefined,
    } : {
      name: '',
      amount: 0,
      dueDate: new Date(),
      recurring: 'monthly',
      category: 'Other',
      notes: '',
      interest: undefined,
    },
  });

  // Reset form when editingBill changes or modal opens/closes
  React.useEffect(() => {
    if (open) {
      form.reset(editingBill ? {
        name: editingBill.name,
        amount: editingBill.amount,
        dueDate: new Date(editingBill.dueDate),
        recurring: editingBill.recurring,
        category: editingBill.category,
        notes: editingBill.notes || '',
        interest: editingBill.interest || undefined,
      } : {
        name: '',
        amount: 0,
        dueDate: new Date(),
        recurring: 'monthly',
        category: 'Other',
        notes: '',
        interest: undefined,
      });
    }
  }, [open, editingBill, form]);

  function onSubmit(values: FormValues) {
    const billData = {
      name: values.name,
      amount: values.amount,
      dueDate: format(values.dueDate, 'yyyy-MM-dd'),
      recurring: values.recurring,
      category: values.category,
      notes: values.notes,
      interest: values.interest,
      paid: false,
    };

    if (editingBill) {
      updateBill(editingBill.id, billData);
    } else {
      addBill(billData);
    }
    
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingBill ? 'Edit Bill' : 'Add New Bill'}</DialogTitle>
          <DialogDescription>
            {editingBill 
              ? 'Make changes to your bill here.' 
              : 'Add details for your new bill.'}
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
                    <Input placeholder="e.g. Electricity Bill" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      {...field}
                      min={0}
                      step={0.01}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recurring"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurring</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recurrence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="once">Once</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {showInterestField && (
              <FormField
                control={form.control}
                name="interest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Interest Rate (%)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 ml-1 inline-block text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-sm">
                            Annual interest rate for debt calculation (optional)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 5.99"
                        step="0.01"
                        min="0"
                        {...field}
                        value={field.value === undefined ? '' : field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Enter the annual interest rate as a percentage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional details..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">
                {editingBill ? 'Update Bill' : 'Add Bill'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBillForm;
