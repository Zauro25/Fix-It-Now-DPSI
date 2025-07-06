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
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  TrendingUp,
  MapPin,
  Calendar,
  Eye,
} from "lucide-react";
import Link from "next/link";

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
};

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    progress: 0,
    completed: 0,
    thisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserReports();

      // Subscribe to real-time updates
      const subscription = supabase
        .channel("user-reports")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "reports",
            filter: `reporter_email=eq.${user.email}`,
          },
          () => {
            fetchUserReports();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchUserReports = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("reporter_email", user.email)
      .order("created_at", { ascending: false });

    if (data && !error) {
      setReports(data);

      // Calculate stats
      const total = data.length;
      const pending = data.filter((r) => r.status === "pending").length;
      const progress = data.filter((r) => r.status === "progress").length;
      const completed = data.filter(
        (r) => r.status === "completed" || r.status === "approved"
      ).length;

      // Reports created this month
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      const thisMonthReports = data.filter((r) => {
        const reportDate = new Date(r.created_at);
        return (
          reportDate.getMonth() === thisMonth &&
          reportDate.getFullYear() === thisYear
        );
      }).length;

      setStats({
        total,
        pending,
        progress,
        completed,
        thisMonth: thisMonthReports,
      });
    }

    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Menunggu",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      progress: {
        label: "Dikerjakan",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      },
      completed: {
        label: "Selesai",
        color: "bg-green-100 text-green-800 border-green-200",
      },
      approved: {
        label: "Disetujui",
        color: "bg-green-100 text-green-800 border-green-200",
      },
      rejected: {
        label: "Ditolak",
        color: "bg-red-100 text-red-800 border-red-200",
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
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Selamat datang, {profile?.name}! Kelola laporan kerusakan
              fasilitas umum Anda
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/reports">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Lihat Semua Laporan
              </Button>
            </Link>
            <Link href="/report/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Buat Laporan Baru
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/report/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Buat Laporan Baru
                    </h3>
                    <p className="text-sm text-blue-700">
                      Laporkan kerusakan fasilitas umum
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">
                      Laporan Saya
                    </h3>
                    <p className="text-sm text-green-700">
                      Lihat status semua laporan
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">
                    Tingkat Penyelesaian
                  </h3>
                  <p className="text-sm text-purple-700">
                    {getCompletionRate()}% laporan selesai
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Laporan
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Semua laporan yang Anda buat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pending}
              </div>
              <p className="text-xs text-muted-foreground">
                Menunggu konfirmasi admin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dikerjakan</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.progress}
              </div>
              <p className="text-xs text-muted-foreground">
                Sedang dalam perbaikan
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
              <p className="text-xs text-muted-foreground">
                Perbaikan telah selesai
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
              <p className="text-xs text-muted-foreground">Laporan bulan ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        {stats.total > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Progress</CardTitle>
              <CardDescription>
                Statistik penyelesaian laporan Anda
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.pending}
                  </div>
                  <div className="text-xs text-gray-600">Menunggu</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.progress}
                  </div>
                  <div className="text-xs text-gray-600">Dikerjakan</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </div>
                  <div className="text-xs text-gray-600">Selesai</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Laporan Terbaru</CardTitle>
                <CardDescription>
                  Daftar laporan kerusakan yang Anda buat
                </CardDescription>
              </div>
              {reports.length > 0 && (
                <Link href="/reports">
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
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum ada laporan
                </h3>
                <p className="text-gray-600 mb-6">
                  Anda belum membuat laporan kerusakan. Mulai dengan membuat
                  laporan pertama Anda untuk membantu memperbaiki fasilitas umum
                  di sekitar Anda.
                </p>
                <Link href="/report/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Laporan Pertama
                  </Button>
                </Link>
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
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Detail
                        </Button>
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
