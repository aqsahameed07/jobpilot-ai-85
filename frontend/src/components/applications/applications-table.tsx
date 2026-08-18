import { Pencil, Trash2 } from "lucide-react";

import { STATUS_LABEL, type Application, type Status } from "@/lib/applications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  applications: Application[];
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
};

const tone: Record<Status, string> = {
  applied: "bg-primary/15 text-primary border-primary/30",
  interview: "bg-accent/15 text-accent border-accent/30",
  offer: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

export function ApplicationsTable({ applications, onEdit, onDelete }: Props) {
  if (applications.length === 0) {
    return (
      <div className="border-border/60 bg-card/40 rounded-2xl border p-12 text-center">
        <p className="text-muted-foreground text-sm">No applications match your filters.</p>
      </div>
    );
  }

  return (
    <div className="border-border/60 bg-card/40 overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Position</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[90px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.position}</TableCell>
              <TableCell>{a.company}</TableCell>
              <TableCell className="text-muted-foreground">{a.location || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{a.salary || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{a.applied_at}</TableCell>
              <TableCell>
                <Badge variant="outline" className={tone[a.status]}>
                  {STATUS_LABEL[a.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(a)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(a.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
