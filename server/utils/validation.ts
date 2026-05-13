export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function requiredString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function optionalDate(value: unknown) {
  if (!value) {
    return null
  }

  if (typeof value !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Некорректная дата напоминания' })
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Некорректная дата напоминания' })
  }

  return date
}

const noteCategories = ['work', 'ideas', 'personal', 'urgent'] as const

export function noteCategory(value: unknown) {
  return typeof value === 'string' && noteCategories.includes(value as (typeof noteCategories)[number])
    ? value
    : 'personal'
}
