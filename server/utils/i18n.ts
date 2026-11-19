import en from '../../i18n/locales/en.json'
import id from '../../i18n/locales/id.json'

const messages: Record<'en' | 'id', unknown> = { en, id }

/** Minimal `$t` for server-rendered exports: dotted key lookup + `{name}` interpolation. */
export function serverT(locale: 'en' | 'id', key: string, params: Record<string, string | number> = {}): string {
  let node = messages[locale]
  for (const part of key.split('.')) {
    node = node && typeof node === 'object' && part in node ? Reflect.get(node, part) : undefined
  }
  const template = typeof node === 'string' ? node : key
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match))
}
