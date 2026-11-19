import { itemInput } from '#shared/schemas/item'
import { itineraryItems } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  const { data, files } = await readMultipart(event, itemInput)
  const image = files('image')[0]
  const file = image ? await saveUpload(plan.userId, image, { allowPdf: false }) : null
  const [row] = await db.insert(itineraryItems).values({
    planId: plan.id,
    type: data.type,
    description: data.description,
    allDay: data.allDay,
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    currency: data.currency,
    price: data.price,
    note: data.note,
    link: data.link,
    imageFileId: file?.id ?? null
  }).returning()
  await touchPlan(plan.id)
  return itemDto(row!)
})
