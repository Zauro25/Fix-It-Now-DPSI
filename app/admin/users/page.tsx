"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { UserManagement } from "../../../components/auth/user-management";
import { ProtectedRoute } from "../../auth/protected-route";
import { Users } from "lucide-react";

function UsersPageContent() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen User</h1>
            <p className="text-gray-600">
              Kelola user dan role dalam sistem Fix It Now
            </p>
          </div>
        </div>

        <UserManagement />
      </div>
    </DashboardLayout>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <UsersPageContent />
    </ProtectedRoute>
  );
}
