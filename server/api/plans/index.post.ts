import { planInput } from '#shared/schemas/plan'
import { plans } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { data, files } = await readMultipart(event, planInput)
  const image = files('image')[0]
  if (data.coverType === 'image' && !image) throw createError({ statusCode: 400, statusMessage: 'cover_required' })
  const cover = data.coverType === 'image' && image ? await saveUpload(user.id, image, { allowPdf: false }) : null

  const [row] = await db.insert(plans).values({
    userId: user.id,
    name: data.name,
    coverType: data.coverType,
    coverEmoji: data.coverEmoji,
    coverFileId: cover?.id ?? null,
    coverColor: data.coverColor,
    startYear: data.startYear,
    startMonth: data.startMonth,
    endYear: data.endYear,
    endMonth: data.endMonth,
    budgetCurrency: data.budgetCurrency,
    budgetAmount: data.budgetAmount
  }).returning({ id: plans.id })
  return { id: row!.id }
})
