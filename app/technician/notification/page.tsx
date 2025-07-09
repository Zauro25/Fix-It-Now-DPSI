"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { NotificationCenter } from "../../../components/notification";
import { ProtectedRoute } from "../../auth/protected-route";
import { Bell } from "lucide-react";

function NotificationsPageContent() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifikasi</h1>
            <p className="text-gray-600">
              Kelola notifikasi dan update terbaru
            </p>
          </div>
        </div>

        <NotificationCenter />
      </div>
    </DashboardLayout>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute allowedRoles={["technician", "admin", "government"]}>
      <NotificationsPageContent />
    </ProtectedRoute>
  );
}
