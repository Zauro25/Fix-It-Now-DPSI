"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  Save,
  ArrowRight,
  MessageSquare,
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
  completion_notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

export default function AdminManagePage() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile?.role === "admin") {
      fetchAllReports();

      // Subscribe to real-time updates
      const subscription = supabase
        .channel("admin-manage-reports")
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

      if (notes !== undefined) {
        updateData.completion_notes = notes;
      }

      if (
        newStatus === "progress" &&
        !reports.find((r) => r.id === reportId)?.assigned_to
      ) {
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

  const saveNotes = async (reportId: string) => {
    const notes = editingNotes[reportId];
    if (notes === undefined) return;

    setProcessingId(reportId);

    try {
      const { error } = await supabase
        .from("reports")
        .update({
          completion_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Catatan berhasil disimpan",
        description: "Catatan penyelesaian telah diperbarui.",
      });

      setEditingNotes((prev) => {
        const newNotes = { ...prev };
        delete newNotes[reportId];
        return newNotes;
      });

      fetchAllReports();
    } catch (error: any) {
      toast({
        title: "Gagal menyimpan catatan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
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

  const getNextStatusOptions = (currentStatus: string) => {
    const statusFlow = {
      pending: ["progress", "rejected"],
      progress: ["completed", "rejected"],
      completed: ["approved"],
      approved: [],
      rejected: ["pending"],
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || [];
  };

  const getStatusActionLabel = (fromStatus: string, toStatus: string) => {
    const actions = {
      "pending-progress": "Mulai Kerjakan",
      "pending-rejected": "Tolak Laporan",
      "progress-completed": "Tandai Selesai",
      "progress-rejected": "Batalkan",
      "completed-approved": "Setujui",
      "rejected-pending": "Aktifkan Kembali",
    };
    return (
      actions[`${fromStatus}-${toStatus}` as keyof typeof actions] ||
      `Ubah ke ${getStatusLabel(toStatus)}`
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Kelola Laporan</h1>
          <p className="text-gray-600">
            Kelola status dan progress semua laporan kerusakan
          </p>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum ada laporan
                </h3>
                <p className="text-gray-600">
                  Belum ada laporan yang masuk ke sistem.
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
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          getStatusBadge(report.status).color
                        }`}
                      >
                        {getStatusBadge(report.status).label}
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

                  {/* Notes Section */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Catatan Penyelesaian:
                    </h4>
                    {editingNotes[report.id] !== undefined ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNotes[report.id]}
                          onChange={(e) =>
                            setEditingNotes((prev) => ({
                              ...prev,
                              [report.id]: e.target.value,
                            }))
                          }
                          placeholder="Tambahkan catatan tentang progress atau penyelesaian..."
                          className="min-h-[80px]"
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => saveNotes(report.id)}
                            disabled={processingId === report.id}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            {processingId === report.id
                              ? "Menyimpan..."
                              : "Simpan"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditingNotes((prev) => {
                                const newNotes = { ...prev };
                                delete newNotes[report.id];
                                return newNotes;
                              })
                            }
                          >
                            Batal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-700 mb-2">
                          {report.completion_notes || "Belum ada catatan"}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEditingNotes((prev) => ({
                              ...prev,
                              [report.id]: report.completion_notes || "",
                            }))
                          }
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {report.completion_notes
                            ? "Edit Catatan"
                            : "Tambah Catatan"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Status Actions */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Aksi Status:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getNextStatusOptions(report.status).map((nextStatus) => (
                        <Button
                          key={nextStatus}
                          onClick={() =>
                            updateReportStatus(report.id, nextStatus)
                          }
                          disabled={processingId === report.id}
                          variant={
                            nextStatus === "rejected"
                              ? "destructive"
                              : "default"
                          }
                          size="sm"
                        >
                          <ArrowRight className="w-4 h-4 mr-1" />
                          {processingId === report.id
                            ? "Memproses..."
                            : getStatusActionLabel(report.status, nextStatus)}
                        </Button>
                      ))}

                      {getNextStatusOptions(report.status).length === 0 && (
                        <p className="text-sm text-gray-500 italic">
                          Status final - tidak ada aksi lebih lanjut
                        </p>
                      )}
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
