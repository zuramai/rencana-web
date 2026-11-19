import { eq } from 'drizzle-orm'
import { meInput } from '#shared/schemas/auth'
import { users } from '../db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readValidatedBody(event, meInput.parse)
  const [row] = await db.update(users).set(body).where(eq(users.id, user.id)).returning()
  if (!row) throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  await replaceUserSession(event, { user: sessionUser(row) })
  return sessionUser(row)
})
