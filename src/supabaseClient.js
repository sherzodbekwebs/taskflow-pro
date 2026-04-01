import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL yoki Anon Key topilmadi! .env faylingizni tekshiring.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // sessionStorage ишлатиш - браузер ёпилиши билан сессияни ўчиради
    storage: window.sessionStorage, 
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true 
  }
})