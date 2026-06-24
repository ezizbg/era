import {
  Image as LucideImage,
  Play,
  MessageSquare,
  Music,
  X,
  RotateCcw,
  Download,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type {
  GenerationTask,
  TaskStatus,
  GenType,
} from "@/entities/generation-task";

interface TaskCardProps {
  task: GenerationTask;
  queuePosition?: number;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
}

const TYPE_CONFIG: Record<
  GenType,
  { Icon: React.ElementType; bg: string; color: string }
> = {
  image: { Icon: LucideImage, bg: "bg-amber-950/50", color: "text-amber-500" },
  video: {
    Icon: Play,
    bg: "bg-orange-950/50",
    color: "text-[var(--c-accent)]",
  },
  text: {
    Icon: MessageSquare,
    bg: "bg-stone-800/60",
    color: "text-[var(--c-fg-mute)]",
  },
  audio: { Icon: Music, bg: "bg-purple-950/50", color: "text-purple-400" },
};

const STATUS_BADGE: Record<TaskStatus, { label: string; cls: string }> = {
  running: {
    label: "Идёт",
    cls: "bg-[var(--c-accent)]/30 text-[var(--c-accent)]",
  },
  done: { label: "Готово", cls: "bg-emerald-500/20 text-[#34D399]" },
  failed: { label: "Ошибка", cls: "bg-red-500/20 text-[#FF6B6B]" },
  queued: {
    label: "В очереди",
    cls: "border border-[var(--c-line)] text-[var(--c-fg-mute)]",
  },
  cancelled: { label: "Отменено", cls: "text-[var(--c-fg-mute)]" },
};

function fmtDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s} сек` : `${Math.round(s / 60)} мин`;
}

function getMeta(task: GenerationTask, queuePosition?: number): string {
  switch (task.status) {
    case "running":
      return `≈ ${fmtDuration(task.durationMs)} · ${task.credits} ср`;
    case "queued":
      return queuePosition
        ? `позиция ${queuePosition} в очереди · ${task.credits} ср`
        : `в очереди · ${task.credits} ср`;
    case "done":
      return `готово за ${fmtDuration(task.durationMs)} · ${task.credits} ср`;
    case "failed":
      return task.error ?? "ошибка генерации";
    case "cancelled":
      return "отменено пользователем";
  }
}

const BTN =
  "flex items-center justify-center w-8 h-8 rounded-sm bg-[var(--c-bg)] text-[var(--c-fg-mute)] hover:text-[var(--c-fg)] hover:bg-[var(--c-line)] transition-colors";

export function TaskCard({
  task,
  queuePosition,
  onCancel,
  onRetry,
}: TaskCardProps) {
  const { Icon, bg, color } = TYPE_CONFIG[task.type];
  const badge = STATUS_BADGE[task.status];

  return (
    <div
      className={cn(
        "rounded-md bg-[var(--c-bg-1)] border overflow-hidden",
        task.status === "running"
          ? "border-[var(--c-accent)]"
          : "border-[var(--c-line)]",
      )}
    >
      {/* Content */}
      <div className="flex items-start gap-3 p-3 pb-2">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            bg,
          )}
        >
          <Icon size={20} className={color} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-medium text-[var(--c-fg)] leading-snug">
            {task.prompt}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full bg-[var(--c-bg)] border border-[var(--c-line)] text-xs text-[var(--c-fg-mute)] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--c-accent)] shrink-0" />
              {task.model}
            </span>
            <span className="text-xs text-[var(--c-fg-mute)] truncate">
              {getMeta(task, queuePosition)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar (between content and actions) */}
      {task.status === "running" && (
        <div className="px-3">
          <div className="h-1 rounded-full bg-[var(--c-line)] overflow-hidden">
            <div
              className="h-full bg-[var(--c-accent)] transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center justify-between px-3 py-2.5">
        {/* Badge + % on left */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium whitespace-nowrap",
              badge.cls,
            )}
          >
            {badge.label}
          </span>
          {task.status === "running" && (
            <span className="text-xs font-semibold text-[var(--c-accent)]">
              {Math.round(task.progress)}%
            </span>
          )}
        </div>

        {/* Buttons on right */}
        <div className="flex items-center gap-1">
          {(task.status === "running" || task.status === "queued") && (
            <button
              className={BTN}
              onClick={() => onCancel(task.id)}
              aria-label="Отменить"
            >
              <X size={15} />
            </button>
          )}
          {(task.status === "failed" || task.status === "cancelled") && (
            <button
              className={cn(BTN, "text-[#FF7A3D]")}
              onClick={() => onRetry(task.id)}
              aria-label="Повторить"
            >
              <RotateCcw size={15} />
            </button>
          )}
          {task.status === "done" && (
            <button className={BTN} aria-label="Скачать">
              <Download size={15} />
            </button>
          )}
          <button className={BTN} aria-label="Дополнительно">
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
