"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = "/auth",
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If no user, redirect to auth
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // If user exists but no profile yet, wait a bit
      if (!profile) {
        return;
      }

      // If specific roles are required, check them
      if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
        // Redirect based on user's actual role
        const roleRedirects = {
          admin: "/admin",
          technician: "/technician",
          goverment: "/goverment",
          public: "/dashboard",
        };

        const targetRoute =
          roleRedirects[profile.role as keyof typeof roleRedirects] ||
          "/dashboard";
        router.push(targetRoute);
        return;
      }
    }
  }, [user, profile, loading, router, allowedRoles, redirectTo]);

  // Show loading while checking auth
  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  // If role check fails, don't render anything (redirect will happen)
  if (
    allowedRoles.length > 0 &&
    profile &&
    !allowedRoles.includes(profile.role)
  ) {
    return null;
  }

  return <>{children}</>;
}
