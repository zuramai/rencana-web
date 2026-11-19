// pdfmake 0.3 server build: `module.exports` is a singleton instance (js/index.js).
declare module 'pdfmake' {
  interface PdfMakeFontFiles {
    normal: string
    bold: string
    italics: string
    bolditalics: string
  }
  interface PdfMakeServer {
    sharedVirtualfs: {
      writeFileSync(path: string, content: Buffer): void
      existsSync(path: string): boolean
    }
    setFonts(fonts: Record<string, PdfMakeFontFiles>): void
    setUrlAccessPolicy(callback: (url: string) => boolean): void
    setLocalAccessPolicy(callback: (path: string) => boolean): void
    createPdf(docDefinition: object): { getBuffer(): Promise<Buffer> }
  }
  const pdfmake: PdfMakeServer
  export default pdfmake
}
