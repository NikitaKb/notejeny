import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 18px 45px rgba(88, 64, 42, 0.10)',
      },
    },
  },
}
