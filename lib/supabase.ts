import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ynwczlfkskiwtitwyggq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlud2N6bGZrc2tpd3RpdHd5Z2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjcxNzgsImV4cCI6MjA5NzU0MzE3OH0.MGMLT3ESwavAqTqyBhaM1fVkua5ra6ZjDtubzjx9omo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
