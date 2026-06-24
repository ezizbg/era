import { Fragment, useEffect, useState } from 'react'
import { Skeleton } from '@/shared/ui/skeleton'
import type { TaskStatus } from '@/entities/generation-task'
import {
  useQueue,
  filterByStatus,
  sortTasks,
  QueueStats,
  QueueToolbar,
  TaskRow,
  TaskCard,
} from '@/features/generation-queue'

type FilterOption = 'all' | TaskStatus

export function GenerationQueue() {
  const { tasks, loading, stats, cancel, retry, clearDone } = useQueue()
  const [filter, setFilter] = useState<FilterOption>('all')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')

  useEffect(() => {
    document.title = 'ERA2 — Очередь'
    return () => { document.title = 'ERA2' }
  }, [])

  const queuedByAge = tasks
    .filter(t => t.status === 'queued')
    .sort((a, b) => a.createdAt - b.createdAt)

  const displayed = sortTasks(filterByStatus(tasks, filter), sort)

  function getQueuePos(id: string): number | undefined {
    const idx = queuedByAge.findIndex(t => t.id === id)
    return idx >= 0 ? idx + 1 : undefined
  }

  return (
    <div className="min-h-[calc(100vh-var(--header-height,64px))]">
      <div className="max-w-[1120px] mx-auto px-4 md:px-10 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-[var(--c-fg)]">Очередь генераций</h1>
            <p className="text-sm text-[var(--c-fg-mute)] mt-1">
              Все ваши задачи в реальном времени
            </p>
          </div>
          {stats.done > 0 && (
            <button
              onClick={clearDone}
              className="hidden sm:inline-flex items-center px-4 h-9 rounded-xl text-sm font-medium whitespace-nowrap border border-[var(--c-line)] text-[var(--c-fg-mute)] hover:text-[var(--c-fg)] hover:border-[var(--c-fg-mute)] transition-colors shrink-0 ml-4"
            >
              Очистить готовые
            </button>
          )}
        </div>

        {/* Stats */}
        <QueueStats stats={stats} />

        {/* Toolbar */}
        <div className="mt-6 mb-4">
          <QueueToolbar
            filter={filter}
            sort={sort}
            onFilterChange={setFilter}
            onSortChange={setSort}
          />
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {loading && Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] rounded-md" />
          ))}

          {!loading && displayed.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[var(--c-fg-mute)]">Нет задач</p>
            </div>
          )}

          {!loading && displayed.map(task => (
            <Fragment key={task.id}>
              {/* ≥ 768px — горизонтальная строка */}
              <div className="hidden md:block">
                <TaskRow
                  task={task}
                  queuePosition={task.status === 'queued' ? getQueuePos(task.id) : undefined}
                  onCancel={cancel}
                  onRetry={retry}
                />
              </div>
              {/* < 768px — карточка */}
              <div className="md:hidden">
                <TaskCard
                  task={task}
                  queuePosition={task.status === 'queued' ? getQueuePos(task.id) : undefined}
                  onCancel={cancel}
                  onRetry={retry}
                />
              </div>
            </Fragment>
          ))}
        </div>

      </div>
    </div>
  )
}
