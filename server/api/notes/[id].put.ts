import { prisma } from '../../utils/prisma'
import { requireUser } from '../../utils/auth'
import { noteCategory, optionalDate, requiredString } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const title = requiredString(body.title)
  const content = requiredString(body.content)
  const category = noteCategory(body.category)
  const reminderDate = optionalDate(body.reminderDate)
  const pinned = Boolean(body.pinned)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан id заметки' })
  }

  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Добавьте заголовок заметки' })
  }

  const existing = await prisma.note.findFirst({ where: { id, userId: user.id } })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Заметка не найдена' })
  }

  const note = await prisma.note.update({
    where: { id },
    data: { title, content, category, reminderDate, pinned },
  })

  return { note }
})
