<script setup lang="ts">
import type { Note, NoteAction, NoteInput } from '~/types'

const { user, logout } = useAuth()
const { notes, loading, fetchNotes, createNote, updateNote, deleteNote } = useNotes()

const search = ref('')
const editorOpen = ref(false)
const editingNote = ref<Note | null>(null)
const saving = ref(false)
const error = ref('')
const notesPerPage = 6
const visibleLimit = ref(notesPerPage)
let searchTimer: ReturnType<typeof setTimeout> | null = null

if (user.value) {
  await fetchNotes()
}

const upcomingReminders = computed(() =>
  notes.value
    .filter((note) => note.reminderDate && new Date(note.reminderDate).getTime() >= Date.now())
    .sort((a, b) => new Date(a.reminderDate as string).getTime() - new Date(b.reminderDate as string).getTime())
    .slice(0, 5),
)

const visibleNotes = computed(() => notes.value.slice(0, visibleLimit.value))
const hiddenNotesCount = computed(() => Math.max(notes.value.length - visibleNotes.value.length, 0))
const notesProgress = computed(() => (
  notes.value.length ? Math.round((visibleNotes.value.length / notes.value.length) * 100) : 0
))

watch(
  search,
  (value) => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }

    searchTimer = setTimeout(async () => {
      visibleLimit.value = notesPerPage
      await fetchNotes(value)
    }, 250)
  },
)

function showMoreNotes() {
  visibleLimit.value += notesPerPage
}

function collapseNotes() {
  visibleLimit.value = notesPerPage
}

function openCreate() {
  editingNote.value = null
  editorOpen.value = true
  error.value = ''
}

function openEdit(note: Note) {
  editingNote.value = note
  editorOpen.value = true
  error.value = ''
}

function openRelated(id: string) {
  const note = notes.value.find((candidate) => candidate.id === id)

  if (note) {
    openEdit(note)
  }
}

async function saveNote(payload: NoteInput) {
  saving.value = true
  error.value = ''

  try {
    if (editingNote.value) {
      await updateNote(editingNote.value.id, payload)
    } else {
      await createNote(payload)
    }

    await fetchNotes(search.value)
    editorOpen.value = false
    editingNote.value = null
  } catch (eventError) {
    error.value = getErrorMessage(eventError)
  } finally {
    saving.value = false
  }
}

async function removeNote(note: Note) {
  if (!confirm(`Удалить заметку "${note.title}"?`)) {
    return
  }

  await deleteNote(note.id)
}

async function togglePin(note: Note) {
  await updateNote(note.id, {
    title: note.title,
    content: note.content,
    category: note.category,
    reminderDate: note.reminderDate,
    pinned: !note.pinned,
    actions: note.actions,
  })
}

async function toggleAction(note: Note, selectedAction: NoteAction) {
  await updateNote(note.id, {
    title: note.title,
    content: note.content,
    category: note.category,
    reminderDate: note.reminderDate,
    pinned: note.pinned,
    actions: note.actions.map((action) => (
      action.id === selectedAction.id ? { ...action, completed: !action.completed } : action
    )),
  })
}

function formatReminder(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function notesWord(count: number) {
  const lastTwoDigits = count % 100
  const lastDigit = count % 10

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'заметок'
  }

  if (lastDigit === 1) {
    return 'заметка'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'заметки'
  }

  return 'заметок'
}

function getErrorMessage(eventError: unknown) {
  if (typeof eventError === 'object' && eventError && 'data' in eventError) {
    const data = eventError.data as { statusMessage?: unknown; message?: unknown }

    if (data.statusMessage) {
      return String(data.statusMessage)
    }

    if (data.message) {
      return String(data.message)
    }
  }

  if (typeof eventError === 'object' && eventError && 'statusMessage' in eventError) {
    return String(eventError.statusMessage)
  }

  return 'Не удалось сохранить заметку'
}
</script>

