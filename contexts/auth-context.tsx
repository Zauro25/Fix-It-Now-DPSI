"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

type Profile = {
  id: string
  name: string
  email: string
  role: string
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchOrCreateProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchOrCreateProfile(session.user)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchOrCreateProfile = async (user: User) => {
    try {
      // First, check if a profile already exists.
      const { data: existingProfile, error: selectError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 means no rows found, which is not an error in this case.
        throw selectError
      }

      if (existingProfile) {
        // Profile exists, just set it.
        setProfile(existingProfile)
      } else {
        // Profile doesn't exist, create it.
        // Note: user.email will not be null here because we are in a protected part of the logic
        const newUserProfile = {
          id: user.id,
          email: user.email!,
          name: user.user_metadata.name || user.email!, // Fallback to email if name is not available
          role: "user", // Default role
        }
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert(newUserProfile)
          .select()
          .single()

        if (insertError) {
          throw insertError
        }
        setProfile(newProfile)
      }
    } catch (error) {
      console.error("Error fetching or creating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    })

    if (error) throw error

    // If user is created and confirmed immediately (in development)
    if (data.user && !data.user.email_confirmed_at) {
      console.log("User created, waiting for email confirmation")
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
