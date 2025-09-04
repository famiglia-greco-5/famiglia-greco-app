import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ylrwdqpgeheiznzbhgjm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlscndkZ3BnZWhlaXpuemJoZ2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDI4NzIsImV4cCI6MjA3MjU3ODg3Mn0.SJcpHaNPBGgvlnxNC9WHZrgtMrkALeqP3IlIxX4dAUE'

export const supabase = createClient(supabaseUrl, supabaseKey) 
