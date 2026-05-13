import type { Note, NoteInput } from '~/types'

export function useNotes() {
  const notes = useState<Note[]>('notes', () => [])
  const user = useState('auth-user', () => null)
  const loading = ref(false)

  async function fetchNotes(search = '') {
    loading.value = true
    try {
      const response = await $fetch<{ notes: Note[] }>('/api/notes', {
        query: search ? { search } : undefined,
      })
      notes.value = response.notes
      return notes.value
    } catch (eventError) {
      if (isUnauthorized(eventError)) {
        notes.value = []
        user.value = null
        return notes.value
      }

      throw eventError
    } finally {
      loading.value = false
    }
  }

  async function createNote(payload: NoteInput) {
    const response = await $fetch<{ note: Note }>('/api/notes', {
      method: 'POST',
      body: payload,
    })
    notes.value = [response.note, ...notes.value].sort(sortNotes)
    return response.note
  }

  async function updateNote(id: string, payload: NoteInput) {
    const response = await $fetch<{ note: Note }>(`/api/notes/${id}`, {
      method: 'PUT',
      body: payload,
    })
    notes.value = notes.value.map((note) => (note.id === id ? response.note : note)).sort(sortNotes)
    return response.note
  }

  async function deleteNote(id: string) {
    await $fetch(`/api/notes/${id}`, { method: 'DELETE' })
    notes.value = notes.value.filter((note) => note.id !== id)
  }

  return {
    notes,
    loading,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  }
}

function sortNotes(a: Note, b: Note) {
  if (a.pinned !== b.pinned) {
    return a.pinned ? -1 : 1
  }

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

function isUnauthorized(eventError: unknown) {
  return (
    typeof eventError === 'object' &&
    eventError !== null &&
    'statusCode' in eventError &&
    eventError.statusCode === 401
  )
}
