export const ITEM_TYPES = [
  { value: 'attraction', icon: 'i-lucide-landmark', color: '#8B5CF6' },
  { value: 'transportation', icon: 'i-lucide-plane', color: '#3B82F6' },
  { value: 'food_beverage', icon: 'i-lucide-utensils', color: '#F97316' },
  { value: 'accommodation', icon: 'i-lucide-bed-double', color: '#14B8A6' },
  { value: 'activity', icon: 'i-lucide-sparkles', color: '#22C55E' },
  { value: 'shopping', icon: 'i-lucide-shopping-bag', color: '#EC4899' },
  { value: 'event', icon: 'i-lucide-party-popper', color: '#EAB308' },
  { value: 'other', icon: 'i-lucide-circle-dot', color: '#78716C' }
] as const

export type ItemType = typeof ITEM_TYPES[number]['value']
export const ITEM_TYPE_VALUES = ITEM_TYPES.map(t => t.value) as [ItemType, ...ItemType[]]

export const TICKET_KINDS = [
  { value: 'flight', icon: 'i-lucide-plane' },
  { value: 'train', icon: 'i-lucide-train-front' },
  { value: 'bus', icon: 'i-lucide-bus' },
  { value: 'ferry', icon: 'i-lucide-ship' },
  { value: 'attraction', icon: 'i-lucide-landmark' },
  { value: 'event', icon: 'i-lucide-party-popper' },
  { value: 'accommodation', icon: 'i-lucide-bed-double' },
  { value: 'other', icon: 'i-lucide-ticket' }
] as const

export type TicketKind = typeof TICKET_KINDS[number]['value']
export const TICKET_KIND_VALUES = TICKET_KINDS.map(t => t.value) as [TicketKind, ...TicketKind[]]

export const COVER_COLORS = ['#FFE3D3', '#FFF1B8', '#D9F5E5', '#D6ECFF', '#E8DDFF', '#FFD9E8', '#E0F2F1', '#F1F1F1'] as const

export const COVER_EMOJIS = [
  'airplane', 'luggage', 'world-map', 'compass', 'beach-with-umbrella', 'desert-island', 'mount-fuji',
  'snow-capped-mountain', 'sunrise-over-mountains', 'national-park', 'camping', 'cityscape-at-dusk',
  'japanese-castle', 'ferris-wheel', 'sushi', 'camera'
].map(name => `fluent-emoji-flat:${name}`)

export const DEFAULT_COVER_EMOJI = 'fluent-emoji-flat:airplane'

export const COST_PRESETS = [
  { key: 'meals', frequency: 'daily' },
  { key: 'localTransport', frequency: 'daily' },
  { key: 'tips', frequency: 'daily' },
  { key: 'esim', frequency: 'one_time' },
  { key: 'insurance', frequency: 'one_time' },
  { key: 'emergencyFund', frequency: 'one_time' },
  { key: 'visa', frequency: 'one_time' },
  { key: 'souvenirs', frequency: 'one_time' }
] as const

export type CostFrequency = 'one_time' | 'daily'
