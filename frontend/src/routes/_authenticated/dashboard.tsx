import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Briefcase, CalendarCheck, Trophy, Percent, ArrowRight } from "lucide-react";

import {
  applicationsQueryKey,
  fetchApplications,
  STATUSES,
  STATUS_LABEL,
  type Application,
} from "@/lib/applications";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — JobPilot AI" },
      {
        name: "description",
        content: "See your job search momentum: pipeline stats, response rate, and trends.",
      },
      { property: "og:title", content: "Dashboard — JobPilot AI" },
      {
        property: "og:description",
        content: "See your job search momentum: pipeline stats, response rate, and trends.",
      },
    ],
  }),
  component: DashboardPage,
});

const COLORS = ["var(--primary)", "var(--accent)", "var(--success)", "var(--destructive)"];

function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: applicationsQueryKey,
    queryFn: fetchApplications,
  });

  const apps: Application[] = data ?? [];
  const total = apps.length;
  const interviews = apps.filter((a) => a.status === "interview").length;
  const offers = apps.filter((a) => a.status === "offer").length;
  const responseRate = total
    ? Math.round(((interviews + offers) / total) * 100)
    : 0;

  const byStatus = STATUSES.map((s) => ({
    name: STATUS_LABEL[s],
    value: apps.filter((a) => a.status === s).length,
  }));

  const byMonth = buildMonthly(apps);

  const stats = [
    { label: "Total applications", value: total, icon: Briefcase },
    { label: "Interviews", value: interviews, icon: CalendarCheck },
    { label: "Offers", value: offers, icon: Trophy },
    { label: "Response rate", value: `${responseRate}%`, icon: Percent },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Your search at a glance — momentum, outcomes, and what needs a nudge.
          </p>
        </div>
        <Button asChild variant="hero">
          <Link to="/applications">
            Open tracker <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass shadow-card rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">{stat.label}</span>
                <span className="bg-primary/15 text-primary flex size-8 items-center justify-center rounded-lg">
                  <stat.icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass shadow-card rounded-2xl p-5 lg:col-span-2">
          <h2 className="text-sm font-medium">Applications over time</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass shadow-card rounded-2xl p-5">
          <h2 className="text-sm font-medium">Pipeline split</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={84}
                  paddingAngle={4}
                >
                  {byStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass shadow-card rounded-2xl p-5 lg:col-span-3">
          <h2 className="text-sm font-medium">Stage breakdown</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {byStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildMonthly(apps: Application[]) {
  const months: { month: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      month: d.toLocaleString("en", { month: "short" }),
      count: apps.filter((a) => a.applied_at.startsWith(key)).length,
    });
  }
  return months;
}
