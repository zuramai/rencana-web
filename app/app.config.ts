// Design: 52px fields, radius 14, white, 1.5px #F0E6DA border (FigCraft "Input").
const field = 'bg-white ring-[1.5px] ring-[#F0E6DA] min-h-[52px] px-4 text-base'
const fieldVariant = [{ color: 'primary' as const, variant: 'outline' as const, class: { base: field } }]

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'teal',
      secondary: 'orange',
      neutral: 'stone'
    },
    button: {
      slots: { base: 'rounded-full font-semibold' }
    },
    input: {
      slots: { base: 'rounded-[14px]' },
      compoundVariants: fieldVariant
    },
    textarea: {
      slots: { base: 'rounded-[14px]' },
      compoundVariants: [{ color: 'primary', variant: 'outline', class: { base: 'bg-white ring-[1.5px] ring-[#F0E6DA] px-4 text-base' } }]
    },
    selectMenu: {
      slots: { base: 'rounded-[14px]' },
      compoundVariants: fieldVariant
    },
    select: {
      slots: { base: 'rounded-[14px]' },
      compoundVariants: fieldVariant
    },
    modal: {
      slots: { content: 'bg-white' },
      // Design backdrop #1C191766; the overlay colour lives in the `overlay` variant.
      variants: { overlay: { true: { overlay: 'bg-stone-900/40' } } }
    },
    drawer: {
      slots: { overlay: 'bg-stone-900/40' }
    },
    formField: {
      slots: { label: 'text-[13px] font-semibold text-muted', container: 'mt-1.5' }
    }
  }
})
