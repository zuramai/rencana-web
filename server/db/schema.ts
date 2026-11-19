import { sql } from 'drizzle-orm'
import {
  boolean, char, check, index, integer, numeric, pgEnum, pgTable, primaryKey, smallint, text, timestamp, uuid
} from 'drizzle-orm/pg-core'

const id = () => uuid().primaryKey().defaultRandom()
const createdAt = () => timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
const money = (name: string) => numeric(name, { precision: 16, scale: 2, mode: 'string' })
const currency = (name: string) => char(name, { length: 3 })

export const itemType = pgEnum('item_type', [
  'attraction', 'transportation', 'food_beverage', 'accommodation', 'activity', 'shopping', 'event', 'other'
])
export const costFrequency = pgEnum('cost_frequency', ['one_time', 'daily'])
export const ticketKind = pgEnum('ticket_kind', [
  'flight', 'train', 'bus', 'ferry', 'attraction', 'event', 'accommodation', 'other'
])

export const users = pgTable('users', {
  id: id(),
  username: text('username').unique(),
  passwordHash: text('password_hash'),
  googleSub: text('google_sub').unique(),
  email: text('email'),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  locale: text('locale').notNull().default('en'),
  defaultCurrency: currency('default_currency').notNull().default('USD'),
  createdAt: createdAt()
}, t => [
  check('users_locale_check', sql`${t.locale} in ('en', 'id')`),
  check('users_identity_check', sql`${t.username} is not null or ${t.googleSub} is not null`)
])

export const files = pgTable('files', {
  id: id(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  s3Key: text('s3_key').notNull(),
  thumbS3Key: text('thumb_s3_key'),
  contentType: text('content_type').notNull(),
  byteSize: integer('byte_size').notNull(),
  originalName: text('original_name').notNull(),
  createdAt: createdAt()
})

export const plans = pgTable('plans', {
  id: id(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  coverType: text('cover_type').notNull(),
  coverEmoji: text('cover_emoji'),
  coverFileId: uuid('cover_file_id').references(() => files.id, { onDelete: 'set null' }),
  coverColor: text('cover_color').notNull().default('#D6ECFF'),
  startYear: smallint('start_year'),
  startMonth: smallint('start_month'),
  endYear: smallint('end_year'),
  endMonth: smallint('end_month'),
  budgetCurrency: currency('budget_currency').notNull(),
  budgetAmount: money('budget_amount'),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, t => [
  check('plans_cover_type_check', sql`${t.coverType} in ('emoji', 'image')`),
  check('plans_start_month_check', sql`${t.startMonth} between 1 and 12`),
  check('plans_end_month_check', sql`${t.endMonth} between 1 and 12`),
  check('plans_start_month_year_check', sql`${t.startMonth} is null or ${t.startYear} is not null`),
  check('plans_end_year_check', sql`${t.endYear} is null or ${t.startYear} is not null`),
  check('plans_end_month_year_check', sql`${t.endMonth} is null or ${t.endYear} is not null`),
  index('plans_user_idx').on(t.userId, t.updatedAt)
])

export const itineraryItems = pgTable('itinerary_items', {
  id: id(),
  planId: uuid('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  type: itemType('type').notNull(),
  description: text('description').notNull(),
  allDay: boolean('all_day').notNull().default(false),
  // Wall-clock, destination-local times: deliberately without time zone.
  startsAt: timestamp('starts_at', { mode: 'string' }).notNull(),
  endsAt: timestamp('ends_at', { mode: 'string' }),
  currency: currency('currency'),
  price: money('price'),
  note: text('note'),
  link: text('link'),
  imageFileId: uuid('image_file_id').references(() => files.id, { onDelete: 'set null' }),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, t => [
  check('items_end_after_start_check', sql`${t.endsAt} is null or ${t.endsAt} >= ${t.startsAt}`),
  check('items_price_currency_check', sql`(${t.currency} is null) = (${t.price} is null)`),
  index('items_plan_starts_idx').on(t.planId, t.startsAt)
])

export const expectedCosts = pgTable('expected_costs', {
  id: id(),
  planId: uuid('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  frequency: costFrequency('frequency').notNull(),
  currency: currency('currency').notNull(),
  amount: money('amount').notNull(),
  days: integer('days'),
  createdAt: createdAt()
}, t => [
  check('costs_days_check', sql`${t.frequency} = 'daily' or ${t.days} is null`),
  index('costs_plan_idx').on(t.planId)
])

export const tickets = pgTable('tickets', {
  id: id(),
  planId: uuid('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  kind: ticketKind('kind').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  locationText: text('location_text'),
  locationUrl: text('location_url'),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, t => [index('tickets_plan_idx').on(t.planId)])

export const ticketFiles = pgTable('ticket_files', {
  ticketId: uuid('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
  fileId: uuid('file_id').notNull().references(() => files.id, { onDelete: 'cascade' }),
  position: integer('position').notNull()
}, t => [primaryKey({ columns: [t.ticketId, t.fileId] })])

export const planFxRates = pgTable('plan_fx_rates', {
  planId: uuid('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  currency: currency('currency').notNull(),
  // 1 unit of `currency` = `rate` units of the plan's budget currency.
  rate: numeric('rate', { precision: 20, scale: 10, mode: 'string' }).notNull(),
  source: text('source').notNull(),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull()
}, t => [
  primaryKey({ columns: [t.planId, t.currency] }),
  check('fx_source_check', sql`${t.source} in ('auto', 'manual')`)
])

export type UserRow = typeof users.$inferSelect
export type FileRow = typeof files.$inferSelect
export type PlanRow = typeof plans.$inferSelect
export type ItemRow = typeof itineraryItems.$inferSelect
export type CostRow = typeof expectedCosts.$inferSelect
export type TicketRow = typeof tickets.$inferSelect
export type FxRateRow = typeof planFxRates.$inferSelect
