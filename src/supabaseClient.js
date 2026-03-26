import { createClient } from '@supabase/supabase-js'

// Vite ishlatayotganingiz uchun import.meta.env orqali kalitlarni olamiz
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Agar kalitlar topilmasa, xatolik berishi uchun tekshiruv
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL yoki Anon Key topilmadi! .env faylingizni tekshiring.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)