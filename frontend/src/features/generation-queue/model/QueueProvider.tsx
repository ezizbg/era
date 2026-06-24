import { createContext, useReducer, useEffect, useRef, type ReactNode } from 'react'
import { SEED_TASKS, type GenerationTask } from '@/entities/generation-task'
import { queueReducer, initialState, type QueueState, type QueueAction } from './queueReducer'
import { startEngine } from './queueEngine'

const LS_KEY = 'era2-queue'

export interface QueueContextValue {
  state: QueueState
  dispatch: React.Dispatch<QueueAction>
}

export const QueueContext = createContext<QueueContextValue | null>(null)

export function QueueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, initialState)

  const stateRef = useRef<QueueState>(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined

    const stored = localStorage.getItem(LS_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GenerationTask[]
        const restored = parsed.map(t =>
          t.status === 'running' ? { ...t, status: 'queued' as const } : t,
        )
        dispatch({ type: 'INIT', tasks: restored })
      } catch {
        timer = setTimeout(() => dispatch({ type: 'INIT', tasks: SEED_TASKS }), 600)
      }
    } else {
      timer = setTimeout(() => dispatch({ type: 'INIT', tasks: SEED_TASKS }), 600)
    }

    const stop = startEngine(dispatch, () => stateRef.current)

    return () => {
      clearTimeout(timer)
      stop()
    }
  }, [])

  useEffect(() => {
    if (!state.loading) {
      localStorage.setItem(LS_KEY, JSON.stringify(state.tasks))
    }
  }, [state])

  return (
    <QueueContext.Provider value={{ state, dispatch }}>
      {children}
    </QueueContext.Provider>
  )
}
