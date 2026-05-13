<script setup lang="ts">
import type { User } from '~/types'

defineProps<{
  user: User
  search: string
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  logout: []
}>()
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-stone-200/70 bg-white/85 backdrop-blur-xl">
    <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div class="flex items-center justify-between gap-4">
        <NuxtLink to="/dashboard" class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-2xl bg-orange-100 text-lg font-black text-orange-500">У</span>
          <span class="text-lg font-bold text-stone-900">Умные Заметки</span>
        </NuxtLink>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label class="relative min-w-0 sm:w-80">
          <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">⌕</span>
          <input
            :value="search"
            type="search"
            class="field py-2.5 pl-10"
            placeholder="Поиск заметок"
            @input="emit('update:search', ($event.target as HTMLInputElement).value)"
          >
        </label>

        <div class="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-stone-900">{{ user.username }}</p>
            <p class="truncate text-xs text-stone-500">{{ user.email }}</p>
          </div>
        </div>

        <button class="btn-ghost" type="button" @click="emit('logout')">
          Выйти
        </button>
      </div>
    </div>
  </header>
</template>
