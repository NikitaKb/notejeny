import type { User } from '~/types'

type AuthResponse = {
  user: User | null
}

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)

  async function fetchUser() {
    const headers = process.server ? useRequestHeaders(['cookie']) : undefined
    const response = await $fetch<AuthResponse>('/api/auth/me', { headers })
    user.value = response.user
    return user.value
  }

  async function register(payload: {
    username: string
    email: string
    password: string
    confirmPassword: string
  }) {
    const response = await $fetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: payload,
    })
    user.value = response.user
    return response.user
  }

  async function login(payload: { email: string; password: string }) {
    const response = await $fetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: payload,
    })
    user.value = response.user
    return response.user
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/auth')
  }

  return {
    user,
    fetchUser,
    register,
    login,
    logout,
  }
}
