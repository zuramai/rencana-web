import { randomUUID } from 'node:crypto'
import { inArray } from 'drizzle-orm'
import type { H3Event, MultiPartData } from 'h3'
import sharp from 'sharp'
import type { z } from 'zod'
import { files, type FileRow } from '../db/schema'

const IMAGE_FORMATS: Record<string, true> = { jpeg: true, png: true, webp: true, avif: true, gif: true }
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_PDF_BYTES = 15 * 1024 * 1024

/**
 * Multipart request: field `data` is JSON validated by `schema`; every other
 * field with a filename is a file part, grouped by field name.
 */
export async function readMultipart<S extends z.ZodType>(event: H3Event, schema: S) {
  const parts = await readMultipartFormData(event)
  const dataPart = parts?.find(p => p.name === 'data' && !p.filename)
  if (!dataPart) throw createError({ statusCode: 400, statusMessage: 'invalid_body' })
  let json: unknown
  try {
    json = JSON.parse(dataPart.data.toString('utf8'))
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'invalid_body' })
  }
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation Error', data: parsed.error.issues })
  }
  const filesByField = new Map<string, MultiPartData[]>()
  for (const part of parts ?? []) {
    if (!part.filename || !part.name || part.data.length === 0) continue
    filesByField.set(part.name, [...(filesByField.get(part.name) ?? []), part])
  }
  return { data: parsed.data as z.output<S>, files: (field: string) => filesByField.get(field) ?? [] }
}

/** Sniff, normalise (images → JPEG + thumbnail) and store one upload. */
export async function saveUpload(userId: string, part: MultiPartData, { allowPdf }: { allowPdf: boolean }): Promise<FileRow> {
  const fileId = randomUUID()
  const originalName = (part.filename ?? 'file').slice(0, 200)
  const buf = part.data

  if (allowPdf && buf.subarray(0, 5).toString('latin1') === '%PDF-') {
    if (buf.length > MAX_PDF_BYTES) throw createError({ statusCode: 413, statusMessage: 'file_too_large' })
    const key = `u/${userId}/${fileId}.pdf`
    await putObject(key, buf, 'application/pdf')
    const [row] = await db.insert(files).values({
      id: fileId, userId, s3Key: key, contentType: 'application/pdf', byteSize: buf.length, originalName
    }).returning()
    return row!
  }

  let format: string | undefined
  try {
    format = (await sharp(buf).metadata()).format
  } catch {
    format = undefined
  }
  if (!format || !IMAGE_FORMATS[format]) throw createError({ statusCode: 415, statusMessage: 'unsupported_file' })
  if (buf.length > MAX_IMAGE_BYTES) throw createError({ statusCode: 413, statusMessage: 'file_too_large' })

  const image = await sharp(buf).rotate()
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 }).toBuffer()
  const thumb = await sharp(buf).rotate()
    .resize(480, 480, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 }).toBuffer()
  const key = `u/${userId}/${fileId}.jpg`
  const thumbKey = `u/${userId}/${fileId}_t.jpg`
  await Promise.all([putObject(key, image, 'image/jpeg'), putObject(thumbKey, thumb, 'image/jpeg')])
  const [row] = await db.insert(files).values({
    id: fileId, userId, s3Key: key, thumbS3Key: thumbKey, contentType: 'image/jpeg', byteSize: image.length, originalName
  }).returning()
  return row!
}

/** Store several uploads; if one fails, the ones already stored are removed. */
export async function saveUploads(userId: string, parts: MultiPartData[], options: { allowPdf: boolean }): Promise<FileRow[]> {
  const saved: FileRow[] = []
  try {
    for (const part of parts) saved.push(await saveUpload(userId, part, options))
  } catch (error) {
    await deleteFileRows(saved.map(f => f.id))
    throw error
  }
  return saved
}

/** Delete file rows, then their S3 objects. */
export async function deleteFileRows(ids: (string | null | undefined)[]): Promise<void> {
  const unique = [...new Set(ids.filter((id): id is string => !!id))]
  if (unique.length === 0) return
  const rows = await db.delete(files).where(inArray(files.id, unique)).returning({ s3Key: files.s3Key, thumbS3Key: files.thumbS3Key })
  await deleteObjects(rows.flatMap(r => (r.thumbS3Key ? [r.s3Key, r.thumbS3Key] : [r.s3Key])))
}
