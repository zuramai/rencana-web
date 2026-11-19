import { and, eq, sql } from 'drizzle-orm'
import type { H3Event } from 'h3'
import type { User } from '#auth-utils'
import { itineraryItems, plans, type PlanRow, type UserRow } from '../db/schema'

export function sessionUser(row: UserRow): User {
  return {
    id: row.id,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    locale: row.locale === 'id' ? 'id' : 'en',
    defaultCurrency: row.defaultCurrency
  }
}

/** The plan with `planId` owned by the signed-in user, else 404 `plan_not_found`. */
export async function requirePlan(event: H3Event, planId: string | undefined): Promise<PlanRow> {
  const { user } = await requireUserSession(event)
  const plan = planId && isUuid(planId)
    ? await db.query.plans.findFirst({ where: and(eq(plans.id, planId), eq(plans.userId, user.id)) })
    : undefined
  if (!plan) throw createError({ statusCode: 404, statusMessage: 'plan_not_found' })
  return plan
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

/** Item/cost/ticket writes mark the plan as recently updated (list order). */
export async function touchPlan(planId: string): Promise<void> {
  await db.update(plans).set({ updatedAt: sql`now()` }).where(eq(plans.id, planId))
}

/** Item `itemId` of plan `planId`, else 404 `item_not_found`. */
export async function findItem(planId: string, itemId: string | undefined) {
  const item = itemId && isUuid(itemId)
    ? await db.query.itineraryItems.findFirst({ where: and(eq(itineraryItems.id, itemId), eq(itineraryItems.planId, planId)) })
    : undefined
  if (!item) throw createError({ statusCode: 404, statusMessage: 'item_not_found' })
  return item
}
