declare module '#auth-utils' {
  interface User {
    id: string
    displayName: string
    avatarUrl: string | null
    locale: 'en' | 'id'
    defaultCurrency: string
  }
}

export {}
