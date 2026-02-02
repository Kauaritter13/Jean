-- Migration: Add public purchase support
-- Date: 2026-02-02

-- Add purchased_by_name column to gift_items table
ALTER TABLE public.gift_items 
ADD COLUMN IF NOT EXISTS purchased_by_name TEXT;

-- Add purchased_by_cpf column to gift_items table (stores only digits for security)
ALTER TABLE public.gift_items 
ADD COLUMN IF NOT EXISTS purchased_by_cpf TEXT;

-- Update the gift_items_update policy to allow public purchases
DROP POLICY IF EXISTS "gift_items_update" ON public.gift_items;

CREATE POLICY "gift_items_update" ON public.gift_items FOR UPDATE USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.gift_lists WHERE id = gift_items.list_id AND is_public = true)
);

-- Add comments to explain the new columns
COMMENT ON COLUMN public.gift_items.purchased_by_name IS 'Name of the person who purchased this item (for public lists without authentication)';

COMMENT ON COLUMN public.gift_items.purchased_by_cpf IS 'CPF (only digits) of the person who purchased this item - used for security to prevent others from unmarking';
