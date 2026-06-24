import { cn } from '@/shared/lib/utils'
import type { QueueStats } from '../model/selectors'

interface QueueStatsProps {
  stats: QueueStats
}

const ITEMS = [
  { key: 'queued' as const, label: 'В очереди', dot: 'bg-[var(--c-fg-mute)]' },
  { key: 'running' as const, label: 'Идёт', dot: 'bg-[var(--c-accent)]' },
  { key: 'done' as const, label: 'Готово', dot: 'bg-emerald-400' },
  { key: 'failed' as const, label: 'Ошибка', dot: 'bg-red-400' },
]

export function QueueStats({ stats }: QueueStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {ITEMS.map(({ key, label, dot }) => (
        <div
          key={key}
          className="bg-[var(--c-bg-1)] border border-[var(--c-line)] rounded-md px-4 py-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('w-2 h-2 rounded-full shrink-0', dot)} />
            <span className="text-xs text-[var(--c-fg-mute)]">{label}</span>
          </div>
          <span className="text-2xl font-semibold text-[var(--c-fg)]">{stats[key]}</span>
        </div>
      ))}
    </div>
  )
}
