import {
  Image as LucideImage,
  Play,
  MessageSquare,
  Music,
  X,
  RotateCcw,
  Download,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { GenerationTask, TaskStatus, GenType } from '@/entities/generation-task'

interface TaskRowProps {
  task: GenerationTask
  queuePosition?: number
  onCancel: (id: string) => void
  onRetry: (id: string) => void
}

const TYPE_CONFIG: Record<GenType, { Icon: React.ElementType; bg: string; color: string }> = {
  image: { Icon: LucideImage, bg: 'bg-amber-950/50', color: 'text-amber-500' },
  video: { Icon: Play, bg: 'bg-orange-950/50', color: 'text-[var(--c-accent)]' },
  text: { Icon: MessageSquare, bg: 'bg-stone-800/60', color: 'text-[var(--c-fg-mute)]' },
  audio: { Icon: Music, bg: 'bg-purple-950/50', color: 'text-purple-400' },
}

const STATUS_BADGE: Record<TaskStatus, { label: string; cls: string }> = {
  running: { label: 'Идёт', cls: 'bg-[var(--c-accent)]/30 text-[var(--c-accent)]' },
  done: { label: 'Готово', cls: 'bg-emerald-500/20 text-[#34D399]' },
  failed: { label: 'Ошибка', cls: 'bg-red-500/20 text-[#FF6B6B]' },
  queued: { label: 'В очереди', cls: 'border border-[var(--c-line)] text-[var(--c-fg-mute)]' },
  cancelled: { label: 'Отменено', cls: 'text-[var(--c-fg-mute)]' },
}

function fmtDuration(ms: number): string {
  const s = Math.round(ms / 1000)
  return s < 60 ? `${s} сек` : `${Math.round(s / 60)} мин`
}

function getMeta(task: GenerationTask, queuePosition?: number): string {
  switch (task.status) {
    case 'running':
      return `≈ ${fmtDuration(task.durationMs)} · ${task.credits} ср`
    case 'queued':
      return queuePosition
        ? `позиция ${queuePosition} в очереди · ${task.credits} ср`
        : `в очереди · ${task.credits} ср`
    case 'done':
      return `готово за ${fmtDuration(task.durationMs)} · ${task.credits} ср`
    case 'failed':
      return task.error ?? 'ошибка генерации'
    case 'cancelled':
      return 'отменено пользователем'
  }
}

const BTN = 'flex items-center justify-center w-7 h-7 rounded-sm bg-[var(--c-bg)] text-[var(--c-fg-mute)] hover:text-[var(--c-fg)] hover:bg-[var(--c-line)] transition-colors'

export function TaskRow({ task, queuePosition, onCancel, onRetry }: TaskRowProps) {
  const { Icon, bg, color } = TYPE_CONFIG[task.type]
  const badge = STATUS_BADGE[task.status]

  return (
    <div className={cn('rounded-md bg-[var(--c-bg-1)] border', task.status === 'running' ? 'border-[var(--c-accent)]' : 'border-[var(--c-line)]')}>
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Icon */}
        <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center shrink-0', bg)}>
          <Icon size={22} className={color} />
        </div>

        {/* Center — title + model row + progress bar */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--c-fg)] truncate">{task.prompt}</p>
          <div className="flex items-center gap-2 mt-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full bg-[var(--c-bg)] border border-[var(--c-line)] text-xs text-[var(--c-fg-mute)] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--c-accent)] shrink-0" />
              {task.model}
            </span>
            <span className="text-xs text-[var(--c-fg-mute)] truncate">
              {getMeta(task, queuePosition)}
            </span>
          </div>
          {/* Progress bar under model row */}
          {task.status === 'running' && (
            <div className="mt-2 h-1 rounded-full bg-[var(--c-line)] overflow-hidden">
              <div
                className="h-full bg-[var(--c-accent)] transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          {task.status === 'running' && (
            <span className="text-sm font-semibold text-[var(--c-accent)] w-10 text-right">
              {Math.round(task.progress)}%
            </span>
          )}

          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium whitespace-nowrap', badge.cls)}>
            {badge.label}
          </span>

          <div className="flex items-center gap-1 ml-1">
            {(task.status === 'running' || task.status === 'queued') && (
              <button className={BTN} onClick={() => onCancel(task.id)} aria-label="Отменить">
                <X size={14} />
              </button>
            )}
            {(task.status === 'failed' || task.status === 'cancelled') && (
              <button className={cn(BTN, 'text-[#FF7A3D]')} onClick={() => onRetry(task.id)} aria-label="Повторить">
                <RotateCcw size={14} />
              </button>
            )}
            {task.status === 'done' && (
              <button className={BTN} aria-label="Скачать">
                <Download size={14} />
              </button>
            )}
            <button className={BTN} aria-label="Дополнительно">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
