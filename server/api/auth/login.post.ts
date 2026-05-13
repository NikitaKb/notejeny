import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'
import { createToken, setAuthCookie } from '../../utils/auth'
import { isEmail, requiredString } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = requiredString(body.email).toLowerCase()
  const password = requiredString(body.password)

  if (!isEmail(email) || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Введите email и пароль' })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Неверный email или пароль' })
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash)

  if (!passwordOk) {
    throw createError({ statusCode: 401, statusMessage: 'Неверный email или пароль' })
  }

  setAuthCookie(event, createToken(user.id))

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  }
})
