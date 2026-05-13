import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const cookieName = 'smart_notes_token'

type TokenPayload = {
  userId: string
}

export type PublicUser = {
  id: string
  username: string
  email: string
}

export function createToken(userId: string) {
  const config = useRuntimeConfig()
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '7d' })
}

export function setAuthCookie(event: Parameters<typeof setCookie>[0], token: string) {
  setCookie(event, cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearAuthCookie(event: Parameters<typeof deleteCookie>[0]) {
  deleteCookie(event, cookieName, { path: '/' })
}

export async function getUserFromEvent(event: Parameters<typeof getCookie>[0]): Promise<PublicUser | null> {
  const token = getCookie(event, cookieName)

  if (!token) {
    return null
  }

  try {
    const config = useRuntimeConfig()
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, email: true },
    })

    return user
  } catch {
    return null
  }
}

export async function requireUser(event: Parameters<typeof getCookie>[0]) {
  const user = await getUserFromEvent(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Требуется авторизация',
    })
  }

  return user
}
