<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { locale } = useI18n()
const { fetch: refreshSession } = useUserSession()
const errorMessage = useErrorMessage()

const form = reactive({ displayName: '', username: '', password: '' })
const pending = ref(false)
const error = ref<string | null>(null)

async function submit() {
  pending.value = true
  error.value = null
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        ...form,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: locale.value === 'id' ? 'id' : 'en'
      }
    })
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
  <div class="-mt-4 flex flex-col items-center gap-[18px]">
    <AppMascot
      pose="wave"
      :size="120"
    />
    <div class="flex flex-col items-center gap-1 text-center">
      <h1 class="text-[28px] leading-[34px] font-extrabold">
        {{ $t('auth.createAccountTitle') }}
      </h1>
      <p class="text-muted">
        {{ $t('auth.registerSubtitle') }}
      </p>
    </div>
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      :title="error"
      icon="i-lucide-circle-alert"
    />
    <form
      class="flex w-full flex-col gap-[18px]"
      @submit.prevent="submit"
    >
      <UFormField
        :label="$t('auth.displayName')"
        name="displayName"
      >
        <UInput
          v-model="form.displayName"
          autocomplete="name"
          required
          maxlength="60"
          class="w-full"
        />
      </UFormField>
      <UFormField
        :label="$t('auth.username')"
        name="username"
      >
        <UInput
          v-model="form.username"
          autocomplete="username"
          autocapitalize="none"
          required
          pattern="[A-Za-z0-9_.]{3,32}"
          :title="$t('auth.usernameHint')"
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
          autocomplete="new-password"
          required
          minlength="8"
          :title="$t('auth.passwordHint')"
          maxlength="128"
          class="w-full"
        />
      </UFormField>
      <UButton
        type="submit"
        block
        :loading="pending"
        class="h-[52px] text-base"
      >
        {{ $t('auth.createAccount') }}
      </UButton>
    </form>
    <OrDivider />
    <GoogleButton />
    <p class="text-sm text-muted">
      {{ $t('auth.haveAccount') }}
      <NuxtLink
        to="/login"
        class="font-bold text-primary"
      >{{ $t('auth.login') }}</NuxtLink>
    </p>
  </div>
</template>
