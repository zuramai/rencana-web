<script setup lang="ts">
const currency = defineModel<string>('currency', { required: true })
const amount = defineModel<string>('amount', { required: true })
defineProps<{ placeholder?: string }>()
</script>

<template>
  <UFieldGroup class="w-full">
    <CurrencySelect
      v-model="currency"
      short
      class="w-24 shrink-0"
    />
    <UInput
      v-model="amount"
      inputmode="decimal"
      autocomplete="off"
      :placeholder="placeholder ?? '0'"
      class="flex-1"
    />
  </UFieldGroup>
</template>
