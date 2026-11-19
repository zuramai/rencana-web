import { eq } from 'drizzle-orm'
import { loginInput } from '#shared/schemas/auth'
import { users } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, loginInput.parse)
  const row = await db.query.users.findFirst({ where: eq(users.username, body.username) })
  if (!row?.passwordHash || !(await verifyPassword(row.passwordHash, body.password))) {
    throw createError({ statusCode: 401, statusMessage: 'invalid_credentials' })
  }
  await replaceUserSession(event, { user: sessionUser(row) })
  return sessionUser(row)
})
