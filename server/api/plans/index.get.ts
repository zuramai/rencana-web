import { desc, eq } from 'drizzle-orm'
import { plans } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  return db.select({
    id: plans.id,
    name: plans.name,
    coverType: plans.coverType,
    coverEmoji: plans.coverEmoji,
    coverFileId: plans.coverFileId,
    coverColor: plans.coverColor,
    startYear: plans.startYear,
    startMonth: plans.startMonth,
    endYear: plans.endYear,
    endMonth: plans.endMonth
  }).from(plans).where(eq(plans.userId, user.id)).orderBy(desc(plans.updatedAt))
})
