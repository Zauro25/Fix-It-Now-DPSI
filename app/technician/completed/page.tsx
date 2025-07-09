"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Search,
  MapPin,
  Calendar,
  Eye,
  Award,
} from "lucide-react";
import { ProtectedRoute } from "../../auth/protected-route";

type Report = {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  reporter_email: string;
};

export default function TechnicianCompletedPage() {
  return (
    <ProtectedRoute allowedRoles={["technician"]}>
      <TechnicianCompletedContent />
    </ProtectedRoute>
  );
}

function TechnicianCompletedContent() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (profile?.role === "technician") {
      fetchCompletedTasks();
    }
  }, [profile]);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm]);

  const fetchCompletedTasks = async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("assigned_to", profile.id)
      .eq("status", "completed")
      .order("updated_at", { ascending: false });

    if (data && !error) {
      setReports(data);
    }
    setLoading(false);
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      jalan: "Jalan Raya",
      lampu: "Lampu Jalan",
      drainase: "Drainase",
      taman: "Taman Kota",
      jembatan: "Jembatan",
      fasilitas_umum: "Fasilitas Umum",
      other: "Lainnya",
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    return (
      colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const calculateCompletionTime = (createdAt: string, updatedAt: string) => {
    const created = new Date(createdAt);
    const completed = new Date(updatedAt);
    const diffInHours =
      Math.abs(completed.getTime() - created.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.round(diffInHours)} jam`;
    } else {
      return `${Math.round(diffInHours / 24)} hari`;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Laporan Selesai
              </h1>
              <p className="text-gray-600">
                Riwayat tugas perbaikan yang telah Anda selesaikan
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total: {filteredReports.length} tugas selesai
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Selesai
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {reports.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Tugas yang diselesaikan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {
                  reports.filter((r) => {
                    const completedDate = new Date(r.updated_at);
                    const now = new Date();
                    return (
                      completedDate.getMonth() === now.getMonth() &&
                      completedDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Selesai bulan ini</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rata-rata Waktu
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {reports.length > 0
                  ? Math.round(
                      reports.reduce((acc, r) => {
                        const created = new Date(r.created_at);
                        const completed = new Date(r.updated_at);
                        return (
                          acc +
                          (completed.getTime() - created.getTime()) /
                            (1000 * 60 * 60)
                        );
                      }, 0) / reports.length
                    )
                  : 0}{" "}
                jam
              </div>
              <p className="text-xs text-muted-foreground">
                Waktu penyelesaian
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari laporan yang sudah selesai..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Completed Tasks List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {reports.length === 0
                    ? "Belum ada tugas selesai"
                    : "Tidak ada hasil pencarian"}
                </h3>
                <p className="text-gray-600">
                  {reports.length === 0
                    ? "Tugas yang sudah Anda selesaikan akan muncul di sini."
                    : "Coba ubah kata kunci pencarian Anda."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <Card
                key={report.id}
                className="hover:shadow-md transition-shadow border-l-4 border-l-green-500"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.title}
                        </h3>
                        <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          SELESAI
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{report.description}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {report.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Selesai:{" "}
                          {new Date(report.updated_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Waktu:{" "}
                          {calculateCompletionTime(
                            report.created_at,
                            report.updated_at
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {getCategoryLabel(report.category)}
                        </Badge>
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                            report.priority
                          )}`}
                        >
                          {report.priority.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Detail
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
