import { supabaseAdmin } from './supabase';

export interface PlanLimits {
  free: number;
  pro: number;
  premium: number;
  guest: number;
}

export const DEFAULT_PLAN_LIMITS: PlanLimits = {
  free: 5,
  pro: 50,
  premium: 99999,
  guest: 5,
};

// In-memory sliding cache for high performance
let cachedLimits: PlanLimits = { ...DEFAULT_PLAN_LIMITS };
let cacheTimestamp = 0;
const CACHE_TTL_MS = 15000; // 15 seconds

/**
 * Fetch current live plan limits from Supabase admin_settings with resilient fallback
 */
export async function getPlanLimits(): Promise<PlanLimits> {
  const now = Date.now();
  if (now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedLimits;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      // Support dedicated columns or JSONB plan_limits
      const free = typeof data.free_daily_limit === 'number' 
        ? data.free_daily_limit 
        : (typeof data.plan_limits?.free === 'number' ? data.plan_limits.free : DEFAULT_PLAN_LIMITS.free);

      const pro = typeof data.pro_daily_limit === 'number' 
        ? data.pro_daily_limit 
        : (typeof data.plan_limits?.pro === 'number' ? data.plan_limits.pro : DEFAULT_PLAN_LIMITS.pro);

      const premium = typeof data.premium_daily_limit === 'number' 
        ? data.premium_daily_limit 
        : (typeof data.plan_limits?.premium === 'number' ? data.plan_limits.premium : DEFAULT_PLAN_LIMITS.premium);

      const guest = typeof data.guest_limit === 'number' 
        ? data.guest_limit 
        : (typeof data.plan_limits?.guest === 'number' ? data.plan_limits.guest : DEFAULT_PLAN_LIMITS.guest);

      cachedLimits = { free, pro, premium, guest };
      cacheTimestamp = now;
      return cachedLimits;
    }
  } catch (err) {
    console.warn('Using default plan limits due to fetch issue:', err);
  }

  return cachedLimits;
}

/**
 * Invalidate in-memory cache so updates take effect immediately
 */
export function invalidatePlanLimitsCache(): void {
  cacheTimestamp = 0;
}
