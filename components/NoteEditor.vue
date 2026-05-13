<script setup lang="ts">
import type { Note, NoteCategory, NoteInput } from '~/types'

const props = defineProps<{
  note?: Note | null
}>()

const emit = defineEmits<{
  save: [payload: NoteInput]
  cancel: []
}>()

const categories: Array<{
  value: NoteCategory
  label: string
  marker: string
  classes: string
}> = [
  { value: 'work', label: 'Работа', marker: 'W', classes: 'border-sky-200 bg-sky-50 text-sky-700' },
  { value: 'ideas', label: 'Идеи', marker: 'I', classes: 'border-violet-200 bg-violet-50 text-violet-700' },
  { value: 'personal', label: 'Личное', marker: 'P', classes: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  { value: 'urgent', label: 'Срочно', marker: '!', classes: 'border-rose-200 bg-rose-50 text-rose-700' },
]

const form = reactive<NoteInput>({
  title: '',
  content: '',
  category: 'personal',
  reminderDate: null,
  pinned: false,
})

watch(
  () => props.note,
  (note) => {
    form.title = note?.title ?? ''
    form.content = note?.content ?? ''
    form.category = note?.category ?? 'personal'
    form.reminderDate = toDatetimeLocal(note?.reminderDate ?? null)
    form.pinned = note?.pinned ?? false
  },
  { immediate: true },
)

function submit() {
  emit('save', {
    title: form.title,
    content: form.content,
    category: form.category,
    reminderDate: form.reminderDate || null,
    pinned: form.pinned,
  })
}

function toDatetimeLocal(value: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 16)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <div>
      <label class="mb-2 block text-sm font-semibold text-stone-700" for="note-title">Заголовок</label>
      <input id="note-title" v-model="form.title" class="field" maxlength="120" placeholder="Например, идеи для проекта" required>
    </div>

    <div>
      <label class="mb-2 block text-sm font-semibold text-stone-700">Категория</label>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label
          v-for="category in categories"
          :key="category.value"
          class="flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-sm"
          :class="form.category === category.value ? category.classes : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'"
        >
          <input v-model="form.category" class="sr-only" name="category" type="radio" :value="category.value">
          <span class="grid size-6 shrink-0 place-items-center rounded-lg bg-white/70 text-xs">{{ category.marker }}</span>
          {{ category.label }}
        </label>
      </div>
    </div>

    <div>
      <label class="mb-2 block text-sm font-semibold text-stone-700" for="note-content">Содержание</label>
      <textarea id="note-content" v-model="form.content" class="field min-h-36 resize-y" placeholder="Текст заметки" />
    </div>

    <div>
      <label class="mb-2 block text-sm font-semibold text-stone-700" for="note-reminder">Напоминание</label>
      <input id="note-reminder" v-model="form.reminderDate" class="field" type="datetime-local">
    </div>

    <label class="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-700">
      <input v-model="form.pinned" class="size-4 accent-[#FFB86B]" type="checkbox">
      Закрепить заметку
    </label>

    <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button class="btn-ghost" type="button" @click="emit('cancel')">Отмена</button>
      <button class="btn-primary" type="submit">{{ note ? 'Сохранить' : 'Создать заметку' }}</button>
    </div>
  </form>
</template>
