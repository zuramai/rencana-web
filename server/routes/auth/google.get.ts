import { eq } from 'drizzle-orm'
import { getCookie, getRequestHeader, sendRedirect } from 'nuxt/server'
import { users } from '../../db/schema'

export default defineOAuthGoogleEventHandler({
  config: { scope: ['openid', 'email', 'profile'] },
  async onSuccess(event, { user: profile }) {
    let row = await db.query.users.findFirst({ where: eq(users.googleSub, profile.sub) })
    if (!row) {
      const locale = getCookie(event, 'rencana_locale') === 'id' ? 'id' : 'en'
      ;[row] = await db.insert(users).values({
        googleSub: profile.sub,
        email: profile.email ?? null,
        displayName: profile.name ?? profile.email ?? 'Traveler',
        avatarUrl: profile.picture ?? null,
        locale,
        defaultCurrency: detectCurrency(getCookie(event, 'rencana_tz'), getRequestHeader(event, 'accept-language'))
      }).onConflictDoUpdate({ target: users.googleSub, set: { email: profile.email ?? null } }).returning()
    }
    await replaceUserSession(event, { user: sessionUser(row!) })
    return sendRedirect(event, '/travel')
  },
  onError(event) {
    return sendRedirect(event, '/login?error=google')
  }
})
