import { eq } from 'drizzle-orm'
import { users } from '../db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const row = await db.query.users.findFirst({ where: eq(users.id, user.id) })
  if (!row) throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  return { ...sessionUser(row), username: row.username, email: row.email }
})
