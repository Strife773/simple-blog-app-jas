import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hnpeicjnrlpularhqfcw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhucGVpY2pucmxwdWxhcmhxZmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MTU3NDUsImV4cCI6MjA2NDI5MTc0NX0.y47N5UneR50O0kf_jFsVWE0NDXHyv8BQWYeqNMnCG0U';


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);