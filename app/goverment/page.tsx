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
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Shield,
  TrendingUp,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "../auth/protected-route";

type Report = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  created_at: string;
};

type Facility = {
  id: string;
  name: string;
  category: string;
  status: string;
  location: string;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function GovernmentDashboard() {
  return (
    <ProtectedRoute allowedRoles={["goverment"]}>
      <GovernmentDashboardContent />
    </ProtectedRoute>
  );
}

function GovernmentDashboardContent() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    completedReports: 0,
    totalFacilities: 0,
    activeFacilities: 0,
    thisMonth: 0,
  });
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === "goverment") {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      // Fetch reports
      const { data: reportsData } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch facilities
      const { data: facilitiesData } = await supabase
        .from("facilities")
        .select("*")
        .order("created_at", { ascending: false });

      if (reportsData) {
        setReports(reportsData);

        // Calculate stats
        const totalReports = reportsData.length;
        const pendingReports = reportsData.filter(
          (r) => r.status === "pending"
        ).length;
        const completedReports = reportsData.filter(
          (r) => r.status === "completed" || r.status === "approved"
        ).length;

        // This month reports
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const thisMonthReports = reportsData.filter((r) => {
          const reportDate = new Date(r.created_at);
          return (
            reportDate.getMonth() === thisMonth &&
            reportDate.getFullYear() === thisYear
          );
        }).length;

        // Category analysis
        const categoryCount = reportsData.reduce((acc: any, report) => {
          acc[report.category] = (acc[report.category] || 0) + 1;
          return acc;
        }, {});

        const categoryChartData = Object.entries(categoryCount).map(
          ([category, count]) => ({
            name: getCategoryLabel(category),
            value: count,
          })
        );

        setCategoryData(categoryChartData);

        // Monthly trend (last 6 months)
        const monthlyCount = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthReports = reportsData.filter((r) => {
            const reportDate = new Date(r.created_at);
            return (
              reportDate.getMonth() === date.getMonth() &&
              reportDate.getFullYear() === date.getFullYear()
            );
          }).length;

          return {
            month: date.toLocaleDateString("id-ID", { month: "short" }),
            reports: monthReports,
          };
        }).reverse();

        setMonthlyData(monthlyCount);

        setStats((prev) => ({
          ...prev,
          totalReports,
          pendingReports,
          completedReports,
          thisMonth: thisMonthReports,
        }));
      }

      if (facilitiesData) {
        setFacilities(facilitiesData);
        const totalFacilities = facilitiesData.length;
        const activeFacilities = facilitiesData.filter(
          (f) => f.status === "active"
        ).length;

        setStats((prev) => ({
          ...prev,
          totalFacilities,
          activeFacilities,
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Menunggu", variant: "secondary" as const },
      progress: { label: "Dikerjakan", variant: "default" as const },
      completed: { label: "Selesai", variant: "default" as const },
      approved: { label: "Disetujui", variant: "default" as const },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        variant: "secondary" as const,
      }
    );
  };

  if (profile?.role !== "goverment") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Akses Ditolak
          </h2>
          <p className="text-gray-600">
            Anda tidak memiliki akses ke dashboard pemerintah.
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
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Pemerintah
              </h1>
              <p className="text-gray-600">
                Analisis dan monitoring fasilitas umum kota
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/goverment/analytics">
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analisis Detail
              </Button>
            </Link>
            <Link href="/goverment/facilities">
              <Button>
                <Building2 className="w-4 h-4 mr-2" />
                Kelola Fasilitas
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Laporan
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <p className="text-xs text-muted-foreground">
                Semua laporan masuk
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Menunggu Tindakan
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pendingReports}
              </div>
              <p className="text-xs text-muted-foreground">
                Perlu ditindaklanjuti
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Selesai Diperbaiki
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completedReports}
              </div>
              <p className="text-xs text-muted-foreground">Perbaikan selesai</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Fasilitas
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFacilities}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeFacilities} aktif
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Laporan per Kategori</CardTitle>
              <CardDescription>
                Breakdown laporan berdasarkan jenis fasilitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tren Laporan Bulanan</CardTitle>
              <CardDescription>
                Jumlah laporan dalam 6 bulan terakhir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="reports"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: "#8884d8" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Laporan Terbaru</CardTitle>
                <CardDescription>
                  Laporan kerusakan fasilitas yang baru masuk
                </CardDescription>
              </div>
              <Link href="/goverment/public-reports">
                <Button variant="outline" size="sm">
                  Lihat Semua
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum ada laporan
                </h3>
                <p className="text-gray-600">
                  Belum ada laporan kerusakan yang masuk.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.slice(0, 8).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {report.title}
                      </h4>
                      <div className="flex items-center text-sm text-gray-500 space-x-4 mt-1">
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
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">
                          {getCategoryLabel(report.category)}
                        </Badge>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            report.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : report.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {report.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusBadge(report.status).variant}>
                        {getStatusBadge(report.status).label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
