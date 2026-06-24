import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, ChevronRight } from 'lucide-react'
import { useNavigate } from '@/shared/routing'
import { cn } from '@/shared/lib/utils'
import { useQueue } from '../model/useQueue'
import { getActiveTasks, getAverageProgress } from '../model/selectors'

export function StatusBar() {
  const navigate = useNavigate()
  const { tasks } = useQueue()

  const active = getActiveTasks(tasks).sort((a, b) => {
    if (a.status === 'running' && b.status !== 'running') return -1
    if (b.status === 'running' && a.status !== 'running') return 1
    return b.progress - a.progress
  })

  const avgProgress = getAverageProgress(tasks)
  const isSingle = active.length === 1

  return (
    <AnimatePresence>
      {active.length > 0 && (
        <motion.div
          key="status-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'fixed z-50',
            'bottom-0 left-0 right-0',
            'lg:bottom-6 lg:left-auto lg:right-6 lg:w-80',
            'bg-[var(--c-bg-1)] border border-[var(--c-line)]',
            'rounded-t-2xl lg:rounded-2xl shadow-2xl',
            'p-4',
          )}
        >
          {isSingle ? (
            <SingleTask task={active[0]} />
          ) : (
            <MultiTask
              active={active}
              avgProgress={avgProgress}
              onOpen={() => navigate('/queue')}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Single task view ────────────────────────────────────────────────────────

interface SingleTaskProps {
  task: ReturnType<typeof getActiveTasks>[number]
}

function SingleTask({ task }: SingleTaskProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Loader2 size={14} className="text-[var(--c-accent)] animate-spin shrink-0" />
        <span className="text-sm text-[var(--c-fg)] truncate flex-1">{task.prompt}</span>
        {task.status === 'running' && (
          <span className="text-sm font-semibold text-[var(--c-fg)] shrink-0">
            {Math.round(task.progress)}%
          </span>
        )}
      </div>
      <div className="h-1 bg-[var(--c-line)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--c-accent)] transition-all duration-300 rounded-full"
          style={{ width: `${task.status === 'running' ? task.progress : 0}%` }}
        />
      </div>
    </div>
  )
}

// ─── Multiple tasks view ─────────────────────────────────────────────────────

interface MultiTaskProps {
  active: ReturnType<typeof getActiveTasks>
  avgProgress: number
  onOpen: () => void
}

function MultiTask({ active, avgProgress, onOpen }: MultiTaskProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-[var(--c-fg)]">Генерации идут</p>
          <p className="text-xs text-[var(--c-fg-mute)]">
            {active.length} активны · {avgProgress}%
          </p>
        </div>
        <Loader2 size={16} className="text-[var(--c-accent)] animate-spin" />
      </div>

      <div className="space-y-2.5 mb-3">
        {active.slice(0, 3).map(task => (
          <div key={task.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[var(--c-fg-mute)] truncate flex-1 mr-2">
                {task.prompt}
              </span>
              {task.status === 'running' && (
                <span className="text-xs text-[var(--c-fg-low)] shrink-0">
                  {Math.round(task.progress)}%
                </span>
              )}
            </div>
            <div className="h-0.5 bg-[var(--c-line)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--c-accent)] transition-all duration-300 rounded-full"
                style={{ width: `${task.status === 'running' ? task.progress : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onOpen}
        className="w-full flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium text-[var(--c-accent)] hover:bg-[var(--c-accent)]/10 transition-colors"
      >
        Открыть очередь
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
