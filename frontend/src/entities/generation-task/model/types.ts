export type GenType = 'image' | 'video' | 'text' | 'audio'

export type TaskStatus = 'queued' | 'running' | 'done' | 'failed' | 'cancelled'

export interface GenerationTask {
  id: string
  prompt: string
  model: string
  type: GenType
  status: TaskStatus
  progress: number
  createdAt: number
  credits: number
  error?: string
  durationMs: number
}
