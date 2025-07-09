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
  Building2,
  Search,
  Filter,
  MapPin,
  Calendar,
  Plus,
  Eye,
  Edit,
} from "lucide-react";
import { ProtectedRoute } from "../../auth/protected-route";
import Link from "next/link";

type Facility = {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  address: string;
  maintenance_schedule: string;
  responsible_department: string;
  status: string;
  created_at: string;
};

export default function GovernmentFacilitiesPage() {
  return (
    <ProtectedRoute allowedRoles={["goverment", "admin"]}>
      <GovernmentFacilitiesContent />
    </ProtectedRoute>
  );
}

function GovernmentFacilitiesContent() {
  const { profile } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    filterFacilities();
  }, [facilities, searchTerm, categoryFilter, statusFilter]);

  const fetchFacilities = async () => {
    const { data, error } = await supabase
      .from("facilities")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setFacilities(data);
    }
    setLoading(false);
  };

  const filterFacilities = () => {
    let filtered = facilities;

    if (searchTerm) {
      filtered = filtered.filter(
        (facility) =>
          facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facility.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facility.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (facility) => facility.category === categoryFilter
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (facility) => facility.status === statusFilter
      );
    }

    setFilteredFacilities(filtered);
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      jalan: "Jalan Raya",
      lampu: "Lampu Jalan",
      drainase: "Drainase",
      taman: "Taman Kota",
      jembatan: "Jembatan",
      fasilitas_umum: "Fasilitas Umum",
      transportasi: "Transportasi Publik",
      sanitasi: "Sanitasi",
      other: "Lainnya",
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Aktif", color: "bg-green-100 text-green-800" },
      inactive: { label: "Tidak Aktif", color: "bg-red-100 text-red-800" },
      maintenance: {
        label: "Maintenance",
        color: "bg-yellow-100 text-yellow-800",
      },
    };
    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  const getDepartmentLabel = (dept: string) => {
    const labels = {
      dpu: "Dinas Pekerjaan Umum",
      dishub: "Dinas Perhubungan",
      dlh: "Dinas Lingkungan Hidup",
      dkp: "Dinas Kebersihan dan Pertamanan",
      other: "Lainnya",
    };
    return labels[dept as keyof typeof labels] || dept;
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
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manajemen Fasilitas
              </h1>
              <p className="text-gray-600">Kelola fasilitas umum kota</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">
              Total: {filteredFacilities.length} fasilitas
            </div>
            {profile?.role === "admin" && (
              <Link href="/admin/facilities/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Fasilitas
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Fasilitas
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{facilities.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif</CardTitle>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {facilities.filter((f) => f.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {facilities.filter((f) => f.status === "maintenance").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tidak Aktif</CardTitle>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {facilities.filter((f) => f.status === "inactive").length}
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
                    placeholder="Cari fasilitas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    <SelectItem value="jalan">Jalan Raya</SelectItem>
                    <SelectItem value="lampu">Lampu Jalan</SelectItem>
                    <SelectItem value="drainase">Drainase</SelectItem>
                    <SelectItem value="taman">Taman Kota</SelectItem>
                    <SelectItem value="jembatan">Jembatan</SelectItem>
                    <SelectItem value="fasilitas_umum">
                      Fasilitas Umum
                    </SelectItem>
                    <SelectItem value="transportasi">
                      Transportasi Publik
                    </SelectItem>
                    <SelectItem value="sanitasi">Sanitasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                  }}
                  className="w-full"
                >
                  Reset Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facilities List */}
        <div className="space-y-4">
          {filteredFacilities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {facilities.length === 0
                    ? "Belum ada fasilitas"
                    : "Tidak ada fasilitas yang sesuai filter"}
                </h3>
                <p className="text-gray-600">
                  {facilities.length === 0
                    ? "Mulai dengan menambahkan fasilitas pertama."
                    : "Coba ubah filter pencarian Anda."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFacilities.map((facility) => (
              <Card
                key={facility.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {facility.name}
                        </h3>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getStatusBadge(facility.status).color
                          }`}
                        >
                          {getStatusBadge(facility.status).label}
                        </div>
                      </div>
                      {facility.description && (
                        <p className="text-gray-600 mb-3">
                          {facility.description}
                        </p>
                      )}
                      <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {facility.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(facility.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {getCategoryLabel(facility.category)}
                        </Badge>
                        <Badge variant="secondary">
                          {getDepartmentLabel(facility.responsible_department)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Detail
                      </Button>
                      {profile?.role === "admin" && (
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
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
