import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { motion } from "motion/react";
import { Building2, MapPin, Wallet, Pencil, Trash2 } from "lucide-react";

import { STATUSES, STATUS_LABEL, type Application, type Status } from "@/lib/applications";
import { Button } from "@/components/ui/button";

type Props = {
  applications: Application[];
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
};

const accent: Record<Status, string> = {
  applied: "bg-primary",
  interview: "bg-accent",
  offer: "bg-success",
  rejected: "bg-destructive",
};

const dropAnimation: DropAnimation = {
  duration: 220,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.4" } },
  }),
};

export function KanbanBoard({ applications, onEdit, onDelete, onStatusChange }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 10 } }),
    useSensor(KeyboardSensor),
  );

  const active = applications.find((a) => a.id === activeId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const over = event.over;
    if (!over) return;
    const status = String(over.id) as Status;
    const card = applications.find((a) => a.id === String(event.active.id));
    if (!card || card.status === status) return;
    onStatusChange(card.id, status);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            dragging={activeId !== null}
            applications={applications.filter((a) => a.status === status)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {active ? (
          <div className="glass shadow-glow w-72 rotate-2 cursor-grabbing rounded-2xl p-4">
            <p className="font-medium">{active.position}</p>
            <p className="text-muted-foreground text-sm">{active.company}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}


function Column({
  status,
  applications,
  dragging,
  onEdit,
  onDelete,
}: {
  status: Status;
  applications: Application[];
  dragging: boolean;
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`bg-card/40 flex min-h-[280px] flex-col gap-3 rounded-2xl border p-3 transition-all duration-200 ${
        isOver
          ? "border-primary/60 bg-primary/5 shadow-glow"
          : dragging
            ? "border-border/60 border-dashed"
            : "border-border/60"
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${accent[status]}`} />
          <span className="text-sm font-medium">{STATUS_LABEL[status]}</span>
        </div>
        <span className="text-muted-foreground text-xs">{applications.length}</span>
      </div>

      {applications.length === 0 ? (
        <p className="text-muted-foreground/70 px-1 py-6 text-center text-xs">
          {dragging ? "Drop here" : "No applications yet"}
        </p>
      ) : (
        applications.map((application) => (
          <Card
            key={application.id}
            application={application}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}

      {dragging && applications.length > 0 && (
        <div
          className={`rounded-xl border border-dashed py-3 text-center text-[11px] transition-colors ${
            isOver ? "border-primary/60 text-primary" : "border-border/60 text-muted-foreground/60"
          }`}
        >
          Drop here
        </div>
      )}
    </div>
  );
}

function Card({
  application,
  onEdit,
  onDelete,
}: {
  application: Application;
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: application.id });

  return (
    <motion.div
      ref={setNodeRef}
      layout
      transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.6 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.3 : 1, y: 0, scale: isDragging ? 0.97 : 1 }}
      whileHover={{ y: -2 }}
      className="glass group shadow-card hover:border-primary/40 touch-none rounded-xl p-3 transition-colors select-none active:cursor-grabbing"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
      {...listeners}
      {...attributes}
      aria-label={`${application.position} at ${application.company}. Drag anywhere on the card to change status.`}
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{application.position}</p>
        <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
          <Building2 className="size-3" /> {application.company}
        </p>
        <div className="text-muted-foreground/80 mt-2 flex flex-wrap gap-3 text-[11px]">
          {application.location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3" /> {application.location}
            </span>
          )}
          {application.salary && (
            <span className="flex items-center gap-1">
              <Wallet className="size-3" /> {application.salary}
            </span>
          )}
        </div>
      </div>


      <div className="mt-3 flex items-center justify-between">
        <span className="text-muted-foreground/70 text-[11px]">{application.applied_at}</span>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Edit application"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onEdit(application)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Delete application"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(application.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

