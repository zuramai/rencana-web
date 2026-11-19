import { and, eq, sql } from 'drizzle-orm'
import { itemInput } from '#shared/schemas/item'
import { itineraryItems } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  const item = await findItem(plan.id, getRouterParam(event, 'itemId'))
  const { data, files } = await readMultipart(event, itemInput)
  const image = files('image')[0]

  let imageFileId = item.imageFileId
  if (image) imageFileId = (await saveUpload(plan.userId, image, { allowPdf: false })).id
  else if (data.removeImage) imageFileId = null

  const [row] = await db.update(itineraryItems).set({
    type: data.type,
    description: data.description,
    allDay: data.allDay,
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    currency: data.currency,
    price: data.price,
    note: data.note,
    link: data.link,
    imageFileId,
    updatedAt: sql`now()`
  }).where(and(eq(itineraryItems.id, item.id), eq(itineraryItems.planId, plan.id))).returning()
  if (item.imageFileId && item.imageFileId !== imageFileId) await deleteFileRows([item.imageFileId])
  await touchPlan(plan.id)
  return itemDto(row!)
})
