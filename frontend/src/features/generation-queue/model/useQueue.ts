import { useContext } from 'react'
import { QueueContext } from './QueueProvider'
import { getStats, type QueueStats } from './selectors'
import type { GenerationTask } from '@/entities/generation-task'

export interface UseQueueReturn {
  tasks: GenerationTask[]
  loading: boolean
  stats: QueueStats
  cancel: (id: string) => void
  retry: (id: string) => void
  remove: (id: string) => void
  clearDone: () => void
}

export function useQueue(): UseQueueReturn {
  const ctx = useContext(QueueContext)
  if (!ctx) throw new Error('useQueue must be used within QueueProvider')

  const { state, dispatch } = ctx

  return {
    tasks: state.tasks,
    loading: state.loading,
    stats: getStats(state.tasks),
    cancel: (id) => dispatch({ type: 'CANCEL', id }),
    retry: (id) => dispatch({ type: 'RETRY', id }),
    remove: (id) => dispatch({ type: 'REMOVE', id }),
    clearDone: () => dispatch({ type: 'CLEAR_DONE' }),
  }
}
