<script setup lang="ts">
const { user } = useAuth()
const initial = computed(() => user.value?.displayName.trim().charAt(0).toUpperCase() || 'K')
</script>

<template>
  <header class="sticky top-0 z-30 bg-[#FFFBF5]/95 backdrop-blur">
    <div class="mx-auto flex h-[60px] max-w-md items-center px-4">
      <NuxtLink
        to="/travel"
        class="flex items-center gap-1.5"
      >
        <AppMascot
          pose="happy"
          :size="32"
        />
        <span class="text-2xl font-extrabold tracking-[-0.02em] text-primary">rencana</span>
      </NuxtLink>
      <NuxtLink
        to="/settings"
        class="ml-auto"
        :aria-label="$t('nav.settings')"
      >
        <img
          v-if="user?.avatarUrl"
          :src="user.avatarUrl"
          alt=""
          class="size-9 rounded-full object-cover"
          referrerpolicy="no-referrer"
        >
        <span
          v-else
          class="flex size-9 items-center justify-center rounded-full bg-secondary-400 text-sm font-bold text-white"
        >
          {{ initial }}
        </span>
      </NuxtLink>
    </div>
  </header>
</template>
