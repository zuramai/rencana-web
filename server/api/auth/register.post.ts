import { eq } from 'drizzle-orm'
import { registerInput } from '#shared/schemas/auth'
import { users } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, registerInput.parse)
  const existing = await db.query.users.findFirst({ where: eq(users.username, body.username), columns: { id: true } })
  if (existing) throw createError({ statusCode: 409, statusMessage: 'username_taken' })

  const [row] = await db.insert(users).values({
    username: body.username,
    passwordHash: await hashPassword(body.password),
    displayName: body.displayName,
    locale: body.locale,
    defaultCurrency: detectCurrency(body.timezone, getHeader(event, 'accept-language'))
  }).onConflictDoNothing({ target: users.username }).returning()
  if (!row) throw createError({ statusCode: 409, statusMessage: 'username_taken' })

  await setUserSession(event, { user: sessionUser(row) })
  return sessionUser(row)
})
