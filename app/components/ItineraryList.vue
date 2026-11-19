<script setup lang="ts">
const props = defineProps<{ items: ItemDto[] }>()
defineEmits<{ open: [item: ItemDto], add: [] }>()
const { dayLabel } = useFormat()
const days = computed(() => groupByDay(props.items))
</script>

<template>
  <div
    v-if="items.length"
    class="flex flex-col gap-3"
  >
    <template
      v-for="day in days"
      :key="day.date"
    >
      <h3 class="flex items-center gap-1.5 pt-1.5 text-sm font-bold">
        <span class="text-primary-700">{{ $t('itinerary.day', { n: day.dayNumber }) }}</span>
        <span class="text-muted">·</span>
        <span class="text-muted">{{ dayLabel(day.date) }}</span>
      </h3>
      <ItineraryItemCard
        v-for="item in day.items"
        :key="item.id"
        :item="item"
        @open="$emit('open', item)"
      />
    </template>
  </div>
  <EmptyState
    v-else
    pose="map"
    :size="136"
    :title="$t('itinerary.emptyTitle')"
    :text="$t('itinerary.emptyText')"
  >
    <UButton
      class="h-[52px] w-[220px] justify-center text-base"
      @click="$emit('add')"
    >
      {{ $t('itinerary.addActivity') }}
    </UButton>
  </EmptyState>
</template>
