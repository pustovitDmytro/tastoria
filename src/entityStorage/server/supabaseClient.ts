import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '~/config';

export function createSupabaseClient(env): SupabaseClient {
    const { url, serviceKey } = getSupabaseConfig(env);

    return createClient(url, serviceKey, {
        auth : { persistSession: false, autoRefreshToken: false }
    });
}
