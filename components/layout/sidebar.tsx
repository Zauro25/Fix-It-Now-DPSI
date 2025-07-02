"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  Plus,
} from "lucide-react";

const publicNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Buat Laporan",
    href: "/report/new",
    icon: Plus,
  },
  {
    title: "Laporan Saya",
    href: "/reports",
    icon: FileText,
  },
];

const adminNavItems = [
  {
    title: "Dashboard Admin",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Kelola Laporan",
    href: "/admin/manage",
    icon: FileText,
  },
  {
    title: "Konfirmasi Laporan",
    href: "/admin/confirmations",
    icon: AlertTriangle,
  },
  {
    title: "Semua Laporan",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    title: "Manajemen User",
    href: "/admin/users",
    icon: Users,
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const navItems = profile?.role === "admin" ? adminNavItems : publicNavItems;

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FIN</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Fix It Now
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {profile?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile?.role === "admin" ? "Administrator" : "Public User"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-gray-900"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
