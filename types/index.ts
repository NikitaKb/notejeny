export type User = {
  id: string
  username: string
  email: string
}

export type Note = {
  id: string
  title: string
  content: string
  category: NoteCategory
  reminderDate: string | null
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export type NoteCategory = 'work' | 'ideas' | 'personal' | 'urgent'

export type NoteInput = {
  title: string
  content: string
  category: NoteCategory
  reminderDate: string | null
  pinned: boolean
}
