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
  tags: string[]
  actions: NoteAction[]
  relatedNotes: RelatedNote[]
  createdAt: string
  updatedAt: string
}

export type NoteAction = {
  id: string
  text: string
  completed: boolean
}

export type RelatedNote = {
  id: string
  title: string
}

export type NoteCategory = 'work' | 'ideas' | 'personal' | 'urgent'

export type NoteInput = {
  title: string
  content: string
  category: NoteCategory
  reminderDate: string | null
  pinned: boolean
  actions?: NoteAction[]
}
