import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  applicationSchema,
  STATUSES,
  STATUS_LABEL,
  type Application,
  type ApplicationInput,
} from "@/lib/applications";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  onSubmit: (values: ApplicationInput) => void;
  submitting: boolean;
};

const empty: ApplicationInput = {
  company: "",
  position: "",
  location: "",
  salary: "",
  applied_at: new Date().toISOString().slice(0, 10),
  job_description: "",
  notes: "",
  status: "applied",
};

export function ApplicationDialog({
  open,
  onOpenChange,
  application,
  onSubmit,
  submitting,
}: Props) {
  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: empty,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      application
        ? {
            company: application.company,
            position: application.position,
            location: application.location ?? "",
            salary: application.salary ?? "",
            applied_at: application.applied_at,
            job_description: application.job_description ?? "",
            notes: application.notes ?? "",
            status: application.status,
          }
        : empty,
    );
  }, [open, application, form]);

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{application ? "Edit application" : "Add application"}</DialogTitle>
          <DialogDescription>
            Keep the details you'll want when the recruiter finally replies.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Company</Label>
              <Input {...form.register("company")} />
              {errors.company && (
                <p className="text-destructive text-xs">{errors.company.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input {...form.register("position")} />
              {errors.position && (
                <p className="text-destructive text-xs">{errors.position.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="Remote / Berlin" {...form.register("location")} />
            </div>
            <div className="space-y-2">
              <Label>Salary</Label>
              <Input placeholder="$120k – $150k" {...form.register("salary")} />
            </div>
            <div className="space-y-2">
              <Label>Application date</Label>
              <Input type="date" {...form.register("applied_at")} />
              {errors.applied_at && (
                <p className="text-destructive text-xs">{errors.applied_at.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) =>
                  form.setValue("status", v as ApplicationInput["status"], {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Job description</Label>
            <Textarea rows={5} {...form.register("job_description")} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={3} {...form.register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={submitting}>
              {application ? "Save changes" : "Add application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
