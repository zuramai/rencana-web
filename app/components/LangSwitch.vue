<script setup lang="ts">
const { locale, setLocale } = useI18n()
const cookie = useCookie<'en' | 'id' | null>('rencana_locale', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })

function choose(code: 'en' | 'id') {
  cookie.value = code
  setLocale(code)
}
</script>

<template>
  <div class="flex items-center gap-0.5 rounded-full border-[1.5px] border-default bg-white py-1 pr-1 pl-2.5">
    <UIcon
      name="i-lucide-globe"
      class="mr-0.5 size-4 text-muted"
    />
    <button
      v-for="code in (['en', 'id'] as const)"
      :key="code"
      type="button"
      class="h-7 rounded-full px-3 text-[13px] font-semibold uppercase transition-colors"
      :class="locale === code ? 'bg-primary text-white' : 'text-muted'"
      :aria-pressed="locale === code"
      @click="choose(code)"
    >
      {{ code }}
    </button>
  </div>
</template>
