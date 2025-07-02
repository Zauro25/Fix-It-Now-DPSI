import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string
          title: string
          description: string
          location: string
          category: string
          priority: string
          status: string
          reporter_email: string
          reporter_phone: string | null
          assigned_to: string | null
          completion_notes: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          location: string
          category?: string
          priority?: string
          status?: string
          reporter_email: string
          reporter_phone?: string | null
          assigned_to?: string | null
          completion_notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          location?: string
          category?: string
          priority?: string
          status?: string
          reporter_email?: string
          reporter_phone?: string | null
          assigned_to?: string | null
          completion_notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
