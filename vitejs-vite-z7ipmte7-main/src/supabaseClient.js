import { createClient } from '@supabase/supabase-js';

// Projeto v5 (criado em jul/2026, substitui o projeto antigo pausado
// mimkuygagnsrfldluhvv que ficou órfão por mais de 90 dias).
const supabaseUrl = 'https://kbgparnhvnoiiafhenxl.supabase.co';
const supabaseAnonKey = 'sb_publishable_ozKLsnsQggiTtmkkKObgnw_ty7F-SiO';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
