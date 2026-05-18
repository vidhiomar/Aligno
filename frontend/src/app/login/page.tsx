"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Layers,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import type { LoginPayload, User } from "@/types/auth";

const demoAccounts = [
  {
    role: "Employee",
    email: "employee@demo.com",
    password: "Employee123",
    path: "/employee",
    description: "Create goals, submit for approval, and log quarterly achievements.",
    icon: Target,
    gradient: "from-blue-600 to-indigo-600",
    iconColor: "text-blue-600",
    bgIcon: "bg-blue-50",
    hoverBorder: "hover:border-blue-200",
  },
  {
    role: "Manager",
    email: "manager@demo.com",
    password: "Manager123",
    path: "/manager",
    description: "Review team goals, approve work, and conduct check-ins.",
    icon: Users,
    gradient: "from-violet-600 to-purple-600",
    iconColor: "text-violet-600",
    bgIcon: "bg-violet-50",
    hoverBorder: "hover:border-violet-200",
  },
  {
    role: "Admin / HR",
    email: "admin@demo.com",
    password: "Admin123",
    path: "/admin",
    description: "Configure cycles, manage hierarchy, and oversee analytics.",
    icon: ShieldCheck,
    gradient: "from-emerald-600 to-teal-600",
    iconColor: "text-emerald-600",
    bgIcon: "bg-emerald-50",
    hoverBorder: "hover:border-emerald-200",
  },
];

function getRedirectPath(user: User | null) {
  if (user?.role === "admin") return "/admin";
  if (user?.role === "manager") return "/manager";
  return "/employee";
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, user, isAuthenticated } = useAuthStore();
  const [form, setForm] = useState<LoginPayload>({
    email: "",
    password: "",
  });
  const [activeDemo, setActiveDemo] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getRedirectPath(user));
    }
  }, [isAuthenticated, router, user]);

  async function submitLogin(payload = form) {
    try {
      await login(payload);
      const user = useAuthStore.getState().user;
      toast.success(`Welcome back, ${user?.full_name ?? user?.role ?? "User"}!`);
      router.push(getRedirectPath(user));
    } catch {
      toast.error(
        "Unable to sign in. Make sure the backend is running, then try again.",
      );
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-violet-50/40 blur-3xl" />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-8">
        {/* ─── Left — Hero ────────────────────────────────────── */}
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-4 py-1.5 text-sm font-medium text-blue-700 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-blue-500" />
            Enterprise Performance Management
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
                AL
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
                  Aligno
                </p>
                <p className="text-sm text-slate-500">
                  Goal Setting & Tracking Portal
                </p>
              </div>
            </div>

            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl">
              Goals, approvals &{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                check-ins
              </span>{" "}
              in one portal.
            </h1>
            <p className="max-w-lg text-base leading-7 text-slate-500">
              Replace spreadsheet-driven appraisal workflows with role-based
              goal creation, manager governance, quarterly progress tracking,
              and HR-ready analytics.
            </p>
          </div>

          {/* Feature pills */}
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: CheckCircle2, label: "Weightage validation (100%)", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Layers, label: "Shared departmental KPIs", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: TrendingUp, label: "Q1–Q4 achievement tracking", color: "text-violet-600", bg: "bg-violet-50" },
              { icon: Zap, label: "Auto-computed progress scores", color: "text-amber-600", bg: "bg-amber-50" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-slate-200"
              >
                <div className={`rounded-lg ${item.bg} p-1.5`}>
                  <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                </div>
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "100%", sub: "Weightage Check", color: "from-blue-600 to-blue-400" },
              { value: "Q1–Q4", sub: "Full Cycle Coverage", color: "from-violet-600 to-violet-400" },
              { value: "3", sub: "Role Portals", color: "from-emerald-600 to-emerald-400" },
            ].map((item) => (
              <div
                key={item.sub}
                className="rounded-xl border border-slate-100 bg-white/70 p-4 shadow-sm backdrop-blur-sm"
              >
                <p className={`text-2xl font-extrabold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                  {item.value}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-medium">{item.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Right — Login ──────────────────────────────────── */}
        <section className="space-y-5">
          <Card className="border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-slate-900">Sign in to Aligno</CardTitle>
              <p className="text-sm text-slate-500">
                Use a demo account below or enter credentials manually.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                  className="bg-slate-50/50 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="bg-slate-50/50 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/25"
                disabled={isLoading || !form.email || !form.password}
                onClick={() => submitLogin()}
              >
                {isLoading ? "Signing in..." : "Sign in"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Demo accounts */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
              Quick Access — Demo Accounts
            </p>
            {demoAccounts.map((account, index) => (
              <button
                key={account.email}
                type="button"
                disabled={isLoading}
                onMouseEnter={() => setActiveDemo(index)}
                onMouseLeave={() => setActiveDemo(null)}
                onClick={() => {
                  const payload = { email: account.email, password: account.password };
                  setForm(payload);
                  void submitLogin(payload);
                }}
                className={`group w-full rounded-xl border bg-white/70 p-4 text-left shadow-sm backdrop-blur-sm transition-all duration-300 ${account.hoverBorder} hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${
                  activeDemo === index ? "scale-[1.01] shadow-md border-slate-200" : "border-slate-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl ${account.bgIcon} p-2.5 transition-colors`}>
                    <account.icon className={`h-5 w-5 ${account.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">{account.role}</p>
                      <ChevronRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{account.description}</p>
                    <p className="mt-1.5 font-mono text-xs text-slate-400">
                      {account.email}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
