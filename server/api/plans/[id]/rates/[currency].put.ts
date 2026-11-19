import { and, eq } from 'drizzle-orm'
import { rateInput } from '#shared/schemas/cost'
import { currencyCode } from '#shared/schemas/common'
import { planFxRates } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  const currency = currencyCode.safeParse(getRouterParam(event, 'currency'))
  if (!currency.success || currency.data === plan.budgetCurrency) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_currency' })
  }
  const { rate } = await readValidatedBody(event, rateInput.parse)
  if (rate == null) {
    await db.delete(planFxRates).where(and(eq(planFxRates.planId, plan.id), eq(planFxRates.currency, currency.data)))
  } else {
    const values = { planId: plan.id, currency: currency.data, rate: String(rate), source: 'manual', fetchedAt: new Date() }
    await db.insert(planFxRates).values(values).onConflictDoUpdate({
      target: [planFxRates.planId, planFxRates.currency],
      set: { rate: values.rate, source: 'manual', fetchedAt: values.fetchedAt }
    })
  }
  return { ok: true }
})
