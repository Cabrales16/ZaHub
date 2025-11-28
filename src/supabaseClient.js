import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ggmkjjpmjizdtxmvhxdr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbWtqanBtaml6ZHR4bXZoeGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzU3NjAsImV4cCI6MjA3OTg1MTc2MH0.-LPmhgaNQBn9lfkt3qUi8Ms9INLm0gMuuu6de5wd4HU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
