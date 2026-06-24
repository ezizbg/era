import type { GenerationTask } from '@/entities/generation-task'

export interface QueueState {
  tasks: GenerationTask[]
  loading: boolean
}

export type QueueAction =
  | { type: 'INIT'; tasks: GenerationTask[] }
  | { type: 'TICK_PROGRESS'; id: string; delta: number }
  | { type: 'COMPLETE'; id: string }
  | { type: 'FAIL'; id: string; error: string }
  | { type: 'START'; id: string }
  | { type: 'CANCEL'; id: string }
  | { type: 'RETRY'; id: string }
  | { type: 'REMOVE'; id: string }
  | { type: 'CLEAR_DONE' }

export const initialState: QueueState = {
  tasks: [],
  loading: true,
}

function patch(
  tasks: GenerationTask[],
  id: string,
  updater: (t: GenerationTask) => GenerationTask,
): GenerationTask[] {
  return tasks.map(t => (t.id === id ? updater(t) : t))
}

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case 'INIT':
      return { tasks: action.tasks, loading: false }

    case 'TICK_PROGRESS':
      return {
        ...state,
        tasks: patch(state.tasks, action.id, t => {
          if (t.status !== 'running') return t
          return { ...t, progress: Math.min(100, t.progress + action.delta) }
        }),
      }

    case 'COMPLETE':
      return {
        ...state,
        tasks: patch(state.tasks, action.id, t => {
          if (t.status !== 'running') return t
          return { ...t, status: 'done', progress: 100 }
        }),
      }

    case 'FAIL':
      return {
        ...state,
        tasks: patch(state.tasks, action.id, t => {
          if (t.status !== 'running') return t
          return { ...t, status: 'failed', error: action.error }
        }),
      }

    case 'START':
      return {
        ...state,
        tasks: patch(state.tasks, action.id, t => {
          if (t.status !== 'queued') return t
          return { ...t, status: 'running' }
        }),
      }

    case 'CANCEL':
      return {
        ...state,
        tasks: patch(state.tasks, action.id, t => {
          if (t.status !== 'running' && t.status !== 'queued') return t
          return { ...t, status: 'cancelled' }
        }),
      }

    case 'RETRY':
      return {
        ...state,
        tasks: patch(state.tasks, action.id, t => {
          if (t.status !== 'failed' && t.status !== 'cancelled') return t
          return { ...t, status: 'queued', progress: 0, error: undefined }
        }),
      }

    case 'REMOVE':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.id),
      }

    case 'CLEAR_DONE':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.status !== 'done'),
      }

    default:
      return state
  }
}
