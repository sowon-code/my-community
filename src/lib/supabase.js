import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 아이디를 Supabase Auth 이메일 형식으로 변환
export const toEmail = (username) => `${username}@lovecommunity.site`
