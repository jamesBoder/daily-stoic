import { Quote } from './quote'

export interface Week {
  id: number
  start_date: string
  end_date: string
  theme: string
  title: string
  description: string
  quotes?: Quote[]
}
