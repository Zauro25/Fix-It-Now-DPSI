"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Upload,
  MapPin,
  AlertCircle,
  Phone,
  FileText,
} from "lucide-react";
import Link from "next/link";

const categories = [
  { value: "jalan", label: "Jalan Raya", icon: "🛣️" },
  { value: "lampu", label: "Lampu Jalan", icon: "💡" },
  { value: "drainase", label: "Drainase", icon: "🌊" },
  { value: "taman", label: "Taman Kota", icon: "🌳" },
  { value: "jembatan", label: "Jembatan", icon: "🌉" },
  { value: "fasilitas_umum", label: "Fasilitas Umum", icon: "🏢" },
  { value: "other", label: "Lainnya", icon: "📋" },
];

const priorities = [
  {
    value: "low",
    label: "Rendah",
    color: "text-green-600",
    description: "Tidak mendesak, bisa ditangani nanti",
  },
  {
    value: "medium",
    label: "Sedang",
    color: "text-yellow-600",
    description: "Perlu perhatian dalam waktu dekat",
  },
  {
    value: "high",
    label: "Tinggi",
    color: "text-red-600",
    description: "Mendesak, perlu segera ditangani",
  },
];

export default function NewReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    priority: "",
    reporter_phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Judul laporan harus diisi";
    } else if (formData.title.length < 10) {
      newErrors.title = "Judul laporan minimal 10 karakter";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Deskripsi kerusakan harus diisi";
    } else if (formData.description.length < 20) {
      newErrors.description =
        "Deskripsi minimal 20 karakter untuk memberikan detail yang cukup";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Lokasi harus diisi";
    }

    if (!formData.category) {
      newErrors.category = "Kategori harus dipilih";
    }

    if (!formData.priority) {
      newErrors.priority = "Prioritas harus dipilih";
    }

    if (
      formData.reporter_phone &&
      !/^(\+62|62|0)[0-9]{9,13}$/.test(
        formData.reporter_phone.replace(/\s/g, "")
      )
    ) {
      newErrors.reporter_phone = "Format nomor telepon tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "Anda harus login terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Form tidak valid",
        description: "Mohon periksa kembali data yang Anda masukkan",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const reportData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      category: formData.category,
      priority: formData.priority,
      reporter_email: user.email!,
      reporter_phone: formData.reporter_phone.trim() || null,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from("reports")
        .insert([reportData])
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      toast({
        title: "Laporan berhasil dibuat! 🎉",
        description:
          "Laporan Anda telah dikirim dan menunggu konfirmasi admin. Kami akan segera menindaklanjuti laporan Anda.",
      });

      // Redirect to reports page to see the new report
      router.push("/reports");
    } catch (error: any) {
      console.error("Error creating report:", error);
      toast({
        title: "Gagal membuat laporan",
        description:
          error.message ||
          "Terjadi kesalahan saat menyimpan laporan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Buat Laporan Baru
            </h1>
            <p className="text-gray-600">
              Laporkan kerusakan fasilitas umum yang Anda temukan
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  Tips untuk laporan yang efektif:
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Berikan judul yang jelas dan spesifik</li>
                  <li>Jelaskan kerusakan secara detail</li>
                  <li>Cantumkan lokasi yang tepat dan mudah ditemukan</li>
                  <li>Pilih kategori dan prioritas yang sesuai</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Informasi Laporan
                  </CardTitle>
                  <CardDescription>
                    Isi informasi dasar tentang kerusakan yang Anda temukan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Judul Laporan *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Contoh: Jalan berlubang besar di depan SD Negeri 01"
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600">{errors.title}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formData.title.length}/100 karakter (minimal 10 karakter)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi Kerusakan *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Jelaskan kerusakan secara detail: ukuran, kondisi, dampak yang ditimbulkan, dll."
                      className={`min-h-[120px] ${
                        errors.description ? "border-red-500" : ""
                      }`}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formData.description.length}/500 karakter (minimal 20
                      karakter)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Lokasi *
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="Contoh: Jl. Sudirman No. 123, Kelurahan ABC, Kecamatan XYZ"
                      className={errors.location ? "border-red-500" : ""}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-600">{errors.location}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Berikan alamat yang spesifik agar mudah ditemukan
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kategori & Prioritas</CardTitle>
                  <CardDescription>
                    Pilih kategori dan tingkat prioritas kerusakan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori Kerusakan *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.category ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Pilih kategori kerusakan" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            <div className="flex items-center space-x-2">
                              <span>{category.icon}</span>
                              <span>{category.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Tingkat Prioritas *</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        handleInputChange("priority", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.priority ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Pilih tingkat prioritas" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
                            <div className="space-y-1">
                              <div className={`font-medium ${priority.color}`}>
                                {priority.label}
                              </div>
                              <div className="text-xs text-gray-600">
                                {priority.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.priority && (
                      <p className="text-sm text-red-600">{errors.priority}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Kontak
                  </CardTitle>
                  <CardDescription>
                    Informasi kontak untuk follow-up
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reporter_phone">
                      Nomor Telepon (Opsional)
                    </Label>
                    <Input
                      id="reporter_phone"
                      type="tel"
                      value={formData.reporter_phone}
                      onChange={(e) =>
                        handleInputChange("reporter_phone", e.target.value)
                      }
                      placeholder="08xxxxxxxxxx"
                      className={errors.reporter_phone ? "border-red-500" : ""}
                    />
                    {errors.reporter_phone && (
                      <p className="text-sm text-red-600">
                        {errors.reporter_phone}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Untuk memudahkan komunikasi jika diperlukan
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> {user?.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Notifikasi akan dikirim ke email ini
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Foto Kerusakan
                  </CardTitle>
                  <CardDescription>
                    Upload foto untuk memperjelas laporan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Klik untuk upload foto
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG hingga 10MB
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      (Fitur akan segera tersedia)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full sm:w-auto bg-transparent"
                  >
                    Batal
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Mengirim Laporan...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Kirim Laporan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
