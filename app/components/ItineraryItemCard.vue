<script setup lang="ts">
const props = defineProps<{ item: ItemDto }>()
defineEmits<{ open: [] }>()
const { money, dayLabel } = useFormat()

const startTime = computed(() => props.item.startsAt.slice(11))
const endLabel = computed(() => {
  const end = props.item.endsAt
  if (!end || props.item.allDay) return null
  return end.slice(0, 10) === props.item.startsAt.slice(0, 10) ? end.slice(11) : `→ ${dayLabel(end.slice(0, 10)).replace(/^[^,]*,\s*/, '')}`
})
</script>

<template>
  <div class="flex items-start gap-2">
    <div class="w-[50px] shrink-0 pt-3.5">
      <p class="text-[13px] leading-[18px] font-semibold">
        {{ item.allDay ? $t('itinerary.allDay') : startTime }}
      </p>
      <p
        v-if="endLabel"
        class="text-xs font-semibold text-muted"
      >
        {{ endLabel }}
      </p>
    </div>
    <button
      type="button"
      class="card flex min-w-0 flex-1 items-start gap-2.5 p-3 text-left"
      @click="$emit('open')"
    >
      <TypeChip :type="item.type" />
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <p class="font-semibold break-words">
          {{ item.description }}
        </p>
        <div
          v-if="item.price != null || item.link"
          class="flex flex-wrap items-center gap-2"
        >
          <span
            v-if="item.price != null && item.currency"
            class="rounded-full bg-[#E0F2F1] px-2 py-0.5 text-xs font-semibold text-primary-700"
          >
            {{ money(item.price, item.currency) }}
          </span>
          <a
            v-if="item.link"
            :href="item.link"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1 text-xs font-semibold text-primary"
            @click.stop
          >
            <UIcon
              name="i-lucide-link"
              class="size-3.5"
            />
            {{ $t('itinerary.link') }}
          </a>
        </div>
        <p
          v-if="item.note"
          class="line-clamp-2 text-sm text-muted"
        >
          {{ item.note }}
        </p>
      </div>
      <img
        v-if="item.imageFileId"
        :src="`/api/files/${item.imageFileId}?size=thumb`"
        alt=""
        class="size-14 shrink-0 rounded-[14px] object-cover"
        loading="lazy"
      >
    </button>
  </div>
</template>
