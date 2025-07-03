"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"

type Report = {
  id: string
  title: string
  description: string
  location: string
  category: string
  priority: string
  status: string
  reporter_email: string
  created_at: string
}

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    progress: 0,
    completed: 0,
    today: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.role === "admin") {
      fetchAllReports()

      // Subscribe to real-time updates
      const subscription = supabase
        .channel("admin-reports")
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

  const fetchAllReports = async () => {
    const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false })

    if (data && !error) {
      setReports(data)

      // Calculate stats
      const total = data.length
      const pending = data.filter((r) => r.status === "pending").length
      const progress = data.filter((r) => r.status === "progress").length
      const completed = data.filter((r) => r.status === "completed").length

      // Reports created today
      const today = new Date().toISOString().split("T")[0]
      const todayReports = data.filter((r) => r.created_at.split("T")[0] === today).length

      setStats({ total, pending, progress, completed, today: todayReports })
    }

    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Menunggu", variant: "secondary" as const },
      progress: { label: "Dikerjakan", variant: "default" as const },
      completed: { label: "Selesai", variant: "default" as const },
      approved: { label: "Disetujui", variant: "default" as const },
    }

    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-green-600",
      medium: "text-yellow-600",
      high: "text-red-600",
    }
    return colors[priority as keyof typeof colors] || "text-gray-600"
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-600">Kelola semua laporan kerusakan fasilitas umum</p>
          </div>
          <div className="flex space-x-2">
            <Link href="/admin/confirmations">
              <Button variant="outline">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Konfirmasi ({stats.pending})
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Semua Laporan
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Laporan</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Semua laporan masuk</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Perlu konfirmasi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dikerjakan</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.progress}</div>
              <p className="text-xs text-muted-foreground">Sedang diperbaiki</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Perbaikan selesai</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
              <p className="text-xs text-muted-foreground">Laporan baru hari ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Laporan Terbaru</CardTitle>
            <CardDescription>Daftar laporan kerusakan yang baru masuk</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada laporan</h3>
                <p className="text-gray-600">Belum ada laporan kerusakan yang masuk.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.slice(0, 10).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{report.location}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{report.category}</Badge>
                        <span className={`text-xs font-medium ${getPriorityColor(report.priority)}`}>
                          {report.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">oleh {report.reporter_email}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusBadge(report.status).variant}>
                        {getStatusBadge(report.status).label}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(report.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}

                {reports.length > 10 && (
                  <div className="text-center pt-4">
                    <Link href="/admin/reports">
                      <Button variant="outline">Lihat Semua Laporan</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
