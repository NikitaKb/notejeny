import { prisma } from '../../utils/prisma'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан id заметки' })
  }

  const existing = await prisma.note.findFirst({ where: { id, userId: user.id } })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Заметка не найдена' })
  }

  await prisma.note.delete({ where: { id } })

  return { ok: true }
})
