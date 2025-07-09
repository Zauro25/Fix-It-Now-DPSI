"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
  Eye,
  Play,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "../auth/protected-route";

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

export default function TechnicianDashboard() {
  return (
    <ProtectedRoute allowedRoles={["technician"]}>
      <TechnicianDashboardContent />
    </ProtectedRoute>
  );
}

function TechnicianDashboardContent() {
  const { user, profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
    thisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile?.role === "technician") {
      fetchTechnicianReports();

      // Subscribe to real-time updates
      const subscription = supabase
        .channel("technician-reports")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "reports",
            filter: `assigned_to=eq.${profile.id}`,
          },
          () => {
            fetchTechnicianReports();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, profile]);

  const fetchTechnicianReports = async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("assigned_to", profile.id)
      .order("created_at", { ascending: false });

    if (data && !error) {
      setReports(data);

      // Calculate stats
      const assigned = data.filter((r) => r.status === "assigned").length;
      const inProgress = data.filter((r) => r.status === "progress").length;
      const completed = data.filter((r) => r.status === "completed").length;

      // Reports assigned this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekReports = data.filter((r) => {
        const reportDate = new Date(r.created_at);
        return reportDate >= oneWeekAgo;
      }).length;

      setStats({
        assigned,
        inProgress,
        completed,
        thisWeek: thisWeekReports,
      });
    }

    setLoading(false);
  };

  const handleStartWork = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status: "progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      fetchTechnicianReports();
    } catch (error) {
      console.error("Error starting work:", error);
    }
  };

  const handleCompleteWork = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      fetchTechnicianReports();
    } catch (error) {
      console.error("Error completing work:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      assigned: {
        label: "Ditugaskan",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      },
      progress: {
        label: "Dikerjakan",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      completed: {
        label: "Selesai",
        color: "bg-green-100 text-green-800 border-green-200",
      },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        color: "bg-gray-100 text-gray-800 border-gray-200",
      }
    );
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

  const getCompletionRate = () => {
    const total = stats.assigned + stats.inProgress + stats.completed;
    if (total === 0) return 0;
    return Math.round((stats.completed / total) * 100);
  };

  if (profile?.role !== "technician") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Akses Ditolak
          </h2>
          <p className="text-gray-600">
            Anda tidak memiliki akses ke dashboard teknisi.
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Teknisi
              </h1>
              <p className="text-gray-600">
                Selamat datang, {profile?.name}! Kelola tugas perbaikan Anda
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/technician/tasks">
              <Button variant="outline">
                <Wrench className="w-4 h-4 mr-2" />
                Lihat Semua Tugas
              </Button>
            </Link>
            <Link href="/technician/notifications">
              <Button>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Notifikasi
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tugas Baru</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.assigned}
              </div>
              <p className="text-xs text-muted-foreground">
                Menunggu dikerjakan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sedang Dikerjakan
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.inProgress}
              </div>
              <p className="text-xs text-muted-foreground">
                Dalam proses perbaikan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
              <p className="text-xs text-muted-foreground">Perbaikan selesai</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minggu Ini</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisWeek}</div>
              <p className="text-xs text-muted-foreground">Tugas minggu ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        {stats.assigned + stats.inProgress + stats.completed > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Progress</CardTitle>
              <CardDescription>
                Statistik penyelesaian tugas Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tingkat Penyelesaian</span>
                  <span>{getCompletionRate()}%</span>
                </div>
                <Progress value={getCompletionRate()} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.assigned}
                  </div>
                  <div className="text-xs text-gray-600">Baru</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.inProgress}
                  </div>
                  <div className="text-xs text-gray-600">Dikerjakan</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </div>
                  <div className="text-xs text-gray-600">Selesai</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Tugas Terbaru</CardTitle>
                <CardDescription>
                  Daftar tugas perbaikan yang ditugaskan kepada Anda
                </CardDescription>
              </div>
              {reports.length > 0 && (
                <Link href="/technician/tasks">
                  <Button variant="outline" size="sm">
                    Lihat Semua
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum ada tugas
                </h3>
                <p className="text-gray-600">
                  Anda belum memiliki tugas perbaikan yang ditugaskan. Tugas
                  baru akan muncul di sini ketika admin menugaskan pekerjaan
                  kepada Anda.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.slice(0, 5).map((report) => (
                  <Card
                    key={report.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {report.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {report.description}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
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
                        <div className="text-right ml-4">
                          <div
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              getStatusBadge(report.status).color
                            }`}
                          >
                            {getStatusBadge(report.status).label}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {getCategoryLabel(report.category)}
                          </Badge>
                          <div
                            className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(
                              report.priority
                            )}`}
                          >
                            {report.priority.toUpperCase()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {report.status === "assigned" && (
                            <Button
                              size="sm"
                              onClick={() => handleStartWork(report.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Mulai
                            </Button>
                          )}
                          {report.status === "progress" && (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteWork(report.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Selesai
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Detail
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
