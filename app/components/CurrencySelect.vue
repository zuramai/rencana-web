<script setup lang="ts">
const model = defineModel<string>({ required: true })
withDefaults(defineProps<{ short?: boolean }>(), { short: false })

const { intlLocale } = useFormat()
const items = computed(() => currencyOptions(intlLocale.value))
</script>

<template>
  <USelectMenu
    v-model="model"
    :items="items"
    value-key="value"
    :search-input="{ placeholder: 'IDR, JPY…' }"
    :filter-fields="['value', 'label']"
    :ui="{ content: 'min-w-72' }"
    :aria-label="$t('common.currency')"
    trailing-icon="i-lucide-chevron-down"
  >
    <template
      v-if="short"
      #default
    >
      <span class="font-semibold">{{ model }}</span>
    </template>
  </USelectMenu>
</template>
