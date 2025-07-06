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
import { FileText, Search, Filter, Plus, Eye } from "lucide-react"
import Link from "next/link"

type Report = {
  id: string
  title: string
  description: string
  location: string
  category: string
  priority: string
  status: string
  created_at: string
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    if (user) {
      fetchUserReports()

      // Subscribe to real-time updates
      const subscription = supabase
        .channel("user-reports-list")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "reports",
            filter: `reporter_email=eq.${user.email}`,
          },
          () => {
            fetchUserReports()
          },
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  useEffect(() => {
    filterReports()
  }, [reports, searchTerm, statusFilter, categoryFilter])

  const fetchUserReports = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("reporter_email", user.email)
      .order("created_at", { ascending: false })

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

    setFilteredReports(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Menunggu", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
      progress: { label: "Dikerjakan", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
      completed: { label: "Selesai", variant: "default" as const, color: "bg-green-100 text-green-800" },
      approved: { label: "Disetujui", variant: "default" as const, color: "bg-green-100 text-green-800" },
    }

    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        variant: "secondary" as const,
        color: "bg-gray-100 text-gray-800",
      }
    )
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-green-600 bg-green-50",
      medium: "text-yellow-600 bg-yellow-50",
      high: "text-red-600 bg-red-50",
    }
    return colors[priority as keyof typeof colors] || "text-gray-600 bg-gray-50"
  }

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
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Laporan Saya</h1>
            <p className="text-gray-600">Daftar semua laporan kerusakan yang Anda buat</p>
          </div>
          <Link href="/report/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Buat Laporan Baru
            </Button>
          </Link>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setCategoryFilter("all")
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
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {reports.length === 0 ? "Belum ada laporan" : "Tidak ada laporan yang sesuai filter"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {reports.length === 0
                    ? "Anda belum membuat laporan kerusakan. Mulai dengan membuat laporan pertama Anda."
                    : "Coba ubah filter atau kata kunci pencarian Anda."}
                </p>
                {reports.length === 0 && (
                  <Link href="/report/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Buat Laporan Pertama
                    </Button>
                  </Link>
                )}
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
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span>📍 {report.location}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(report.status).color}`}
                      >
                        {getStatusBadge(report.status).label}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{report.category}</Badge>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(report.priority)}`}>
                        {report.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(report.created_at).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Detail
                    </Button>
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
