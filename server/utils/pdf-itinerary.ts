import pdfmake from 'pdfmake'
import { groupByDay, formatDayLabel } from '#shared/utils/itinerary'
import { ITEM_TYPES } from '#shared/utils/item-types'
import type { ExportContext } from './export-context'
import type { PlanBudget } from './fx'

const TEAL = '#0F766E'
const MUTED = '#78716C'
let pdfmakeReady = false
/** pdfmake table cell: plain text or a content node. */
type Cell = string | Record<string, unknown>

async function ensurePdfmake() {
  if (pdfmakeReady) return
  const f = await loadFonts()
  const files = { 'Roboto-Regular.ttf': f.regular, 'Roboto-Medium.ttf': f.medium, 'Roboto-Italic.ttf': f.italic, 'Roboto-MediumItalic.ttf': f.mediumItalic }
  for (const [name, bytes] of Object.entries(files)) {
    pdfmake.sharedVirtualfs.writeFileSync(name, Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength))
  }
  pdfmake.setFonts({
    Roboto: { normal: 'Roboto-Regular.ttf', bold: 'Roboto-Medium.ttf', italics: 'Roboto-Italic.ttf', bolditalics: 'Roboto-MediumItalic.ttf' }
  })
  pdfmake.setUrlAccessPolicy(() => false)
  pdfmake.setLocalAccessPolicy(() => false)
  pdfmakeReady = true
}

const tableLayout = {
  hLineWidth: (i: number) => (i === 1 ? 1 : 0.5),
  vLineWidth: () => 0,
  hLineColor: () => '#E7E0D8',
  paddingTop: () => 5,
  paddingBottom: () => 5
}

