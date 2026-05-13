<script setup lang="ts">
import type { Note, NoteCategory } from '~/types'

const props = defineProps<{
  note: Note
}>()

const emit = defineEmits<{
  edit: [note: Note]
  delete: [note: Note]
  togglePin: [note: Note]
}>()

const categoryMap: Record<NoteCategory, {
  label: string
  marker: string
  accent: string
  badge: string
  glow: string
}> = {
  work: {
    label: 'Работа',
    marker: 'W',
    accent: 'bg-sky-400',
    badge: 'border-sky-200 bg-sky-50 text-sky-700',
    glow: 'group-hover:shadow-[0_18px_45px_rgba(14,165,233,0.14)]',
  },
  ideas: {
    label: 'Идеи',
    marker: 'I',
    accent: 'bg-violet-400',
    badge: 'border-violet-200 bg-violet-50 text-violet-700',
    glow: 'group-hover:shadow-[0_18px_45px_rgba(139,92,246,0.14)]',
  },
  personal: {
    label: 'Личное',
    marker: 'P',
    accent: 'bg-emerald-400',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    glow: 'group-hover:shadow-[0_18px_45px_rgba(16,185,129,0.14)]',
  },
  urgent: {
    label: 'Срочно',
    marker: '!',
    accent: 'bg-rose-400',
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
    glow: 'group-hover:shadow-[0_18px_45px_rgba(244,63,94,0.16)]',
  },
}

const category = computed(() => categoryMap[props.note.category] ?? categoryMap.personal)

const created = computed(() =>
  new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(props.note.createdAt)),
)

const reminder = computed(() =>
  props.note.reminderDate
    ? new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(props.note.reminderDate))
    : null,
)
</script>

<template>
  <article
    class="note-card group relative flex h-full min-h-72 overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-stone-300"
    :class="category.glow"
  >
    <div class="absolute inset-y-0 left-0 w-1.5 transition-all duration-300 group-hover:w-2" :class="category.accent" />

    <div class="flex min-w-0 flex-1 flex-col pl-2">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-2 rounded-xl border px-2.5 py-1 text-xs font-bold" :class="category.badge">
              <span class="grid size-5 place-items-center rounded-md bg-white/80 text-[11px]">{{ category.marker }}</span>
              {{ category.label }}
            </span>
            <span v-if="note.pinned" class="rounded-xl border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">
              Закреплено
            </span>
          </div>
          <h3 class="break-words text-lg font-bold text-stone-900">{{ note.title }}</h3>
        </div>

        <button
          class="grid size-9 shrink-0 place-items-center rounded-xl border border-stone-200 text-sm font-black text-stone-500 transition hover:scale-105 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 active:scale-95"
          type="button"
          :title="note.pinned ? 'Открепить' : 'Закрепить'"
          @click="emit('togglePin', note)"
        >
          {{ note.pinned ? '★' : '☆' }}
        </button>
      </div>

      <p class="mt-3 min-h-16 flex-1 whitespace-pre-wrap break-words text-sm leading-6 text-stone-600">
        {{ note.content || 'Без описания' }}
      </p>

      <div class="mt-5 space-y-2 text-xs text-stone-500">
        <p>Создано: {{ created }}</p>
        <p v-if="reminder" class="font-semibold text-orange-600">Напоминание: {{ reminder }}</p>
      </div>

      <div class="mt-5 flex gap-2">
        <button class="btn-ghost flex-1" type="button" @click="emit('edit', note)">
          Изменить
        </button>
        <button class="btn-ghost flex-1 text-red-600 hover:border-red-200 hover:bg-red-50" type="button" @click="emit('delete', note)">
          Удалить
        </button>
      </div>
    </div>
  </article>
</template>
