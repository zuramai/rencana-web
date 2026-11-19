import { and, eq } from 'drizzle-orm'
import { files } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  const row = id && isUuid(id)
    ? await db.query.files.findFirst({ where: and(eq(files.id, id), eq(files.userId, user.id)) })
    : undefined
  if (!row) throw createError({ statusCode: 404, statusMessage: 'file_not_found' })
  const key = getQuery(event).size === 'thumb' && row.thumbS3Key ? row.thumbS3Key : row.s3Key
  setHeader(event, 'Cache-Control', 'private, max-age=240')
  return sendRedirect(event, await presignGet(key), 302)
})
