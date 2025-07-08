"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
                <Skeleton className="h-6 w-20 md:ml-auto" />
                <Skeleton className="h-10 w-full md:col-span-2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
                <Skeleton className="h-6 w-20 md:ml-auto" />
                <Skeleton className="h-10 w-full md:col-span-2" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end bg-secondary/50 py-3 px-6 rounded-b-lg">
            <Skeleton className="h-10 w-28" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <p>You must be logged in to view this page.</p>
        {/* Optionally, add a link to your login page */}
      </div>
    );
  }

  const userDisplayName = user.user_metadata?.name || user.email;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">My Account</CardTitle>
          <CardDescription>Manage your profile and settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.user_metadata?.avatar_url} alt={userDisplayName || ''} data-ai-hint="person face" />
              <AvatarFallback>{userDisplayName?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Photo</Button>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
                <Label htmlFor="name" className="md:text-right">Name</Label>
                <Input id="name" defaultValue={userDisplayName} className="md:col-span-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
                <Label htmlFor="email" className="md:text-right">Email Address</Label>
                <Input id="email" type="email" defaultValue={user.email} className="md:col-span-2" disabled />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end bg-secondary/50 py-3 px-6 rounded-b-lg">
            <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
    