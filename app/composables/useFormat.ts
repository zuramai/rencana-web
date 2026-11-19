/** Intl helpers bound to the active UI language. */
export function useFormat() {
  const { locale } = useI18n()
  const intlLocale = computed(() => (locale.value === 'id' ? 'id-ID' : 'en-US'))
  return {
    intlLocale,
    money: (amount: number | string, currency: string, compact = false) =>
      formatMoney(Number(amount), currency, intlLocale.value, compact),
    period: (p: Period) => formatPeriod(p, intlLocale.value),
    dayLabel: (date: string) => formatDayLabel(date, intlLocale.value)
  }
}
