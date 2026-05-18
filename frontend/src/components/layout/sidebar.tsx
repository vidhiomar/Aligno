"use client";

import {
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Home,
  ListChecks,
  Lock,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
}

const employeeItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Goal Sheet", href: "/dashboard/goals", icon: Target },
  { label: "Check-ins", href: "/dashboard/checkins", icon: ListChecks },
];

const managerItems: NavItem[] = [
  { label: "Team Dashboard", href: "/dashboard/manager", icon: Home },
  { label: "Goal Reviews", href: "/dashboard/manager", icon: ClipboardCheck },
  {
    label: "Team Check-ins",
    href: "/dashboard/manager/checkins",
    icon: CheckCircle2,
  },
];

const adminItems: NavItem[] = [
  { label: "Org Analytics", href: "/dashboard/admin", icon: Home },
  { label: "Cycle Management", href: "/dashboard/admin/cycles", icon: Settings },
  { label: "User Management", href: "/dashboard/admin/users", icon: Users },
  { label: "Audit Log", href: "/dashboard/admin/audit", icon: FileText },
  { label: "Goal Unlock", href: "/dashboard/admin/unlock", icon: Lock },
  { label: "Reports", href: "/dashboard/admin/reports", icon: BarChart3 },
  {
    label: "Escalations",
    href: "/dashboard/admin/escalations",
    icon: ShieldAlert,
  },
  {
    label: "Analytics",
    href: "/dashboard/admin/analytics",
    icon: ShieldCheck,
  },
];

function getNavItems(role: string | undefined): NavItem[] {
  switch (role) {
    case "manager":
      return managerItems;
    case "admin":
      return adminItems;
    default:
      return employeeItems;
  }
}

export function Sidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r bg-gradient-to-b from-background to-muted/30 py-6 lg:block">
      <SidebarContent />
    </aside>
  );
}

export function SidebarContent() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const items = getNavItems(user?.role);

  return (
    <nav className="space-y-1 px-3 py-4">
      {user ? (
        <div className="mb-4 rounded-lg border bg-card/50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {user.role}
          </p>
          <p className="mt-1 truncate text-sm font-medium">
            {user.full_name || user.email}
          </p>
        </div>
      ) : null}
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" &&
            item.href !== "/dashboard/manager" &&
            item.href !== "/dashboard/admin" &&
            pathname.startsWith(item.href));
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
