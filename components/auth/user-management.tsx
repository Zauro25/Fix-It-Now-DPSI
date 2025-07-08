"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Loader2, Users } from "lucide-react";

type Profile = {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  created_at: string;
};

export function UserManagement() {
  const { profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    name: "",
    role: "public",
    department: "none",
  });

  useEffect(() => {
    if (profile?.role === "admin") {
      fetchProfiles();
    }
  }, [profile]);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setProfiles(data);
    }
    setLoading(false);
  };

  const createUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.name) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    try {
      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            name: newUser.name,
            role: newUser.role,
            department: newUser.department,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // The profile will be created automatically by the trigger
        // But we can also manually ensure it's created with the right data
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: authData.user.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department === "none" ? null : newUser.department,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }

        toast({
          title: "Berhasil",
          description: `User ${newUser.name} berhasil dibuat.`,
        });

        // Reset form
        setNewUser({
          email: "",
          password: "",
          name: "",
          role: "public",
          department: "none",
        });

        // Refresh profiles list
        fetchProfiles();
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal membuat user.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Role user berhasil diperbarui.",
      });

      fetchProfiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui role.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800 border-red-200",
      goverment: "bg-purple-100 text-purple-800 border-purple-200",
      technician: "bg-blue-100 text-blue-800 border-blue-200",
      public: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[role as keyof typeof colors] || colors.public;
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: "Administrator",
      goverment: "Pemerintah",
      technician: "Teknisi",
      public: "Public User",
    };
    return labels[role as keyof typeof labels] || role;
  };

  if (profile?.role !== "admin") {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Akses Ditolak
          </h3>
          <p className="text-gray-600">
            Anda tidak memiliki akses ke manajemen user.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Buat User Baru</span>
          </CardTitle>
          <CardDescription>
            Tambahkan user baru ke sistem dengan role yang sesuai
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                placeholder="Nama lengkap user"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public User</SelectItem>
                  <SelectItem value="technician">Teknisi</SelectItem>
                  <SelectItem value="goverment">Pemerintah</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departemen (Opsional)</Label>
              <Select
                value={newUser.department}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, department: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih departemen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada</SelectItem>
                  <SelectItem value="dpu">Dinas Pekerjaan Umum</SelectItem>
                  <SelectItem value="dishub">Dinas Perhubungan</SelectItem>
                  <SelectItem value="dlh">Dinas Lingkungan Hidup</SelectItem>
                  <SelectItem value="dkp">
                    Dinas Kebersihan dan Pertamanan
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={createUser}
              disabled={creating}
              className="w-full md:w-auto"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Membuat User...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Buat User
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Daftar User</span>
          </CardTitle>
          <CardDescription>
            Kelola semua user yang terdaftar di sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada user
              </h3>
              <p className="text-gray-600">
                Mulai dengan membuat user pertama.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {profiles.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {user.name}
                        </h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.department && (
                          <p className="text-xs text-gray-500">
                            Departemen: {user.department}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {getRoleLabel(user.role)}
                    </div>
                    <Select
                      value={user.role}
                      onValueChange={(value) => updateUserRole(user.id, value)}
                      disabled={user.id === profile?.id} // Can't change own role
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="technician">Teknisi</SelectItem>
                        <SelectItem value="goverment">Pemerintah</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
