"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session?.user?.email);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);

      // Add a small delay to ensure RLS policies are ready
      await new Promise((resolve) => setTimeout(resolve, 500));

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);

        // If profile doesn't exist, create one
        if (error.code === "PGRST116") {
          console.log("Profile not found, creating new profile...");
          await createProfile(userId);
          return;
        }

        // For other errors, set loading to false
        setLoading(false);
        return;
      }

      if (data) {
        console.log("Profile fetched successfully:", data);
        setProfile(data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      setLoading(false);
    }
  };

  const createProfile = async (userId: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const profileData = {
        id: userId,
        name: user.data.user.user_metadata?.name || "User",
        email: user.data.user.email!,
        role: user.data.user.email === "admin@fin.com" ? "admin" : "public",
      };

      console.log("Creating profile:", profileData);

      const { data, error } = await supabase
        .from("profiles")
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error("Error creating profile:", error);
        setLoading(false);
        return;
      }

      if (data) {
        console.log("Profile created successfully:", data);
        setProfile(data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error in createProfile:", error);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

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
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
