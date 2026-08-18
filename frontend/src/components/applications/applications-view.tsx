import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, LayoutGrid, Table2, Loader2 } from "lucide-react";

import {
  useApplications,
  useCreateApplication,
  useDeleteApplication,
  useUpdateApplication,
  useUpdateStatus,
} from "@/hooks/useApplications";
import {
  STATUSES,
  STATUS_LABEL,
  type Application,
  type Status,
  type ApplicationInput,
} from "@/services/application.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationDialog } from "./application-dialog";
import { KanbanBoard } from "./kanban-board";
import { ApplicationsTable } from "./applications-table";

type SortKey = "recent" | "oldest" | "company";

export function ApplicationsView() {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);

  // ✅ Use hooks
  const { data: applications, isLoading } = useApplications();
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();
  const deleteMutation = useDeleteApplication();
  const statusMutation = useUpdateStatus();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = (applications ?? []).filter((a) => {
      const matchesQuery =
        !q ||
        a.company.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q) ||
        (a.location ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
    rows = [...rows].sort((a, b) => {
      if (sort === "company") return a.company.localeCompare(b.company);
      if (sort === "oldest") return a.applied_at.localeCompare(b.applied_at);
      return b.applied_at.localeCompare(a.applied_at);
    });
    return rows;
  }, [applications, query, statusFilter, sort]);

  const handleSubmit = (values: ApplicationInput) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: values });
    } else {
      createMutation.mutate(values);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this application?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: string, status: Status) => {
    statusMutation.mutate({ id, status });
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (application: Application) => {
    setEditing(application);
    setDialogOpen(true);
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    statusMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
          <p className="text-muted-foreground text-sm">
            Track every role you've applied to in one pipeline.
          </p>
        </div>
        <Button variant="hero" onClick={openCreate} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          <Plus className="size-4" /> Add application
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            placeholder="Search company, role, location"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as Status | "all")}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="company">Company A–Z</SelectItem>
          </SelectContent>
        </Select>

        <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "table")}>
          <TabsList>
            <TabsTrigger value="kanban">
              <LayoutGrid className="mr-1.5 size-4" /> Board
            </TabsTrigger>
            <TabsTrigger value="table">
              <Table2 className="mr-1.5 size-4" /> Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : view === "kanban" ? (
        <KanbanBoard
          applications={filtered}
          onEdit={openEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <ApplicationsTable
          applications={filtered}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <ApplicationDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        application={editing}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}