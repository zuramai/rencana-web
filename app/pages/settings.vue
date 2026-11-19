<script setup lang="ts">
const { $api } = useNuxtApp()
definePageMeta({ topBar: false })

const { t } = useI18n()
const toast = useToast()
const errorMessage = useErrorMessage()
const { user, refresh: refreshSession, clear } = useAuth()
const localeCookie = useCookie<'en' | 'id' | null>('rencana_locale', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })

const form = reactive({
  displayName: user.value?.displayName ?? '',
  locale: user.value?.locale ?? 'en',
  defaultCurrency: user.value?.defaultCurrency ?? 'USD'
})
const languages = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Bahasa Indonesia' }
]
const pending = ref(false)
const initial = computed(() => form.displayName.trim().charAt(0).toUpperCase() || 'K')

async function save() {
  pending.value = true
  try {
    await $api('/api/me', { method: 'PATCH', body: form })
    localeCookie.value = form.locale
    await refreshSession()
    toast.add({ title: t('settings.saved'), color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  } finally {
    pending.value = false
  }
}

async function logout() {
  await $api('/api/auth/logout', { method: 'POST' })
  clear()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PageHeader
      :title="$t('settings.title')"
      back="/travel"
    />
    <div class="flex flex-col items-center gap-2">
      <img
        v-if="user?.avatarUrl"
        :src="user.avatarUrl"
        alt=""
        class="size-[88px] rounded-full object-cover"
        referrerpolicy="no-referrer"
      >
      <span
        v-else
        class="flex size-[88px] items-center justify-center rounded-full bg-secondary-400 text-[28px] font-extrabold text-white"
      >{{ initial }}</span>
      <span
        v-if="user?.username"
        class="text-[13px] font-semibold text-muted"
      >@{{ user.username }}</span>
      <span
        v-else-if="user?.email"
        class="text-[13px] font-semibold text-muted"
      >{{ user.email }}</span>
    </div>
    <form
      class="flex flex-col gap-4"
      @submit.prevent="save"
    >
      <div class="card flex flex-col gap-3.5 p-4">
        <UFormField
          :label="$t('auth.displayName')"
          name="displayName"
        >
          <UInput
            v-model="form.displayName"
            required
            maxlength="60"
            class="w-full"
          />
        </UFormField>
        <UFormField
          :label="$t('settings.language')"
          name="locale"
        >
          <USelect
            v-model="form.locale"
            :items="languages"
            value-key="value"
            class="w-full"
          />
        </UFormField>
        <UFormField
          :label="$t('settings.defaultCurrency')"
          name="defaultCurrency"
        >
          <CurrencySelect
            v-model="form.defaultCurrency"
            class="w-full"
          />
        </UFormField>
      </div>
      <UButton
        type="submit"
        block
        :loading="pending"
        class="h-[52px] text-base"
      >
        {{ $t('common.save') }}
      </UButton>
      <UButton
        type="button"
        block
        color="error"
        variant="ghost"
        class="h-[52px] text-base"
        @click="logout"
      >
        {{ $t('auth.logout') }}
      </UButton>
    </form>
  </div>
</template>
