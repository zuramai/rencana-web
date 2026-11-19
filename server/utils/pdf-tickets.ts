import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type { TicketDto } from '#shared/types/dto'
import type { ExportContext } from './export-context'

const A4: [number, number] = [595.28, 841.89]
const MARGIN = 40
const TEAL = rgb(0.059, 0.463, 0.431)
const TEXT = rgb(0.11, 0.098, 0.09)
const MUTED = rgb(0.47, 0.443, 0.424)

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split(/\r?\n/)) {
    let line = ''
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word
      if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) {
        lines.push(line)
        line = word
      } else {
        line = candidate
      }
    }
    lines.push(line)
  }
  return lines
}

/** Draws the ticket header band; returns the y below it. */
function drawHeader(page: PDFPage, ticket: TicketDto, ctx: ExportContext, fonts: { regular: PDFFont, medium: PDFFont }, note?: string): number {
  const width = A4[0] - MARGIN * 2
  let y = A4[1] - MARGIN
  const line = (text: string, font: PDFFont, size: number, color = TEXT) => {
    for (const l of wrap(text, font, size, width)) {
      y -= size * 1.3
      page.drawText(l, { x: MARGIN, y, size, font, color })
    }
  }
  line(ctx.t(`ticketKinds.${ticket.kind}`).toUpperCase(), fonts.medium, 9, TEAL)
  line(ticket.title, fonts.medium, 18)
  const location = [ticket.locationText, ticket.locationUrl].filter(Boolean).join(' · ')
  if (location) line(location, fonts.regular, 10, MUTED)
  if (ticket.description) line(ticket.description, fonts.regular, 10)
  if (note) line(note, fonts.medium, 11, rgb(0.71, 0.325, 0.035))
  y -= 10
  page.drawLine({ start: { x: MARGIN, y }, end: { x: A4[0] - MARGIN, y }, thickness: 1, color: rgb(0.906, 0.878, 0.847) })
  return y - 14
}

export async function buildTicketsPdf(ctx: ExportContext, tickets: TicketDto[]): Promise<Buffer> {
  const out = await PDFDocument.create()
  out.registerFontkit(fontkit)
  out.setTitle(`${ctx.plan.name} – tickets`)
  out.setCreator('Rencana')
  const raw = await loadFonts()
  const fonts = { regular: await out.embedFont(raw.regular, { subset: true }), medium: await out.embedFont(raw.medium, { subset: true }) }

  const fileRows = await db.query.files.findMany({
    where: (f, { inArray }) => inArray(f.id, tickets.flatMap(t => t.files.map(x => x.id)))
  })
  const keyOf = new Map(fileRows.map(f => [f.id, f.s3Key]))

  for (const ticket of tickets) {
    for (const file of ticket.files) {
      const key = keyOf.get(file.id)
      if (!key) continue
      const bytes = await getObjectBytes(key)
      if (file.contentType === 'application/pdf') {
        const headerPage = out.addPage(A4)
        try {
          const source = await PDFDocument.load(bytes)
          const pages = await out.copyPages(source, source.getPageIndices())
          drawHeader(headerPage, ticket, ctx, fonts, file.originalName)
          for (const p of pages) out.addPage(p)
        } catch {
          // Encrypted or corrupt PDF: keep the export, note the missing attachment.
          drawHeader(headerPage, ticket, ctx, fonts, ctx.t('pdf.pdfNotIncluded', { name: file.originalName }))
        }
      } else {
        const page = out.addPage(A4)
        const top = drawHeader(page, ticket, ctx, fonts)
        const image = await out.embedJpg(bytes)
        const maxW = A4[0] - MARGIN * 2
        const maxH = top - MARGIN
        const scale = Math.min(maxW / image.width, maxH / image.height, 1)
        const w = image.width * scale
        const h = image.height * scale
        page.drawImage(image, { x: (A4[0] - w) / 2, y: top - h, width: w, height: h })
      }
    }
  }
  return Buffer.from(await out.save())
}
