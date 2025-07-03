"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { AlertTriangle, Search, Filter, Eye, User, MapPin, Calendar } from "lucide-react"

type Report = {
  id: string
  title: string
  description: string
  location: string
  category: string
  priority: string
  status: string
  reporter_email: string
  reporter_phone: string | null
  completion_notes: string | null
  created_at: string
  updated_at: string
}

export default function AdminReportsPage() {
  const { profile } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  useEffect(() => {
    if (profile?.role === "admin") {
      fetchAllReports()

      // Subscribe to real-time updates
      const subscription = supabase
        .channel("admin-all-reports")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "reports",
          },
          () => {
            fetchAllReports()
          },
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [profile])

  useEffect(() => {
    filterReports()
  }, [reports, searchTerm, statusFilter, categoryFilter, priorityFilter])

  const fetchAllReports = async () => {
    const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false })

    if (data && !error) {
      setReports(data)
    }

    setLoading(false)
  }

  const filterReports = () => {
    let filtered = reports

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.reporter_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter)
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((report) => report.category === categoryFilter)
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter((report) => report.priority === priorityFilter)
    }

    setFilteredReports(filtered)
  }

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId)

      if (error) throw error

      toast({
        title: "Status berhasil diperbarui",
        description: `Status laporan telah diubah ke ${getStatusLabel(newStatus)}.`,
      })
    } catch (error: any) {
      toast({
        title: "Gagal memperbarui status",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      progress: { label: "Dikerjakan", color: "bg-blue-100 text-blue-800 border-blue-200" },
      completed: { label: "Selesai", color: "bg-green-100 text-green-800 border-green-200" },
      approved: { label: "Disetujui", color: "bg-green-100 text-green-800 border-green-200" },
      rejected: { label: "Ditolak", color: "bg-red-100 text-red-800 border-red-200" },
    }

    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        color: "bg-gray-100 text-gray-800 border-gray-200",
      }
    )
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: "Menunggu",
      progress: "Dikerjakan",
      completed: "Selesai",
      approved: "Disetujui",
      rejected: "Ditolak",
    }
    return labels[status as keyof typeof labels] || status
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-green-600 bg-green-50 border-green-200",
      medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
      high: "text-red-600 bg-red-50 border-red-200",
    }
    return colors[priority as keyof typeof colors] || "text-gray-600 bg-gray-50 border-gray-200"
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      jalan: "Jalan Raya",
      lampu: "Lampu Jalan",
      drainase: "Drainase",
      taman: "Taman Kota",
      jembatan: "Jembatan",
      fasilitas_umum: "Fasilitas Umum",
      other: "Lainnya",
    }
    return labels[category as keyof typeof labels] || category
  }

  if (profile?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600">Anda tidak memiliki akses ke halaman admin.</p>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Semua Laporan</h1>
          <p className="text-gray-600">Kelola semua laporan kerusakan fasilitas umum</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari laporan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="progress">Dikerjakan</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="jalan">Jalan Raya</SelectItem>
                  <SelectItem value="lampu">Lampu Jalan</SelectItem>
                  <SelectItem value="drainase">Drainase</SelectItem>
                  <SelectItem value="taman">Taman Kota</SelectItem>
                  <SelectItem value="jembatan">Jembatan</SelectItem>
                  <SelectItem value="fasilitas_umum">Fasilitas Umum</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Prioritas</SelectItem>
                  <SelectItem value="low">Rendah</SelectItem>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setCategoryFilter("all")
                  setPriorityFilter("all")
                }}
              >
                Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada laporan yang sesuai filter</h3>
                <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian Anda.</p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{report.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
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
                          {new Date(report.created_at).toLocaleDateString("id-ID")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(report.status).color}`}
                      >
                        {getStatusBadge(report.status).label}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{getCategoryLabel(report.category)}</Badge>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(report.priority)}`}
                      >
                        {report.priority.toUpperCase()}
                      </div>
                      {report.completion_notes && (
                        <Badge variant="secondary" className="text-xs">
                          Ada Catatan
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select value={report.status} onValueChange={(value) => updateReportStatus(report.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Menunggu</SelectItem>
                          <SelectItem value="progress">Dikerjakan</SelectItem>
                          <SelectItem value="completed">Selesai</SelectItem>
                          <SelectItem value="approved">Disetujui</SelectItem>
                          <SelectItem value="rejected">Ditolak</SelectItem>
                        </SelectContent>
                      </Select>
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

        {/* Summary */}
        {filteredReports.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 text-center">
                Menampilkan {filteredReports.length} dari {reports.length} laporan
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
