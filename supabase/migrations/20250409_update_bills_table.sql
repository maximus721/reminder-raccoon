
-- Add new columns to the bills table for snoozing and past due tracking
ALTER TABLE IF EXISTS public.bills 
ADD COLUMN IF NOT EXISTS snoozed_until DATE,
ADD COLUMN IF NOT EXISTS original_due_date DATE,
ADD COLUMN IF NOT EXISTS past_due_days INTEGER DEFAULT 0;

-- Comment on columns
COMMENT ON COLUMN public.bills.snoozed_until IS 'Date until which the bill payment is snoozed';
COMMENT ON COLUMN public.bills.original_due_date IS 'Original due date before any snoozing was applied';
COMMENT ON COLUMN public.bills.past_due_days IS 'Number of days the bill is past due';
