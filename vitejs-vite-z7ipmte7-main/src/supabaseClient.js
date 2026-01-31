import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mimkuygagnsrfldluhvv.supabase.co';
const supabaseAnonKey = 'sb_publishable_THAO7aUXwEbQEHoaA52p7Q_SKV1kEoR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
