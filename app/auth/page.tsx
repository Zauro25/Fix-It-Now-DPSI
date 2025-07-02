"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user, profile, loading } = useAuth();
  const router = useRouter();

  // Immediate redirect when user is authenticated
  useEffect(() => {
    if (!loading && user && profile) {
      console.log("Redirecting immediately...", {
        user: user.email,
        role: profile.role,
      });

      // Try multiple redirect methods
      const targetUrl = profile.role === "admin" ? "/admin" : "/dashboard";

      // Method 1: Next.js router
      router.push(targetUrl);

      // Method 2: Fallback with window.location
      setTimeout(() => {
        if (window.location.pathname === "/auth") {
          console.log("Router.push failed, using window.location");
          window.location.href = targetUrl;
        }
      }, 500);
    }
  }, [user, profile, loading, router]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signIn(email, password);
      toast({
        title: "Berhasil masuk",
        description: "Selamat datang di FIN!",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Gagal masuk",
        description: error.message || "Terjadi kesalahan saat login",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signUp(email, password, name);
      toast({
        title: "Berhasil mendaftar",
        description: "Silakan cek email untuk verifikasi akun.",
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Gagal mendaftar",
        description: error.message || "Terjadi kesalahan saat mendaftar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRedirect = () => {
    const targetUrl = profile?.role === "admin" ? "/admin" : "/dashboard";
    console.log("Manual redirect to:", targetUrl);
    window.location.href = targetUrl;
  };

  // Don't show anything if we're in the process of redirecting
  if (!loading && user && profile) {
    return null; // This will prevent the loading screen from showing
  }

  // Show loading if auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">FIN</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Fix It Now</span>
          </div>
          <CardTitle>Selamat Datang</CardTitle>
          <CardDescription>
            Masuk atau daftar untuk melaporkan kerusakan fasilitas umum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Masuk</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Masuk"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nama Lengkap</Label>
                  <Input
                    id="signup-name"
                    name="name"
                    type="text"
                    placeholder="Nama Lengkap"
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Daftar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Emergency redirect button - only show if user is authenticated but still on auth page */}
          {user && profile && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                Sudah login tapi belum redirect? Klik tombol di bawah:
              </p>
              <Button
                onClick={handleManualRedirect}
                className="w-full"
                size="sm"
              >
                Masuk ke Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