export async function buildItineraryPdf(ctx: ExportContext, budget: PlanBudget): Promise<Buffer> {
  await ensurePdfmake()
  const { plan, t, money } = ctx
  const { items, costs, summary, rates } = budget
  const cur = plan.budgetCurrency
  const typeLabel = (type: string) => t(`itemTypes.${type}`)

  const cover = plan.coverType === 'image'
    ? await fileDataUrl(plan.coverFileId)
    : null
  const coverNode = cover
    ? { image: cover, fit: [72, 72] }
    : { svg: emojiSvg(plan.coverEmoji, 56) ?? emojiSvg('fluent-emoji-flat:airplane', 56)!, width: 56, margin: [8, 8, 8, 8] }

  const header = {
    columns: [
      { table: { body: [[{ ...coverNode, fillColor: plan.coverColor }]] }, layout: 'noBorders', width: 80 },
      {
        stack: [
          { text: plan.name, style: 'title' },
          ...(ctx.period ? [{ text: ctx.period, color: MUTED, margin: [0, 2, 0, 0] }] : []),
          ...(plan.budgetAmount != null
            ? [{ text: `${t('pdf.expectedBudget')}: ${money(Number(plan.budgetAmount), cur)}`, margin: [0, 6, 0, 0] }]
            : [])
        ],
        margin: [12, 6, 0, 0]
      }
    ],
    margin: [0, 0, 0, 16]
  }

  const imageCache = new Map<string, string | null>()
  for (const item of items) {
    if (item.imageFileId && !imageCache.has(item.imageFileId)) {
      imageCache.set(item.imageFileId, await fileDataUrl(item.imageFileId))
    }
  }

  const itinerary: object[] = [{ text: t('pdf.itinerary'), style: 'h2' }]
  if (items.length === 0) itinerary.push({ text: t('pdf.noItems'), color: MUTED })
  for (const day of groupByDay(items)) {
    itinerary.push({ text: `${t('itinerary.day', { n: day.dayNumber })} · ${formatDayLabel(day.date, ctx.locale)}`, style: 'h3' })
    const body: Cell[][] = [[
      { text: t('pdf.time'), style: 'th' }, { text: t('pdf.type'), style: 'th' },
      { text: t('pdf.description'), style: 'th' }, { text: t('pdf.price'), style: 'th', alignment: 'right' }
    ]]
    for (const item of day.items) {
      const time = item.allDay
        ? t('pdf.allDay')
        : `${item.startsAt.slice(11)}${item.endsAt ? `–${item.endsAt.slice(0, 10) === item.startsAt.slice(0, 10) ? item.endsAt.slice(11) : `${formatDayLabel(item.endsAt, ctx.locale)} ${item.endsAt.slice(11)}`}` : ''}`
      const details: object[] = [{ text: item.description, bold: true }]
      if (item.note) details.push({ text: item.note, fontSize: 8.5, color: MUTED, margin: [0, 2, 0, 0] })
      if (item.link) details.push({ text: item.link, fontSize: 8.5, color: TEAL, link: item.link, margin: [0, 2, 0, 0] })
      const img = item.imageFileId ? imageCache.get(item.imageFileId) : null
      if (img) details.push({ image: img, width: 160, margin: [0, 4, 0, 0] })
      const color = ITEM_TYPES.find(x => x.value === item.type)?.color ?? MUTED
      body.push([
        { text: time, noWrap: false },
        { text: typeLabel(item.type), color },
        { stack: details },
        { text: item.price != null && item.currency ? money(Number(item.price), item.currency) : '—', alignment: 'right' }
      ])
    }
    itinerary.push({ table: { headerRows: 1, widths: [62, 70, '*', 80], body }, layout: tableLayout, margin: [0, 0, 0, 8] })
  }

  const costLines = new Map(summary.costs.map(c => [c.id, c]))
  const costsSection: object[] = [{ text: t('pdf.otherCosts'), style: 'h2' }]
  if (costs.length > 0) {
    const body: Cell[][] = [[
      t('pdf.name'), t('pdf.frequency'), t('pdf.amount'), t('pdf.days'), t('pdf.total'), t('pdf.converted', { currency: cur })
    ].map((text, i) => ({ text, style: 'th', alignment: i >= 2 ? 'right' : 'left' }))]
    for (const cost of costs) {
      const line = costLines.get(cost.id)
      body.push([
        cost.name,
        cost.frequency === 'daily' ? t('costs.daily') : t('costs.oneTime'),
        { text: money(Number(cost.amount), cost.currency), alignment: 'right' },
        { text: cost.frequency === 'daily' ? String(cost.days ?? summary.tripDays) : '—', alignment: 'right' },
        { text: line ? money(line.total, cost.currency) : '—', alignment: 'right' },
        { text: line?.converted != null ? money(line.converted, cur) : '—', alignment: 'right' }
      ])
    }
    costsSection.push({ table: { headerRows: 1, widths: ['*', 60, 75, 32, 75, 80], body }, layout: tableLayout })
  } else {
    costsSection.push({ text: '—', color: MUTED })
  }

  const summaryRows: [Cell, Cell][] = [
    [t('pdf.itineraryTotal'), money(summary.itineraryTotal, cur)],
    ...Object.entries(summary.byType).map(([type, v]): [Cell, Cell] => [{ text: `   ${typeLabel(type)}`, color: MUTED }, { text: money(v ?? 0, cur), color: MUTED }]),
    [t('pdf.otherCostsTotal'), money(summary.otherCostsTotal, cur)],
    [{ text: t('pdf.grandTotal'), bold: true }, { text: money(summary.grandTotal, cur), bold: true }]
  ]
  if (summary.budgetAmount != null && summary.remaining != null) {
    summaryRows.push([t('pdf.expectedBudget'), money(summary.budgetAmount, cur)])
    const over = summary.remaining < 0
    summaryRows.push([
      { text: over ? t('pdf.over') : t('pdf.remaining'), bold: true, color: over ? '#EA580C' : TEAL },
      { text: money(Math.abs(summary.remaining), cur), bold: true, color: over ? '#EA580C' : TEAL }
    ])
  }
  const summarySection: object[] = [
    { text: t('pdf.summary'), style: 'h2' },
    {
      table: {
        widths: ['*', 120],
        body: summaryRows.map(([a, b]) => [a, typeof b === 'string' ? { text: b, alignment: 'right' } : { ...b, alignment: 'right' }])
      },
      layout: { ...tableLayout, hLineWidth: () => 0.5 }
    }
  ]
  if (summary.missingRates.length > 0) {
    summarySection.push({ text: t('pdf.missingRates', { currencies: summary.missingRates.join(', ') }), color: '#B45309', margin: [0, 6, 0, 0] })
  }

  const ratesSection: object[] = []
  if (rates.length > 0) {
    ratesSection.push({ text: t('pdf.rates'), style: 'h2' }, {
      table: {
        headerRows: 1,
        widths: [60, '*', 60, 100],
        body: [
          [t('pdf.currency'), t('pdf.rate'), t('pdf.source'), t('pdf.fetchedAt')].map(text => ({ text, style: 'th' })),
          ...rates.map(r => [
            r.currency,
            t('rates.line', { from: r.currency, rate: r.rate.toLocaleString(ctx.locale, { maximumFractionDigits: 6 }), to: cur }),
            t(`rates.${r.source}`),
            new Date(r.fetchedAt).toLocaleDateString(ctx.locale, { day: 'numeric', month: 'short', year: 'numeric' })
          ])
        ]
      },
      layout: tableLayout
    })
  }

  const doc = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 50],
    info: { title: plan.name, creator: 'Rencana' },
    // Short sections stay on one page so a heading never ends up orphaned.
    content: [
      header,
      ...itinerary,
      { stack: costsSection, unbreakable: costs.length < 15 },
      { stack: summarySection, unbreakable: true },
      ...(ratesSection.length ? [{ stack: ratesSection, unbreakable: true }] : [])
    ],
    footer: (current: number, total: number) => ({
      text: t('pdf.page', { current, total }), alignment: 'center', fontSize: 8, color: MUTED, margin: [0, 20, 0, 0]
    }),
    defaultStyle: { font: 'Roboto', fontSize: 10, color: '#1C1917' },
    styles: {
      title: { fontSize: 22, bold: true, color: '#1C1917' },
      h2: { fontSize: 15, bold: true, color: TEAL, margin: [0, 16, 0, 8] },
      h3: { fontSize: 11, bold: true, color: TEAL, margin: [0, 8, 0, 4] },
      th: { bold: true, color: MUTED, fontSize: 9 }
    }
  }
  return pdfmake.createPdf(doc).getBuffer()
}
