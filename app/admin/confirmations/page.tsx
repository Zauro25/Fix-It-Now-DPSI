"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  User,
  MapPin,
  Calendar,
} from "lucide-react";

type Report = {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: string;
  status: string;
  reporter_email: string;
  reporter_phone: string | null;
  created_at: string;
};

export default function AdminConfirmationsPage() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Update the updateReportStatus function to handle all status transitions
  const updateReportStatus = async (
    reportId: string,
    newStatus: string,
    notes?: string
  ) => {
    setProcessingId(reportId);

    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (notes) {
        updateData.completion_notes = notes;
      }

      if (newStatus === "progress") {
        updateData.assigned_to = profile?.id;
      }

      const { error } = await supabase
        .from("reports")
        .update(updateData)
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Status berhasil diperbarui",
        description: `Laporan telah diubah ke status ${getStatusLabel(
          newStatus
        )}.`,
      });

      // Refresh the data instead of removing from list
      fetchAllReports();
    } catch (error: any) {
      toast({
        title: "Gagal memperbarui status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Update the fetchPendingReports to fetch all reports, not just pending
  const fetchAllReports = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setReports(data);
    }

    setLoading(false);
  };

  // Update the useEffect to call fetchAllReports instead
  useEffect(() => {
    if (profile?.role === "admin") {
      fetchAllReports();

      // Subscribe to real-time updates for all reports
      const subscription = supabase
        .channel("admin-all-reports-management")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "reports",
          },
          () => {
            fetchAllReports();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [profile]);

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: "Menunggu",
      progress: "Dikerjakan",
      completed: "Selesai",
      approved: "Disetujui",
      rejected: "Ditolak",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-green-600 bg-green-50 border-green-200",
      medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
      high: "text-red-600 bg-red-50 border-red-200",
    };
    return (
      colors[priority as keyof typeof colors] ||
      "text-gray-600 bg-gray-50 border-gray-200"
    );
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

  if (profile?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Akses Ditolak
          </h2>
          <p className="text-gray-600">
            Anda tidak memiliki akses ke halaman admin.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Konfirmasi Laporan
          </h1>
          <p className="text-gray-600">
            Tinjau dan konfirmasi laporan kerusakan yang masuk
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Menunggu Konfirmasi
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {reports.filter((r) => r.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Laporan perlu ditinjau
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Prioritas Tinggi
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {reports.filter((r) => r.priority === "high").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Perlu perhatian segera
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  reports.filter(
                    (r) =>
                      r.created_at.split("T")[0] ===
                      new Date().toISOString().split("T")[0]
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Laporan masuk hari ini
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Semua Laporan Sudah Dikonfirmasi
                </h3>
                <p className="text-gray-600">
                  Tidak ada laporan yang menunggu konfirmasi saat ini.
                </p>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {report.title}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {report.reporter_email}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {report.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(report.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {getCategoryLabel(report.category)}
                      </Badge>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                          report.priority
                        )}`}
                      >
                        {report.priority.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Deskripsi Kerusakan:
                    </h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {report.description}
                    </p>
                  </div>

                  {report.reporter_phone && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        Kontak Pelapor:
                      </h4>
                      <p className="text-gray-700">{report.reporter_phone}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <Button
                      onClick={() => updateReportStatus(report.id, "progress")}
                      disabled={processingId === report.id}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {processingId === report.id
                        ? "Memproses..."
                        : "Terima & Kerjakan"}
                    </Button>

                    <Button
                      onClick={() => updateReportStatus(report.id, "completed")}
                      disabled={processingId === report.id}
                      variant="outline"
                      className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {processingId === report.id
                        ? "Memproses..."
                        : "Tandai Selesai"}
                    </Button>

                    <Button
                      onClick={() =>
                        updateReportStatus(
                          report.id,
                          "rejected",
                          "Laporan tidak valid atau duplikat"
                        )
                      }
                      disabled={processingId === report.id}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {processingId === report.id ? "Memproses..." : "Tolak"}
                    </Button>
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
