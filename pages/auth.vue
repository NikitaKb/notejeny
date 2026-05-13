<script setup lang="ts">
const mode = ref<'login' | 'register'>('login')
const pending = ref(false)
const error = ref('')

const loginForm = reactive({
  email: '',
  password: '',
})

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const { login, register } = useAuth()

async function submit() {
  error.value = ''
  pending.value = true

  try {
    if (mode.value === 'login') {
      await login(loginForm)
    } else {
      await register(registerForm)
    }

    await navigateTo('/dashboard')
  } catch (eventError) {
    error.value = getErrorMessage(eventError)
  } finally {
    pending.value = false
  }
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

  return 'Не удалось выполнить запрос'
}
</script>

<template>
  <main class="min-h-screen bg-gradient-to-br from-white via-orange-50 to-stone-100 px-4 py-10">
    <section class="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
      <div class="grid w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-soft lg:grid-cols-[0.95fr_1.05fr]">
        <div class="hidden bg-stone-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div class="grid size-12 place-items-center rounded-2xl bg-[#FFB86B] text-xl font-black text-stone-950">У</div>
            <h1 class="mt-8 max-w-sm text-4xl font-black leading-tight">Умные Заметки</h1>
            <p class="mt-4 max-w-md text-base leading-7 text-stone-300">
              Личный минималистичный сервис для заметок и напоминаний. Без ИИ, без шума, только ваши записи.
            </p>
          </div>

          <div class="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p class="text-sm leading-6 text-stone-300">
              Доступ к заметкам открывается только после регистрации или входа. JWT хранится в защищенной cookie.
            </p>
          </div>
        </div>

        <div class="p-6 sm:p-10">
          <div class="mb-8 lg:hidden">
            <div class="grid size-12 place-items-center rounded-2xl bg-orange-100 text-xl font-black text-orange-500">У</div>
            <h1 class="mt-4 text-3xl font-black text-stone-900">Умные Заметки</h1>
          </div>

          <div class="mb-8 inline-flex rounded-2xl bg-stone-100 p-1">
            <button
              class="rounded-xl px-4 py-2 text-sm font-bold transition"
              :class="mode === 'login' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'"
              type="button"
              @click="mode = 'login'"
            >
              Вход
            </button>
            <button
              class="rounded-xl px-4 py-2 text-sm font-bold transition"
              :class="mode === 'register' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'"
              type="button"
              @click="mode = 'register'"
            >
              Регистрация
            </button>
          </div>

          <h2 class="text-2xl font-black text-stone-900">
            {{ mode === 'login' ? 'С возвращением' : 'Создайте аккаунт' }}
          </h2>
          <p class="mt-2 text-sm text-stone-500">
            {{ mode === 'login' ? 'Войдите, чтобы открыть свои заметки.' : 'После регистрации вы сразу попадете в dashboard.' }}
          </p>

          <form class="mt-8 space-y-4" @submit.prevent="submit">
            <template v-if="mode === 'register'">
              <div>
                <label class="mb-2 block text-sm font-semibold text-stone-700" for="username">Username</label>
                <input id="username" v-model="registerForm.username" class="field" autocomplete="username" minlength="2" required>
              </div>
              <div>
                <label class="mb-2 block text-sm font-semibold text-stone-700" for="register-email">Email</label>
                <input id="register-email" v-model="registerForm.email" class="field" autocomplete="email" type="email" required>
              </div>
              <div>
                <label class="mb-2 block text-sm font-semibold text-stone-700" for="register-password">Password</label>
                <input id="register-password" v-model="registerForm.password" class="field" autocomplete="new-password" minlength="8" type="password" required>
              </div>
              <div>
                <label class="mb-2 block text-sm font-semibold text-stone-700" for="confirm-password">Confirm password</label>
                <input id="confirm-password" v-model="registerForm.confirmPassword" class="field" autocomplete="new-password" minlength="8" type="password" required>
              </div>
            </template>

            <template v-else>
              <div>
                <label class="mb-2 block text-sm font-semibold text-stone-700" for="login-email">Email</label>
                <input id="login-email" v-model="loginForm.email" class="field" autocomplete="email" type="email" required>
              </div>
              <div>
                <label class="mb-2 block text-sm font-semibold text-stone-700" for="login-password">Password</label>
                <input id="login-password" v-model="loginForm.password" class="field" autocomplete="current-password" type="password" required>
              </div>
            </template>

            <p v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {{ error }}
            </p>

            <button class="btn-primary w-full" :disabled="pending" type="submit">
              {{ pending ? 'Пожалуйста, подождите...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>
