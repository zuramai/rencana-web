import type { BudgetSummary } from '../utils/budget'
import type { CostFrequency, ItemType, TicketKind } from '../utils/item-types'

export interface PlanListItem {
  id: string
  name: string
  coverType: string
  coverEmoji: string | null
  coverFileId: string | null
  coverColor: string
  startYear: number | null
  startMonth: number | null
  endYear: number | null
  endMonth: number | null
}

export interface PlanDto extends PlanListItem {
  budgetCurrency: string
  budgetAmount: string | null
  createdAt: string
  updatedAt: string
}

export interface ItemDto {
  id: string
  type: ItemType
  description: string
  allDay: boolean
  /** `YYYY-MM-DDTHH:mm`, destination wall clock */
  startsAt: string
  endsAt: string | null
  currency: string | null
  price: string | null
  note: string | null
  link: string | null
  imageFileId: string | null
}

export interface CostDto {
  id: string
  name: string
  frequency: CostFrequency
  currency: string
  amount: string
  days: number | null
}

export interface TicketFileDto {
  id: string
  contentType: string
  originalName: string
}

export interface TicketDto {
  id: string
  kind: TicketKind
  title: string
  description: string | null
  locationText: string | null
  locationUrl: string | null
  files: TicketFileDto[]
}

export interface FxRateDto {
  currency: string
  rate: number
  source: 'auto' | 'manual'
  fetchedAt: string
}

export interface SummaryDto extends BudgetSummary {
  rates: FxRateDto[]
}
