<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="min-h-dvh">
    <AppTopBar v-if="route.meta.topBar !== false" />
    <main class="mx-auto max-w-md px-4 pb-36">
      <slot />
    </main>
    <AppBottomNav />
  </div>
</template>
