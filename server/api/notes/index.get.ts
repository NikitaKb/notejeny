import { prisma } from '../../utils/prisma'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''

  const notes = await prisma.note.findMany({
    where: {
      userId: user.id,
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { content: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
  })

  return { notes }
})
