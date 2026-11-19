<script setup lang="ts">
const { $api } = useNuxtApp()
const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ planId: string, ticket: TicketDto | null }>()
const emit = defineEmits<{ edit: [], deleted: [] }>()
const { t } = useI18n()
const toast = useToast()
const errorMessage = useErrorMessage()

const index = ref(0)
const confirmOpen = ref(false)
const pending = ref(false)
watch(() => props.ticket?.id, () => {
  index.value = 0
})

function onScroll(event: Event) {
  const el = event.target as HTMLElement
  index.value = Math.round(el.scrollLeft / el.clientWidth)
}

async function remove() {
  if (!props.ticket) return
  pending.value = true
  try {
    await $api(`/api/plans/${props.planId}/tickets/${props.ticket.id}`, { method: 'DELETE' })
    toast.add({ title: t('tickets.deleted'), color: 'neutral', icon: 'i-lucide-trash-2' })
    confirmOpen.value = false
    open.value = false
    emit('deleted')
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    fullscreen
    :ui="{ content: 'bg-[#0C0A09] text-white' }"
    :title="ticket?.title ?? ''"
  >
    <template #content>
      <div
        v-if="ticket"
        class="mx-auto flex h-full max-w-md flex-col overflow-y-auto pb-6"
      >
        <div class="flex items-center justify-between px-4 pt-3">
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            class="size-10 justify-center bg-white/10 text-white hover:bg-white/20"
            :aria-label="$t('common.close')"
            @click="open = false"
          />
          <span class="text-sm font-bold">{{ index + 1 }} / {{ ticket.files.length }}</span>
        </div>
        <div
          class="mt-4 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
          @scroll.passive="onScroll"
        >
          <div
            v-for="file in ticket.files"
            :key="file.id"
            class="w-full shrink-0 snap-center px-4"
          >
            <a
              v-if="file.contentType === 'application/pdf'"
              :href="apiUrl(`/api/files/${file.id}`)"
              target="_blank"
              rel="noopener"
              class="block h-[400px] overflow-hidden rounded-[20px]"
            >
              <PdfTile :name="file.originalName" />
            </a>
            <img
              v-else
              :src="apiUrl(`/api/files/${file.id}`)"
              :alt="ticket.title"
              class="max-h-[60dvh] w-full rounded-[20px] object-contain"
            >
          </div>
        </div>
        <div
          v-if="ticket.files.length > 1"
          class="mt-4 flex justify-center gap-1.5"
        >
          <span
            v-for="(file, i) in ticket.files"
            :key="file.id"
            class="size-2 rounded-full"
            :class="i === index ? 'bg-white' : 'bg-white/40'"
          />
        </div>
        <div class="mt-5 flex flex-col gap-2.5 px-4">
          <KindChip :kind="ticket.kind" />
          <h2 class="text-xl font-bold">
            {{ ticket.title }}
          </h2>
          <p
            v-if="ticket.description"
            class="text-sm whitespace-pre-line text-stone-300"
          >
            {{ ticket.description }}
          </p>
          <a
            v-if="ticket.locationUrl"
            :href="ticket.locationUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 text-sm font-bold text-primary-400"
          >
            <UIcon
              name="i-lucide-map-pin"
              class="size-4"
            />
            {{ ticket.locationText || ticket.locationUrl }}
            <UIcon
              name="i-lucide-external-link"
              class="size-3.5"
            />
          </a>
          <p
            v-else-if="ticket.locationText"
            class="flex items-center gap-1.5 text-sm font-semibold text-stone-300"
          >
            <UIcon
              name="i-lucide-map-pin"
              class="size-4"
            />
            {{ ticket.locationText }}
          </p>
          <div class="mt-2 flex gap-3">
            <UButton
              block
              color="neutral"
              variant="solid"
              class="h-[52px] bg-white text-base text-stone-900 hover:bg-stone-100"
              @click="emit('edit')"
            >
              {{ $t('common.edit') }}
            </UButton>
            <UButton
              block
              color="error"
              class="h-[52px] text-base"
              @click="confirmOpen = true"
            >
              {{ $t('common.delete') }}
            </UButton>
          </div>
        </div>
        <ConfirmDelete
          v-model:open="confirmOpen"
          :title="$t('tickets.deleteTitle')"
          :text="$t('tickets.deleteText', { name: ticket.title })"
          :loading="pending"
          @confirm="remove"
        />
      </div>
    </template>
  </UModal>
</template>
