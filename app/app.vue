<script setup lang="ts">
import * as uiLocales from '@nuxt/ui/locale'

const { locale } = useI18n()
const uiLocale = computed(() => (locale.value === 'id' ? uiLocales.id : uiLocales.en))

useHead({ htmlAttrs: { lang: locale } })
</script>

<template>
  <UApp
    :locale="uiLocale"
    :toaster="{ position: 'top-center' }"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
