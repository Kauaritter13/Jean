-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  partner_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gift lists table
CREATE TABLE IF NOT EXISTS public.gift_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gift items table
CREATE TABLE IF NOT EXISTS public.gift_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.gift_lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  product_url TEXT,
  source TEXT,
  quantity INTEGER DEFAULT 1,
  purchased_quantity INTEGER DEFAULT 0,
  is_purchased BOOLEAN DEFAULT false,
  purchased_by UUID REFERENCES auth.users(id),
  purchased_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Gift lists policies
DROP POLICY IF EXISTS "gift_lists_select" ON public.gift_lists;
DROP POLICY IF EXISTS "gift_lists_insert" ON public.gift_lists;
DROP POLICY IF EXISTS "gift_lists_update" ON public.gift_lists;
DROP POLICY IF EXISTS "gift_lists_delete" ON public.gift_lists;

CREATE POLICY "gift_lists_select" ON public.gift_lists FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "gift_lists_insert" ON public.gift_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gift_lists_update" ON public.gift_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "gift_lists_delete" ON public.gift_lists FOR DELETE USING (auth.uid() = user_id);

-- Gift items policies
DROP POLICY IF EXISTS "gift_items_select" ON public.gift_items;
DROP POLICY IF EXISTS "gift_items_insert" ON public.gift_items;
DROP POLICY IF EXISTS "gift_items_update" ON public.gift_items;
DROP POLICY IF EXISTS "gift_items_delete" ON public.gift_items;

CREATE POLICY "gift_items_select" ON public.gift_items FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.gift_lists WHERE id = gift_items.list_id AND is_public = true)
);
CREATE POLICY "gift_items_insert" ON public.gift_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gift_items_update" ON public.gift_items FOR UPDATE USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.gift_lists WHERE id = gift_items.list_id AND is_public = true)
);
CREATE POLICY "gift_items_delete" ON public.gift_items FOR DELETE USING (auth.uid() = user_id);

-- Trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
