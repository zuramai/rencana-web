<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const route = useRoute()
const { fetch: refreshSession } = useUserSession()
const errorMessage = useErrorMessage()

const form = reactive({ username: '', password: '' })
const pending = ref(false)
const error = ref<string | null>(route.query.error === 'google' ? t('errors.google') : null)

async function submit() {
  pending.value = true
  error.value = null
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: form })
    await refreshSession()
    await navigateTo('/travel')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-5">
    <AppMascot
      pose="wave"
      :size="160"
    />
    <div class="flex flex-col items-center gap-1 text-center">
      <h1 class="text-[28px] leading-[34px] font-extrabold">
        {{ $t('auth.welcomeBack') }}
      </h1>
      <p class="text-muted">
        {{ $t('auth.loginSubtitle') }}
      </p>
    </div>
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      :title="error"
      icon="i-lucide-circle-alert"
    />
    <GoogleButton />
    <OrDivider />
    <form
      class="flex w-full flex-col gap-5"
      @submit.prevent="submit"
    >
      <UFormField
        :label="$t('auth.username')"
        name="username"
      >
        <UInput
          v-model="form.username"
          autocomplete="username"
          autocapitalize="none"
          required
          class="w-full"
        />
      </UFormField>
      <UFormField
        :label="$t('auth.password')"
        name="password"
      >
        <UInput
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          required
          class="w-full"
        />
      </UFormField>
      <UButton
        type="submit"
        block
        :loading="pending"
        class="h-[52px] text-base"
      >
        {{ $t('auth.login') }}
      </UButton>
    </form>
    <p class="text-sm text-muted">
      {{ $t('auth.newHere') }}
      <NuxtLink
        to="/register"
        class="font-bold text-primary"
      >{{ $t('auth.createAnAccount') }}</NuxtLink>
    </p>
  </div>
</template>
