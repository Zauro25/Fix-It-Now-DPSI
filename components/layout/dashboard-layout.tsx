"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "./sidebar"
import { Loader2 } from "lucide-react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:ml-64">
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
