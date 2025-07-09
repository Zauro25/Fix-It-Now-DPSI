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
import {
  Wrench,
  Search,
  Filter,
  MapPin,
  Calendar,
  Play,
  CheckCircle,
  Eye,
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

export default function TechnicianTasksPage() {
  return (
    <ProtectedRoute allowedRoles={["technician"]}>
      <TechnicianTasksContent />
    </ProtectedRoute>
  );
}

function TechnicianTasksContent() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    if (profile?.role === "technician") {
      fetchTasks();
    }
  }, [profile]);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("assigned_to", profile.id)
      .order("created_at", { ascending: false });

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

    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (report) => report.priority === priorityFilter
      );
    }

    setFilteredReports(filtered);
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
      fetchTasks();
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
      fetchTasks();
    } catch (error) {
      console.error("Error completing work:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      assigned: { label: "Ditugaskan", color: "bg-blue-100 text-blue-800" },
      progress: { label: "Dikerjakan", color: "bg-yellow-100 text-yellow-800" },
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
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tugas Saya</h1>
              <p className="text-gray-600">
                Kelola semua tugas perbaikan yang ditugaskan kepada Anda
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total: {filteredReports.length} tugas
          </div>
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
                    placeholder="Cari tugas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="assigned">Ditugaskan</SelectItem>
                    <SelectItem value="progress">Dikerjakan</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
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
                    setStatusFilter("all");
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

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {reports.length === 0
                    ? "Belum ada tugas"
                    : "Tidak ada tugas yang sesuai filter"}
                </h3>
                <p className="text-gray-600">
                  {reports.length === 0
                    ? "Anda belum memiliki tugas yang ditugaskan."
                    : "Coba ubah filter pencarian Anda."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => (
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getStatusBadge(report.status).color
                          }`}
                        >
                          {getStatusBadge(report.status).label}
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
                          {new Date(report.created_at).toLocaleDateString(
                            "id-ID"
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
                    <div className="flex flex-col space-y-2 ml-4">
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
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
