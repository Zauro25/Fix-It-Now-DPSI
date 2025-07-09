"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, TrendingUp } from "lucide-react";

export function QuickStats() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    progress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      fetchStats();
    }
  }, [user, profile]);

  const fetchStats = async () => {
    try {
      let query = supabase.from("reports").select("status");

      // Filter based on user role
      if (profile?.role === "technician") {
        query = query.eq("assigned_to", profile.id);
      } else if (profile?.role === "public") {
        query = query.eq("reporter_email", user?.email);
      }
      // Admin and government see all reports

      const { data, error } = await query;

      if (data && !error) {
        const total = data.length;
        const pending = data.filter((r) => r.status === "pending").length;
        const progress = data.filter((r) => r.status === "progress").length;
        const completed = data.filter(
          (r) => r.status === "completed" || r.status === "approved"
        ).length;

        setStats({ total, pending, progress, completed });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStatsLabel = () => {
    switch (profile?.role) {
      case "technician":
        return {
          total: "Total Tugas",
          pending: "Tugas Baru",
          progress: "Sedang Dikerjakan",
          completed: "Selesai",
        };
      case "public":
        return {
          total: "Total Laporan",
          pending: "Menunggu",
          progress: "Dikerjakan",
          completed: "Selesai",
        };
      default:
        return {
          total: "Total Laporan",
          pending: "Menunggu",
          progress: "Dikerjakan",
          completed: "Selesai",
        };
    }
  };

  const labels = getStatsLabel();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{labels.total}</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {labels.pending}
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {stats.pending}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {labels.progress}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.progress}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {labels.completed}
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.completed}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
