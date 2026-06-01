import { prisma } from '../../utils/prisma'
import { requireUser } from '../../utils/auth'
import { noteCategory, optionalDate, requiredString } from '../../utils/validation'
import { analyzeNote, serializeNote } from '../../utils/smartNotes'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  const title = requiredString(body.title)
  const content = requiredString(body.content)
  const category = noteCategory(body.category)
  const reminderDate = optionalDate(body.reminderDate)
  const pinned = Boolean(body.pinned)
  const smartFields = analyzeNote(title, content)

  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Добавьте заголовок заметки' })
  }

  const note = await prisma.note.create({
    data: {
      title,
      content,
      category,
      reminderDate,
      pinned,
      ...smartFields,
      userId: user.id,
    },
  })

  const notes = await prisma.note.findMany({ where: { userId: user.id } })
  return { note: serializeNote(note, notes) }
})
