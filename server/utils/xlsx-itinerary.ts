import ExcelJS from 'exceljs'
import type { ExportContext } from './export-context'
import type { PlanBudget } from './fx'

const MONEY = '#,##0.00'

function styleHeader(sheet: ExcelJS.Worksheet) {
  sheet.getRow(1).font = { bold: true }
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2F1' } }
  sheet.views = [{ state: 'frozen', ySplit: 1 }]
}

export async function buildItineraryXlsx(ctx: ExportContext, budget: PlanBudget): Promise<Buffer> {
  const { plan, t } = ctx
  const cur = plan.budgetCurrency
  const { items, costs, summary, rates } = budget
  const rateOf = (currency: string) => (currency === cur ? 1 : rates.find(r => r.currency === currency)?.rate)

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Rencana'
  wb.title = plan.name

  const itinerary = wb.addWorksheet('Itinerary')
  itinerary.columns = [
    { header: t('pdf.date'), key: 'date', width: 12 },
    { header: t('pdf.start'), key: 'start', width: 8 },
    { header: t('pdf.end'), key: 'end', width: 17 },
    { header: t('pdf.allDay'), key: 'allDay', width: 9 },
    { header: t('pdf.type'), key: 'type', width: 15 },
    { header: t('pdf.description'), key: 'description', width: 36 },
    { header: t('pdf.price'), key: 'price', width: 14, style: { numFmt: MONEY } },
    { header: t('pdf.currency'), key: 'currency', width: 10 },
    { header: t('pdf.priceIn', { currency: cur }), key: 'converted', width: 18, style: { numFmt: MONEY } },
    { header: t('pdf.note'), key: 'note', width: 40 },
    { header: t('pdf.link'), key: 'link', width: 36 }
  ]
  for (const item of items) {
    const price = item.price == null ? null : Number(item.price)
    const rate = item.currency ? rateOf(item.currency) : undefined
    itinerary.addRow({
      date: item.startsAt.slice(0, 10),
      start: item.allDay ? '' : item.startsAt.slice(11),
      end: item.endsAt ? item.endsAt.replace('T', ' ') : '',
      allDay: item.allDay ? t('pdf.yes') : t('pdf.no'),
      type: t(`itemTypes.${item.type}`),
      description: item.description,
      price,
      currency: item.currency ?? '',
      converted: price != null && rate != null ? Math.round(price * rate * 100) / 100 : null,
      note: item.note ?? '',
      link: item.link ?? ''
    })
  }
  styleHeader(itinerary)

  const other = wb.addWorksheet('Other costs')
  other.columns = [
    { header: t('pdf.name'), key: 'name', width: 24 },
    { header: t('pdf.frequency'), key: 'frequency', width: 14 },
    { header: t('pdf.amount'), key: 'amount', width: 14, style: { numFmt: MONEY } },
    { header: t('pdf.currency'), key: 'currency', width: 10 },
    { header: t('pdf.days'), key: 'days', width: 8 },
    { header: t('pdf.total'), key: 'total', width: 16, style: { numFmt: MONEY } },
    { header: t('pdf.totalIn', { currency: cur }), key: 'converted', width: 18, style: { numFmt: MONEY } }
  ]
  for (const cost of costs) {
    const line = summary.costs.find(c => c.id === cost.id)
    other.addRow({
      name: cost.name,
      frequency: cost.frequency === 'daily' ? t('costs.daily') : t('costs.oneTime'),
      amount: Number(cost.amount),
      currency: cost.currency,
      days: cost.frequency === 'daily' ? (cost.days ?? summary.tripDays) : null,
      total: line?.total ?? null,
      converted: line?.converted ?? null
    })
  }
  styleHeader(other)

  const sum = wb.addWorksheet('Summary')
  sum.columns = [{ key: 'label', width: 30 }, { key: 'value', width: 20 }, { key: 'c', width: 12 }, { key: 'd', width: 22 }]
  sum.addRow([t('pdf.summary'), cur])
  sum.addRow([t('pdf.itineraryTotal'), summary.itineraryTotal])
  for (const [type, value] of Object.entries(summary.byType)) sum.addRow([`  ${t(`itemTypes.${type}`)}`, value])
  sum.addRow([t('pdf.otherCostsTotal'), summary.otherCostsTotal])
  sum.addRow([t('pdf.grandTotal'), summary.grandTotal]).font = { bold: true }
  if (summary.budgetAmount != null && summary.remaining != null) {
    sum.addRow([t('pdf.expectedBudget'), summary.budgetAmount])
    sum.addRow([summary.remaining < 0 ? t('pdf.over') : t('pdf.remaining'), Math.abs(summary.remaining)]).font = { bold: true }
  }
  if (summary.missingRates.length > 0) sum.addRow([t('pdf.missingRates', { currencies: summary.missingRates.join(', ') })])
  sum.getColumn('value').numFmt = MONEY
  styleHeader(sum)

  sum.addRow([])
  const ratesHeader = sum.addRow([t('pdf.rates')])
  ratesHeader.font = { bold: true }
  sum.addRow([t('pdf.currency'), t('pdf.rate'), t('pdf.source'), t('pdf.fetchedAt')]).font = { bold: true }
  for (const r of rates) {
    const row = sum.addRow([r.currency, r.rate, t(`rates.${r.source}`), new Date(r.fetchedAt)])
    row.getCell(2).numFmt = '0.000000'
    row.getCell(4).numFmt = 'yyyy-mm-dd hh:mm'
  }

  return Buffer.from(await wb.xlsx.writeBuffer())
}
