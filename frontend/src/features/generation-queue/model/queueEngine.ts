import type { QueueState, QueueAction } from './queueReducer'

const MAX_CONCURRENT = 2

const FAIL_ERRORS = [
  'Недостаточно кредитов',
  'Превышен лимит запросов',
  'Ошибка соединения с API',
  'Таймаут генерации',
  'Неверный формат запроса',
]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function startEngine(
  dispatch: (action: QueueAction) => void,
  getState: () => QueueState,
): () => void {
  const id = setInterval(() => {
    const { tasks } = getState()

    const running = tasks.filter(t => t.status === 'running')
    const queued = tasks
      .filter(t => t.status === 'queued')
      .sort((a, b) => a.createdAt - b.createdAt)

    // Track how many running tasks finish this tick to correctly fill free slots
    let freed = 0

    for (const task of running) {
      if (Math.random() < 0.15) {
        const error = FAIL_ERRORS[Math.floor(Math.random() * FAIL_ERRORS.length)]
        dispatch({ type: 'FAIL', id: task.id, error })
        freed++
        continue
      }

      let delta = randomInt(3, 8)
      if (task.type === 'video' || task.type === 'audio') {
        delta = delta / 2.5
      }

      if (task.progress + delta >= 100) {
        dispatch({ type: 'COMPLETE', id: task.id })
        freed++
      } else {
        dispatch({ type: 'TICK_PROGRESS', id: task.id, delta })
      }
    }

    const freeSlots = MAX_CONCURRENT - (running.length - freed)
    if (freeSlots > 0 && queued.length > 0) {
      queued.slice(0, freeSlots).forEach(task => {
        dispatch({ type: 'START', id: task.id })
      })
    }
  }, 500)

  return () => clearInterval(id)
}
