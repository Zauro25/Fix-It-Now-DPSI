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
      console.log("Initial session:", session?.user?.email)
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
      console.log("Auth state changed:", event, session?.user?.email)

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
      console.log("Fetching profile for user:", user.id)

      // First, try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (existingProfile && !fetchError) {
        console.log("Profile found:", existingProfile)
        setProfile(existingProfile)
        setLoading(false)
        return
      }

      // If profile doesn't exist, create it using the function
      console.log("Profile not found, creating new profile...")

      const { data: functionResult, error: functionError } = await supabase.rpc("create_user_profile", {
        user_id: user.id,
        user_email: user.email!,
        user_name: user.user_metadata?.name || null,
      })

      if (functionError) {
        console.error("Error calling create_user_profile function:", functionError)
        // Fallback: try direct insert
        await createProfileDirectly(user)
        return
      }

      if (functionResult?.error) {
        console.error("Function returned error:", functionResult)
        await createProfileDirectly(user)
        return
      }

      console.log("Profile created via function:", functionResult)
      setProfile(functionResult)
      setLoading(false)
    } catch (error) {
      console.error("Error in fetchOrCreateProfile:", error)
      // Last resort: try direct creation
      await createProfileDirectly(user)
    }
  }

  const createProfileDirectly = async (user: User) => {
    try {
      const profileData = {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        email: user.email!,
        role: user.email === "admin@fin.com" ? "admin" : "public",
      }

      console.log("Creating profile directly:", profileData)

      const { data, error } = await supabase.from("profiles").insert([profileData]).select().single()

      if (error) {
        console.error("Error creating profile directly:", error)
        setLoading(false)
        return
      }

      if (data) {
        console.log("Profile created directly:", data)
        setProfile(data)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error in createProfileDirectly:", error)
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
    // Sign up without automatic confirmation
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        // Disable email confirmation for development
        emailRedirectTo: undefined,
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