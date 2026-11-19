<script setup lang="ts">
const { $api } = useNuxtApp()
const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ planId: string, ticket: TicketDto | null }>()
const emit = defineEmits<{ saved: [] }>()
const { t } = useI18n()
const toast = useToast()
const errorMessage = useErrorMessage()

interface NewFile { key: number, file: File, url: string | null }
const state = reactive({ kind: 'flight' as TicketKind, title: '', description: '', locationText: '', locationUrl: '' })
const removedIds = ref<string[]>([])
const added = ref<NewFile[]>([])
const input = useTemplateRef<HTMLInputElement>('input')
const pending = ref(false)
let seq = 0

const existing = computed(() => props.ticket?.files.filter(f => !removedIds.value.includes(f.id)) ?? [])

function revokeAll() {
  for (const f of added.value) if (f.url) URL.revokeObjectURL(f.url)
}

watch(open, (isOpen) => {
  if (!isOpen) return
  revokeAll()
  const tk = props.ticket
  Object.assign(state, tk
    ? { kind: tk.kind, title: tk.title, description: tk.description ?? '', locationText: tk.locationText ?? '', locationUrl: tk.locationUrl ?? '' }
    : { kind: 'flight', title: '', description: '', locationText: '', locationUrl: '' })
  removedIds.value = []
  added.value = []
})
onBeforeUnmount(revokeAll)

function pick(event: Event) {
  const el = event.target as HTMLInputElement
  for (const file of Array.from(el.files ?? [])) {
    added.value.push({ key: seq++, file, url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null })
  }
  el.value = ''
}
function removeAdded(key: number) {
  const f = added.value.find(x => x.key === key)
  if (f?.url) URL.revokeObjectURL(f.url)
  added.value = added.value.filter(x => x.key !== key)
}

async function save() {
  if (existing.value.length + added.value.length === 0) {
    toast.add({ title: t('errors.files_required'), color: 'error' })
    return
  }
  const body = new FormData()
  body.append('data', JSON.stringify({ ...state, removeFileIds: removedIds.value }))
  for (const f of added.value) body.append('files', f.file)
  pending.value = true
  try {
    if (props.ticket) await $api(`/api/plans/${props.planId}/tickets/${props.ticket.id}`, { method: 'PATCH', body })
    else await $api(`/api/plans/${props.planId}/tickets`, { method: 'POST', body })
    toast.add({ title: t('tickets.saved'), color: 'success', icon: 'i-lucide-check' })
    open.value = false
    emit('saved')
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <FormDrawer
    v-model:open="open"
    :title="ticket ? $t('tickets.editTicket') : $t('tickets.newTicket')"
  >
    <form
      id="ticket-form"
      class="flex flex-col gap-3.5"
      @submit.prevent="save"
    >
      <div class="flex flex-col gap-1.5">
        <span class="text-[13px] font-semibold text-muted">{{ $t('tickets.kind') }}</span>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="kind in TICKET_KINDS"
            :key="kind.value"
            type="button"
            class="flex h-9 items-center gap-1 rounded-full pr-2.5 pl-2 text-sm font-semibold ring-[1.5px] ring-inset"
            :class="state.kind === kind.value ? 'bg-[#E0F2F1] text-primary-700 ring-primary' : 'bg-white ring-[#F0E6DA]'"
            :aria-pressed="state.kind === kind.value"
            @click="state.kind = kind.value"
          >
            <UIcon
              :name="kind.icon"
              class="size-4"
              :class="state.kind === kind.value ? '' : 'text-muted'"
            />
            {{ $t(`ticketKinds.${kind.value}`) }}
          </button>
        </div>
      </div>
      <UFormField
        :label="$t('tickets.title')"
        name="title"
      >
        <UInput
          v-model="state.title"
          required
          maxlength="120"
          :placeholder="$t('tickets.titlePlaceholder')"
          class="w-full"
        />
      </UFormField>
      <UFormField
        :label="$t('tickets.description')"
        name="description"
      >
        <UTextarea
          v-model="state.description"
          :rows="2"
          autoresize
          maxlength="2000"
          class="w-full"
        />
      </UFormField>
      <UFormField
        :label="$t('tickets.location')"
        name="locationText"
      >
        <UInput
          v-model="state.locationText"
          maxlength="200"
          class="w-full"
        />
      </UFormField>
      <UFormField
        :label="$t('tickets.locationLink')"
        name="locationUrl"
      >
        <UInput
          v-model="state.locationUrl"
          type="url"
          inputmode="url"
          placeholder="https://"
          class="w-full"
        />
      </UFormField>
      <div class="flex flex-col gap-1.5">
        <span class="text-[13px] font-semibold text-muted">{{ $t('tickets.files') }}</span>
        <div class="flex flex-wrap gap-2.5">
          <div
            v-for="file in existing"
            :key="file.id"
            class="relative size-[74px] overflow-hidden rounded-[14px]"
          >
            <img
              v-if="file.contentType.startsWith('image/')"
              :src="apiUrl(`/api/files/${file.id}?size=thumb`)"
              alt=""
              class="size-full object-cover"
            >
            <PdfTile
              v-else
              :name="file.originalName"
            />
            <button
              type="button"
              class="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-stone-900/80 text-white"
              :aria-label="$t('common.remove')"
              @click="removedIds.push(file.id)"
            >
              <UIcon
                name="i-lucide-x"
                class="size-3"
              />
            </button>
          </div>
          <div
            v-for="f in added"
            :key="f.key"
            class="relative size-[74px] overflow-hidden rounded-[14px]"
          >
            <img
              v-if="f.url"
              :src="f.url"
              alt=""
              class="size-full object-cover"
            >
            <PdfTile
              v-else
              :name="f.file.name"
            />
            <button
              type="button"
              class="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-stone-900/80 text-white"
              :aria-label="$t('common.remove')"
              @click="removeAdded(f.key)"
            >
              <UIcon
                name="i-lucide-x"
                class="size-3"
              />
            </button>
          </div>
          <button
            type="button"
            class="flex size-[74px] flex-col items-center justify-center gap-0.5 rounded-[14px] border-[1.5px] border-dashed border-primary bg-[#F0FDFA] text-xs font-semibold text-primary"
            @click="input?.click()"
          >
            <UIcon
              name="i-lucide-image-plus"
              class="size-[22px]"
            />
            {{ $t('common.add') }}
          </button>
        </div>
        <input
          ref="input"
          type="file"
          accept="image/*,application/pdf"
          multiple
          class="hidden"
          @change="pick"
        >
      </div>
    </form>
    <template #footer>
      <UButton
        type="submit"
        form="ticket-form"
        block
        :loading="pending"
        class="h-[52px] text-base"
      >
        {{ $t('tickets.saveTicket') }}
      </UButton>
    </template>
  </FormDrawer>
</template>
