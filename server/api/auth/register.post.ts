import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'
import { createToken, setAuthCookie } from '../../utils/auth'
import { isEmail, requiredString } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const username = requiredString(body.username)
  const email = requiredString(body.email).toLowerCase()
  const password = requiredString(body.password)
  const confirmPassword = requiredString(body.confirmPassword)

  if (username.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Имя должно содержать минимум 2 символа' })
  }

  if (!isEmail(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Введите корректный email' })
  }

  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Пароль должен содержать минимум 8 символов' })
  }

  if (password !== confirmPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Пароли не совпадают' })
  }

  const exists = await prisma.user.findUnique({ where: { email } })

  if (exists) {
    throw createError({ statusCode: 409, statusMessage: 'Пользователь с таким email уже существует' })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { username, email, passwordHash },
    select: { id: true, username: true, email: true },
  })

  setAuthCookie(event, createToken(user.id))

  return { user }
})