<template>
  <div v-if="user" class="min-h-screen bg-stone-50">
    <AppNavbar v-model:search="search" :user="user" @logout="logout" />

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section class="mb-8 flex flex-col gap-5 rounded-[2rem] border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-6 shadow-sm sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm font-bold uppercase tracking-wide text-orange-500">Dashboard</p>
          <h1 class="mt-2 text-3xl font-black text-stone-900 sm:text-4xl">Ваши заметки</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Создавайте записи, закрепляйте важное и добавляйте напоминания к делам.
          </p>
        </div>

        <button class="btn-primary w-full sm:w-auto" type="button" @click="openCreate">
          + Новая заметка
        </button>
      </section>

      <div class="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section>
          <div v-if="notes.length && !loading" class="mb-4 flex items-end justify-between gap-4 px-1">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.16em] text-orange-500">Коллекция</p>
              <h2 class="mt-1 text-xl font-black text-stone-900">Заметки</h2>
            </div>
            <p class="text-sm font-semibold text-stone-400">{{ notes.length }} {{ notesWord(notes.length) }}</p>
          </div>

          <div v-if="loading" class="rounded-3xl border border-stone-200 bg-white p-8 text-center text-sm font-semibold text-stone-500">
            Загрузка заметок...
          </div>

          <TransitionGroup
            v-else-if="notes.length"
            class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            name="note-list"
            tag="div"
          >
            <NoteCard
              v-for="note in visibleNotes"
              :key="note.id"
              :note="note"
              @delete="removeNote"
              @edit="openEdit"
              @open-related="openRelated"
              @toggle-pin="togglePin"
              @toggle-action="toggleAction"
            />
          </TransitionGroup>

          <div
            v-if="notes.length > notesPerPage && !loading"
            class="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
          >
            <div class="h-1 bg-stone-100">
              <div class="h-full rounded-full bg-gradient-to-r from-orange-300 to-orange-500 transition-all duration-500" :style="{ width: `${notesProgress}%` }" />
            </div>
            <div class="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-sm font-semibold text-stone-500">
                Показано <span class="text-stone-900">{{ visibleNotes.length }}</span> из {{ notes.length }}
              </p>
              <div class="flex gap-2">
                <button v-if="visibleLimit > notesPerPage" class="btn-ghost px-4 py-2 text-xs" type="button" @click="collapseNotes">
                  Свернуть
                </button>
                <button v-if="hiddenNotesCount" class="btn-primary px-4 py-2 text-xs" type="button" @click="showMoreNotes">
                  Показать еще <span class="ml-1 opacity-60">+{{ Math.min(hiddenNotesCount, notesPerPage) }}</span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="!loading && !notes.length" class="rounded-[2rem] border border-dashed border-orange-200 bg-white p-10 text-center">
            <h2 class="text-xl font-black text-stone-900">Пока нет заметок</h2>
            <p class="mt-2 text-sm text-stone-500">
              {{ search ? 'Попробуйте изменить поисковый запрос.' : 'Создайте первую заметку и добавьте напоминание.' }}
            </p>
            <button v-if="!search" class="btn-primary mt-6" type="button" @click="openCreate">Создать заметку</button>
          </div>
        </section>

        <aside class="space-y-6">
          <section class="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-black text-stone-900">Ближайшие напоминания</h2>

            <div v-if="upcomingReminders.length" class="mt-5 space-y-3">
              <div v-for="note in upcomingReminders" :key="note.id" class="rounded-2xl bg-orange-50 p-4">
                <p class="break-words text-sm font-bold text-stone-900">{{ note.title }}</p>
                <p class="mt-1 text-xs font-semibold text-orange-600">{{ formatReminder(note.reminderDate as string) }}</p>
              </div>
            </div>

            <p v-else class="mt-5 rounded-2xl bg-stone-50 p-4 text-sm leading-6 text-stone-500">
              Напоминаний пока нет. Добавьте дату в заметке, и она появится здесь.
            </p>
          </section>
        </aside>
      </div>
    </main>

    <div v-if="editorOpen" class="fixed inset-0 z-30 overflow-y-auto bg-stone-950/35 px-4 py-8 backdrop-blur-sm">
      <div class="mx-auto max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft sm:p-8">
        <div class="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-stone-900">{{ editingNote ? 'Редактировать заметку' : 'Новая заметка' }}</h2>
            <p class="mt-2 text-sm text-stone-500">Заполните поля и сохраните изменения.</p>
          </div>
          <button class="btn-ghost px-3" type="button" @click="editorOpen = false">×</button>
        </div>

        <p v-if="error" class="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {{ error }}
        </p>

        <NoteEditor :note="editingNote" @cancel="editorOpen = false" @save="saveNote" />

        <p v-if="saving" class="mt-4 text-sm font-semibold text-stone-500">Сохранение...</p>
      </div>
    </div>
  </div>
</template>
