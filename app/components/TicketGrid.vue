<script setup lang="ts">
const props = defineProps<{ tickets: TicketDto[] }>()
defineEmits<{ open: [ticket: TicketDto], add: [] }>()
const columns = computed(() => [props.tickets.filter((_, i) => i % 2 === 0), props.tickets.filter((_, i) => i % 2 === 1)])
</script>

<template>
  <div
    v-if="tickets.length"
    class="flex flex-col gap-3"
  >
    <div class="flex items-start gap-3">
      <div
        v-for="(column, c) in columns"
        :key="c"
        class="flex min-w-0 flex-1 flex-col gap-3"
      >
        <button
          v-for="ticket in column"
          :key="ticket.id"
          type="button"
          class="card flex flex-col overflow-hidden text-left"
          @click="$emit('open', ticket)"
        >
          <div class="h-[110px] w-full overflow-hidden bg-[#F1F1F1]">
            <img
              v-if="ticket.files[0]?.contentType.startsWith('image/')"
              :src="`/api/files/${ticket.files[0].id}?size=thumb`"
              alt=""
              class="size-full object-cover"
              loading="lazy"
            >
            <PdfTile
              v-else-if="ticket.files[0]"
              :name="ticket.files[0].originalName"
            />
          </div>
          <div class="flex flex-col gap-1.5 px-3 pt-2.5 pb-3">
            <KindChip :kind="ticket.kind" />
            <p class="font-semibold break-words">
              {{ ticket.title }}
            </p>
            <p
              v-if="ticket.locationText"
              class="flex items-center gap-1 text-xs font-semibold text-muted"
            >
              <UIcon
                name="i-lucide-map-pin"
                class="size-3.5 shrink-0"
              />
              <span class="truncate">{{ ticket.locationText }}</span>
            </p>
          </div>
        </button>
      </div>
    </div>
    <UButton
      block
      color="neutral"
      variant="outline"
      class="h-[52px] bg-white text-base ring-[1.5px] ring-[#F0E6DA]"
      @click="$emit('add')"
    >
      {{ $t('tickets.addTicket') }}
    </UButton>
  </div>
  <EmptyState
    v-else
    pose="map"
    :size="136"
    :title="$t('tickets.emptyTitle')"
    :text="$t('tickets.emptyText')"
  >
    <UButton
      class="h-[52px] w-[220px] justify-center text-base"
      @click="$emit('add')"
    >
      {{ $t('tickets.addTicket') }}
    </UButton>
  </EmptyState>
</template>
