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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  UserCheck,
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  AlertTriangle,
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
  reporter_email: string;
  assigned_to?: string;
};

type Technician = {
  id: string;
  name: string;
  email: string;
  department?: string;
};

export default function AssignTasksPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AssignTasksContent />
    </ProtectedRoute>
  );
}

function AssignTasksContent() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("unassigned");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, priorityFilter]);

  const fetchData = async () => {
    // Fetch reports
    const { data: reportsData, error: reportsError } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch technicians
    const { data: techniciansData, error: techniciansError } = await supabase
      .from("profiles")
      .select("id, name, email, department")
      .eq("role", "technician");

    if (reportsData && !reportsError) {
      setReports(reportsData);
    }

    if (techniciansData && !techniciansError) {
      setTechnicians(techniciansData);
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

    if (statusFilter === "unassigned") {
      filtered = filtered.filter(
        (report) => !report.assigned_to && report.status === "pending"
      );
    } else if (statusFilter === "assigned") {
      filtered = filtered.filter(
        (report) => report.assigned_to && report.status !== "completed"
      );
    } else if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (report) => report.priority === priorityFilter
      );
    }

    setFilteredReports(filtered);
  };

  const assignTechnician = async (reportId: string, technicianId: string) => {
    setAssigning(reportId);

    try {
      const { error } = await supabase
        .from("reports")
        .update({
          assigned_to: technicianId,
          status: "assigned",
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Tugas berhasil ditugaskan ke teknisi.",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menugaskan teknisi.",
        variant: "destructive",
      });
    } finally {
      setAssigning(null);
    }
  };

  const unassignTechnician = async (reportId: string) => {
    setAssigning(reportId);

    try {
      const { error } = await supabase
        .from("reports")
        .update({
          assigned_to: null,
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Penugasan teknisi berhasil dibatalkan.",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal membatalkan penugasan.",
        variant: "destructive",
      });
    } finally {
      setAssigning(null);
    }
  };

  const getStatusBadge = (status: string, assignedTo?: string) => {
    if (!assignedTo && status === "pending") {
      return { label: "Belum Ditugaskan", color: "bg-red-100 text-red-800" };
    }

    const statusConfig = {
      pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800" },
      assigned: { label: "Ditugaskan", color: "bg-blue-100 text-blue-800" },
      progress: { label: "Dikerjakan", color: "bg-purple-100 text-purple-800" },
      completed: { label: "Selesai", color: "bg-green-100 text-green-800" },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        color: "bg-gray-100 text-gray-800",
      }
    );
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

  const getAssignedTechnician = (assignedTo?: string) => {
    if (!assignedTo) return null;
    return technicians.find((t) => t.id === assignedTo);
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Assign Tugas ke Teknisi
              </h1>
              <p className="text-gray-600">
                Kelola penugasan laporan ke teknisi
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {technicians.length} teknisi tersedia
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Belum Ditugaskan
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {
                  reports.filter(
                    (r) => !r.assigned_to && r.status === "pending"
                  ).length
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sudah Ditugaskan
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {reports.filter((r) => r.assigned_to).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sedang Dikerjakan
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {reports.filter((r) => r.status === "progress").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Teknisi Aktif
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {technicians.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filter & Pencarian</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pencarian</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari laporan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status Penugasan</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Belum Ditugaskan</SelectItem>
                    <SelectItem value="assigned">Sudah Ditugaskan</SelectItem>
                    <SelectItem value="all">Semua Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prioritas</label>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Prioritas</SelectItem>
                    <SelectItem value="high">Tinggi</SelectItem>
                    <SelectItem value="medium">Sedang</SelectItem>
                    <SelectItem value="low">Rendah</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("unassigned");
                    setPriorityFilter("all");
                  }}
                  className="w-full"
                >
                  Reset Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {reports.length === 0
                    ? "Belum ada laporan"
                    : "Tidak ada laporan yang sesuai filter"}
                </h3>
                <p className="text-gray-600">
                  {reports.length === 0
                    ? "Laporan akan muncul di sini ketika ada yang masuk."
                    : "Coba ubah filter pencarian Anda."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => {
              const assignedTech = getAssignedTechnician(report.assigned_to);
              const statusBadge = getStatusBadge(
                report.status,
                report.assigned_to
              );

              return (
                <Card
                  key={report.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {report.title}
                          </h3>
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                          >
                            {statusBadge.label}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">
                          {report.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
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
                        <div className="flex items-center space-x-2 mb-3">
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
                        {assignedTech && (
                          <div className="flex items-center space-x-2 text-sm text-blue-600">
                            <Users className="w-4 h-4" />
                            <span>Ditugaskan ke: {assignedTech.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 space-y-2">
                        {!report.assigned_to ? (
                          <Select
                            onValueChange={(technicianId) =>
                              assignTechnician(report.id, technicianId)
                            }
                            disabled={assigning === report.id}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Pilih teknisi..." />
                            </SelectTrigger>
                            <SelectContent>
                              {technicians.map((tech) => (
                                <SelectItem key={tech.id} value={tech.id}>
                                  {tech.name}{" "}
                                  {tech.department && `(${tech.department})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="space-y-2">
                            <Select
                              value={report.assigned_to}
                              onValueChange={(technicianId) =>
                                assignTechnician(report.id, technicianId)
                              }
                              disabled={
                                assigning === report.id ||
                                report.status === "completed"
                              }
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {technicians.map((tech) => (
                                  <SelectItem key={tech.id} value={tech.id}>
                                    {tech.name}{" "}
                                    {tech.department && `(${tech.department})`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {report.status !== "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => unassignTechnician(report.id)}
                                disabled={assigning === report.id}
                                className="w-full"
                              >
                                Batalkan Penugasan
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
