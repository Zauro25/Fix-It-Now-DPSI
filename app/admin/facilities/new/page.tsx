"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Building2, MapPin, Calendar, AlertTriangle } from "lucide-react";
import { ProtectedRoute } from "../../../auth/protected-route";

type FacilityFormData = {
  name: string;
  description: string;
  category: string;
  location: string;
  address: string;
  latitude?: number;
  longitude?: number;
  installation_date?: string;
  maintenance_schedule: string;
  responsible_department: string;
  budget_allocated?: number;
  status: string;
};

const facilityCategories = [
  { value: "jalan", label: "Jalan Raya" },
  { value: "lampu", label: "Lampu Jalan" },
  { value: "drainase", label: "Drainase" },
  { value: "taman", label: "Taman Kota" },
  { value: "jembatan", label: "Jembatan" },
  { value: "fasilitas_umum", label: "Fasilitas Umum" },
  { value: "transportasi", label: "Transportasi Publik" },
  { value: "sanitasi", label: "Sanitasi" },
  { value: "other", label: "Lainnya" },
];

const maintenanceSchedules = [
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
  { value: "quarterly", label: "Triwulan" },
  { value: "biannual", label: "Semester" },
  { value: "annual", label: "Tahunan" },
];

const departments = [
  { value: "dpu", label: "Dinas Pekerjaan Umum" },
  { value: "dishub", label: "Dinas Perhubungan" },
  { value: "dlh", label: "Dinas Lingkungan Hidup" },
  { value: "dkp", label: "Dinas Kebersihan dan Pertamanan" },
  { value: "other", label: "Lainnya" },
];

export default function AddFacilityPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AddFacilityPageContent />
    </ProtectedRoute>
  );
}

function AddFacilityPageContent() {
  const router = useRouter();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FacilityFormData>({
    name: "",
    description: "",
    category: "",
    location: "",
    address: "",
    maintenance_schedule: "",
    responsible_department: "",
    status: "active",
  });

  const handleInputChange = (
    field: keyof FacilityFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (profile?.role !== "admin") {
      toast({
        title: "Akses Ditolak",
        description: "Anda tidak memiliki akses untuk menambah fasilitas.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("facilities").insert([
        {
          ...formData,
          created_by: profile.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Fasilitas berhasil ditambahkan.",
      });

      router.push("/government");
    } catch (error) {
      console.error("Error adding facility:", error);
      toast({
        title: "Error",
        description: "Gagal menambahkan fasilitas. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Akses Ditolak
          </h2>
          <p className="text-gray-600">
            Anda tidak memiliki akses ke halaman ini.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tambah Fasilitas Baru
            </h1>
            <p className="text-gray-600">
              Daftarkan fasilitas umum baru ke dalam sistem
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Fasilitas</CardTitle>
            <CardDescription>
              Lengkapi informasi fasilitas umum yang akan didaftarkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Fasilitas *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Contoh: Jalan Sudirman Raya"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori fasilitas" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilityCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Deskripsi detail tentang fasilitas ini..."
                  rows={3}
                />
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-semibold">Informasi Lokasi</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Lokasi/Area *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="Contoh: Kelurahan Menteng, Jakarta Pusat"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat Lengkap</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Alamat lengkap fasilitas"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "latitude",
                          Number.parseFloat(e.target.value)
                        )
                      }
                      placeholder="-6.200000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "longitude",
                          Number.parseFloat(e.target.value)
                        )
                      }
                      placeholder="106.816666"
                    />
                  </div>
                </div>
              </div>

              {/* Management Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-semibold">
                    Informasi Pengelolaan
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="installation_date">Tanggal Instalasi</Label>
                    <Input
                      id="installation_date"
                      type="date"
                      value={formData.installation_date || ""}
                      onChange={(e) =>
                        handleInputChange("installation_date", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maintenance_schedule">
                      Jadwal Pemeliharaan *
                    </Label>
                    <Select
                      value={formData.maintenance_schedule}
                      onValueChange={(value) =>
                        handleInputChange("maintenance_schedule", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jadwal pemeliharaan" />
                      </SelectTrigger>
                      <SelectContent>
                        {maintenanceSchedules.map((schedule) => (
                          <SelectItem
                            key={schedule.value}
                            value={schedule.value}
                          >
                            {schedule.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="responsible_department">
                      Dinas Penanggung Jawab *
                    </Label>
                    <Select
                      value={formData.responsible_department}
                      onValueChange={(value) =>
                        handleInputChange("responsible_department", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih dinas penanggung jawab" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget_allocated">
                      Anggaran Dialokasikan (Rp)
                    </Label>
                    <Input
                      id="budget_allocated"
                      type="number"
                      value={formData.budget_allocated || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "budget_allocated",
                          Number.parseFloat(e.target.value)
                        )
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Fasilitas"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
