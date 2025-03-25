
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFinance, Account } from '@/contexts/FinanceContext';

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
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  type: z.enum(['checking', 'savings', 'credit', 'investment', 'other'], {
    required_error: 'Please select an account type.',
  }),
  balance: z.coerce.number(),
  currency: z.string().default('$'),
  color: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddAccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAccount?: Account;
}

const COLORS = [
  '#4361ee', '#3a0ca3', '#7209b7', '#f72585',
  '#4cc9f0', '#4895ef', '#560bad', '#f3722c',
  '#f8961e', '#90be6d', '#43aa8b', '#577590',
];

const AddAccountForm: React.FC<AddAccountFormProps> = ({ 
  open, 
  onOpenChange,
  editingAccount 
}) => {
  const { addAccount, updateAccount } = useFinance();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editingAccount ? {
      name: editingAccount.name,
      type: editingAccount.type,
      balance: editingAccount.balance,
      currency: editingAccount.currency,
      color: editingAccount.color,
    } : {
      name: '',
      type: 'checking',
      balance: 0,
      currency: '$',
      color: COLORS[0],
    },
  });

  function onSubmit(values: FormValues) {
    const accountData = {
      name: values.name,
      type: values.type,
      balance: values.balance,
      currency: values.currency,
      color: values.color,
    };

    if (editingAccount) {
      updateAccount(editingAccount.id, accountData);
    } else {
      addAccount(accountData);
    }
    
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
          <DialogDescription>
            {editingAccount 
              ? 'Make changes to your account here.' 
              : 'Add details for your new financial account.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Main Checking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="credit">Credit Card</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-5 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="$" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="$">$</SelectItem>
                        <SelectItem value="€">€</SelectItem>
                        <SelectItem value="£">£</SelectItem>
                        <SelectItem value="¥">¥</SelectItem>
                        <SelectItem value="₹">₹</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel>Current Balance</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field}
                        step={0.01}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Color</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-2"
                    >
                      {COLORS.map((color) => (
                        <div key={color} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={color}
                            id={color}
                            className="peer sr-only"
                          />
                          <label
                            htmlFor={color}
                            className={cn(
                              "h-6 w-6 rounded-full cursor-pointer ring-offset-background transition-all",
                              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                              "peer-data-[state=checked]:ring-2",
                            )}
                            style={{ backgroundColor: color }}
                          ></label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">
                {editingAccount ? 'Update Account' : 'Add Account'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountForm;
