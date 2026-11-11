-- =========================================================================
-- 🚀 UNLIMITED GUEST & FREE TIER CONFIGURATION FOR SUPABASE
-- Copy and run this in your Supabase Dashboard -> SQL Editor -> Click 'Run'
-- =========================================================================

-- 1. Ensure columns exist with unlimited defaults
ALTER TABLE IF EXISTS public.admin_settings 
ADD COLUMN IF NOT EXISTS free_daily_limit INTEGER NOT NULL DEFAULT 999999,
ADD COLUMN IF NOT EXISTS guest_limit INTEGER NOT NULL DEFAULT 999999,
ADD COLUMN IF NOT EXISTS plan_limits JSONB DEFAULT '{"free": 999999, "pro": 999999, "premium": 999999, "guest": 999999}'::jsonb;

-- 2. Update the primary settings record to unlimited
UPDATE public.admin_settings 
SET 
  free_daily_limit = 999999,
  guest_limit = 999999,
  plan_limits = '{"free": 999999, "pro": 999999, "premium": 999999, "guest": 999999}'::jsonb
WHERE id = 'primary';

-- 3. Set all free registered users to unlimited link creation
UPDATE public.app_users 
SET daily_request_limit = 999999 
WHERE plan = 'free' OR plan IS NULL;
