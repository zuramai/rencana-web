import { FetchError } from 'ofetch'

/** Maps an API error (statusMessage code) to a translated message. */
export function useErrorMessage() {
  const { t, te } = useI18n()
  return (error: unknown): string => {
    if (error instanceof FetchError) {
      const code = error.data?.statusMessage ?? error.statusMessage
      if (code && te(`errors.${code}`)) return t(`errors.${code}`)
      if (error.statusCode === 400) return t('errors.validation')
    }
    return t('common.somethingWrong')
  }
}
