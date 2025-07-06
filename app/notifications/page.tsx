"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Notification = {
  id: string;
  message: string;
  created_at: string;
  read: boolean;
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Semua");

  useEffect(() => {
    if (user) {
      fetchNotifications();

      const subscription = supabase
        .channel("user-notifications")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `reporter_email=eq.${user.email}`,
          },
          () => {
            fetchNotifications();
          },
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, activeTab]);

  const fetchNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications") // Ganti dengan nama tabel notifikasi Anda
      .select("*")
      .eq("reporter_email", user.email)
      .order("created_at", { ascending: false });

    if (data && !error) {
      setNotifications(data);
    }

    setLoading(false);
  };

  const filterNotifications = () => {
    let filtered = notifications;

    if (activeTab === "Terbaru") {
      filtered = filtered.filter((notif) => !notif.read);
    } else if (activeTab === "Belum dibaca") {
      filtered = filtered.filter((notif) => !notif.read);
    }

    setFilteredNotifications(filtered);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins} Menit lalu`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Notifikasi Sistem</h1>
        <div className="flex space-x-4 mb-6">
          {["Semua", "Terbaru", "Belum dibaca"].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${
                activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {tab}
            </Button>
          ))}
        </div>
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-600">Tidak ada notifikasi yang sesuai.</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notif) => (
              <Card key={notif.id} className="border rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">👤</span>
                  </div>
                  <div>
                    <p className="font-medium">Laporan Terbaru</p>
                    <p className="text-gray-600">"{notif.message}"</p>
                  </div>
                </div>
                <span className="text-gray-500 text-sm">{formatTimeAgo(notif.created_at)}</span>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}