import { eq, sql } from 'drizzle-orm'
import { planInput } from '#shared/schemas/plan'
import { planFxRates, plans } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  const { data, files } = await readMultipart(event, planInput)
  const image = files('image')[0]

  let coverFileId = plan.coverFileId
  if (data.coverType === 'image' && image) {
    coverFileId = (await saveUpload(plan.userId, image, { allowPdf: false })).id
  } else if (data.coverType === 'emoji' || data.removeCoverImage) {
    coverFileId = null
  }
  if (data.coverType === 'image' && !coverFileId) throw createError({ statusCode: 400, statusMessage: 'cover_required' })

  await db.transaction(async (tx) => {
    await tx.update(plans).set({
      name: data.name,
      coverType: data.coverType,
      coverEmoji: data.coverEmoji,
      coverFileId,
      coverColor: data.coverColor,
      startYear: data.startYear,
      startMonth: data.startMonth,
      endYear: data.endYear,
      endMonth: data.endMonth,
      budgetCurrency: data.budgetCurrency,
      budgetAmount: data.budgetAmount,
      updatedAt: sql`now()`
    }).where(eq(plans.id, plan.id))
    // Rates are stored relative to the budget currency.
    if (data.budgetCurrency !== plan.budgetCurrency) await tx.delete(planFxRates).where(eq(planFxRates.planId, plan.id))
  })
  if (plan.coverFileId && plan.coverFileId !== coverFileId) await deleteFileRows([plan.coverFileId])
  return { id: plan.id }
})
