<script setup lang="ts">
const props = defineProps<{ kind: TicketKind }>()
const icon = computed(() => TICKET_KINDS.find(k => k.value === props.kind)?.icon ?? 'i-lucide-ticket')
</script>

<template>
  <span class="inline-flex items-center gap-1 self-start rounded-full bg-[#E0F2F1] px-2 py-1 text-xs font-semibold text-primary-700">
    <UIcon
      :name="icon"
      class="size-3.5"
    />
    {{ $t(`ticketKinds.${kind}`) }}
  </span>
</template>
