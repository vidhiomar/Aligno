"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";
import type { User } from "@/types/auth";

function getRoleHome(user: User) {
  if (user.role === "admin") return "/admin";
  if (user.role === "manager") return "/manager";
  return "/employee";
}

function getRouteAccess(pathname: string, user: User) {
  if (pathname.startsWith("/dashboard/admin")) {
    return user.role === "admin";
  }

  if (pathname.startsWith("/dashboard/manager")) {
    return user.role === "manager" || user.role === "admin";
  }

  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/goals") ||
    pathname.startsWith("/dashboard/checkins")
  ) {
    return true;
  }

  return true;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const hasHydrated =
    typeof window !== "undefined" ? useAuthStore.persist.hasHydrated() : false;

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (!getRouteAccess(pathname, user)) {
      router.replace(getRoleHome(user));
    }
  }, [hasHydrated, isAuthenticated, pathname, router, user]);

  if (
    !hasHydrated ||
    !isAuthenticated ||
    !user ||
    !getRouteAccess(pathname, user)
  ) {
    return (
      <div className="bg-background min-h-screen p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
