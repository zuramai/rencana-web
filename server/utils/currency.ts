import { getTimezone } from 'countries-and-timezones'
import countryToCurrency from 'country-to-currency'

const currencyByCountry: Record<string, string> = countryToCurrency

/** Default currency from the browser time zone, else the Accept-Language region, else USD. */
export function detectCurrency(timezone?: string, acceptLanguage?: string): string {
  let country: string | undefined = timezone ? getTimezone(timezone)?.countries[0] : undefined
  if (!country && acceptLanguage) {
    for (const tag of acceptLanguage.split(',')) {
      const region = tag.split(';')[0]!.trim().split('-')[1]
      if (region && /^[a-z]{2}$/i.test(region)) {
        country = region.toUpperCase()
        break
      }
    }
  }
  return (country && currencyByCountry[country]) || 'USD'
}
