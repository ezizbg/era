import type { GenerationTask, TaskStatus } from '@/entities/generation-task'

export interface QueueStats {
  queued: number
  running: number
  done: number
  failed: number
}

export function getStats(tasks: GenerationTask[]): QueueStats {
  return {
    queued: tasks.filter(t => t.status === 'queued').length,
    running: tasks.filter(t => t.status === 'running').length,
    done: tasks.filter(t => t.status === 'done').length,
    failed: tasks.filter(t => t.status === 'failed').length,
  }
}

export function filterByStatus(
  tasks: GenerationTask[],
  filter: TaskStatus | 'all',
): GenerationTask[] {
  if (filter === 'all') return tasks
  return tasks.filter(t => t.status === filter)
}

export function sortTasks(
  tasks: GenerationTask[],
  sort: 'newest' | 'oldest',
): GenerationTask[] {
  return [...tasks].sort((a, b) =>
    sort === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt,
  )
}

export function searchTasks(tasks: GenerationTask[], query: string): GenerationTask[] {
  if (!query.trim()) return tasks
  const q = query.toLowerCase()
  return tasks.filter(t => t.prompt.toLowerCase().includes(q))
}

export function getActiveTasks(tasks: GenerationTask[]): GenerationTask[] {
  return tasks.filter(t => t.status === 'running' || t.status === 'queued')
}

export function getAverageProgress(tasks: GenerationTask[]): number {
  const active = getActiveTasks(tasks)
  if (active.length === 0) return 0
  const total = active.reduce((sum, t) => sum + t.progress, 0)
  return Math.round(total / active.length)
}
