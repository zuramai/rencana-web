import { z } from 'zod'
import { TICKET_KIND_VALUES } from '../utils/item-types'
import { optionalText, optionalUrl } from './common'

export const ticketInput = z.object({
  kind: z.enum(TICKET_KIND_VALUES),
  title: z.string().trim().min(1).max(120),
  description: optionalText(2000),
  locationText: optionalText(200),
  locationUrl: optionalUrl,
  removeFileIds: z.array(z.uuid()).optional()
})

export type TicketInput = z.infer<typeof ticketInput>
