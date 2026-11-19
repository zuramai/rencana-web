<script setup lang="ts">
const route = useRoute()
const tabs = [
  { to: '/travel', icon: 'i-lucide-plane', label: 'nav.travel' },
  { to: '/budget', icon: 'i-lucide-wallet', label: 'nav.budget' }
]
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-default bg-white pb-[max(env(safe-area-inset-bottom),24px)]">
    <div class="mx-auto flex max-w-md gap-3 px-5 pt-2.5">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex h-12 flex-1 items-center justify-center gap-2 rounded-full font-semibold transition-colors"
        :class="route.path.startsWith(tab.to) ? 'bg-primary text-white' : 'text-muted'"
      >
        <UIcon
          :name="tab.icon"
          class="size-5"
        />
        {{ $t(tab.label) }}
      </NuxtLink>
    </div>
  </nav>
</template>
