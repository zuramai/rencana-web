<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ planId: string, budgetCurrency: string, item: ItemDto | null, defaultStart: string }>()
const emit = defineEmits<{ saved: [] }>()

const { t } = useI18n()
const toast = useToast()
const errorMessage = useErrorMessage()

interface ItemFormState {
  type: ItemType
  description: string
  allDay: boolean
  start: string
  hasEnd: boolean
  end: string
  currency: string
  amount: string
  note: string
  link: string
  image: File | null
  removeImage: boolean
}

const state = reactive<ItemFormState>(blank())
const pending = ref(false)
const confirmOpen = ref(false)

function blank(): ItemFormState {
  return {
    type: 'activity', description: '', allDay: false, start: props.defaultStart, hasEnd: false, end: '',
    currency: props.budgetCurrency, amount: '', note: '', link: '', image: null, removeImage: false
  }
}

watch(open, (isOpen) => {
  if (!isOpen) return
  const i = props.item
  Object.assign(state, i
    ? {
        type: i.type,
        description: i.description,
        allDay: i.allDay,
        start: i.allDay ? i.startsAt.slice(0, 10) : i.startsAt,
        hasEnd: i.endsAt != null,
        end: i.endsAt ? (i.allDay ? i.endsAt.slice(0, 10) : i.endsAt) : '',
        currency: i.currency ?? props.budgetCurrency,
        amount: amountToInput(i.price),
        note: i.note ?? '',
        link: i.link ?? '',
        image: null,
        removeImage: false
      }
    : blank())
})

// Switching all-day converts between `YYYY-MM-DD` and `YYYY-MM-DDTHH:mm` inputs.
watch(() => state.allDay, (allDay) => {
  const convert = (v: string) => (!v ? v : allDay ? v.slice(0, 10) : `${v.slice(0, 10)}T09:00`)
  state.start = convert(state.start)
  state.end = convert(state.end)
})

const toWallClock = (v: string) => (state.allDay ? `${v.slice(0, 10)}T00:00` : v)

async function save() {
  const price = normalizeAmount(state.amount)
  const data = {
    type: state.type,
    description: state.description,
    allDay: state.allDay,
    startsAt: toWallClock(state.start),
    endsAt: state.hasEnd && state.end ? toWallClock(state.end) : null,
    currency: price == null ? null : state.currency,
    price,
    note: state.note,
    link: state.link,
    removeImage: state.removeImage
  }
  const body = new FormData()
  body.append('data', JSON.stringify(data))
  if (state.image) body.append('image', state.image)
  pending.value = true
  try {
    if (props.item) await $fetch(`/api/plans/${props.planId}/items/${props.item.id}`, { method: 'PATCH', body })
    else await $fetch(`/api/plans/${props.planId}/items`, { method: 'POST', body })
    toast.add({ title: t('itinerary.saved'), color: 'success', icon: 'i-lucide-check' })
    open.value = false
    emit('saved')
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  } finally {
    pending.value = false
  }
}

async function remove() {
  if (!props.item) return
  pending.value = true
  try {
    await $fetch(`/api/plans/${props.planId}/items/${props.item.id}`, { method: 'DELETE' })
    toast.add({ title: t('itinerary.deleted'), color: 'neutral', icon: 'i-lucide-trash-2' })
    confirmOpen.value = false
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
    :title="item ? $t('itinerary.editActivity') : $t('itinerary.newActivity')"
  >
    <form
      id="item-form"
      class="flex flex-col gap-3.5"
      @submit.prevent="save"
    >
      <div class="flex flex-col gap-1.5">
        <span class="text-[13px] font-semibold text-muted">{{ $t('itinerary.type') }}</span>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="type in ITEM_TYPES"
            :key="type.value"
            type="button"
            class="flex flex-col items-center gap-1 rounded-[14px] py-2"
            :class="state.type === type.value ? 'bg-[#E0F2F1] ring-2 ring-primary ring-inset' : 'bg-[#FAF6F0]'"
            :aria-pressed="state.type === type.value"
            @click="state.type = type.value"
          >
            <TypeChip :type="type.value" />
            <span
              class="text-xs font-semibold"
              :class="state.type === type.value ? 'text-default' : 'text-muted'"
            >{{ $t(`itemTypes.${type.value}`) }}</span>
          </button>
        </div>
      </div>
      <UFormField
        :label="$t('itinerary.description')"
        name="description"
      >
        <UInput
          v-model="state.description"
          required
          maxlength="200"
          :placeholder="$t('itinerary.descriptionPlaceholder')"
          class="w-full"
        />
      </UFormField>
      <div class="flex items-center justify-between">
        <span class="font-semibold">{{ $t('itinerary.allDay') }}</span>
        <USwitch
          v-model="state.allDay"
          size="xl"
          :aria-label="$t('itinerary.allDay')"
        />
      </div>
      <UFormField
        :label="$t('itinerary.starts')"
        name="start"
      >
        <UInput
          v-model="state.start"
          :type="state.allDay ? 'date' : 'datetime-local'"
          required
          class="w-full"
        />
      </UFormField>
      <div class="flex items-center justify-between">
        <span class="font-semibold">{{ $t('itinerary.addEndTime') }}</span>
        <USwitch
          v-model="state.hasEnd"
          size="xl"
          :aria-label="$t('itinerary.addEndTime')"
        />
      </div>
      <UFormField
        v-if="state.hasEnd"
        :label="$t('itinerary.ends')"
        name="end"
      >
        <UInput
          v-model="state.end"
          :type="state.allDay ? 'date' : 'datetime-local'"
          :min="state.start"
          required
          class="w-full"
        />
      </UFormField>
      <UFormField
        :label="$t('itinerary.price')"
        name="price"
      >
        <MoneyInput
          v-model:currency="state.currency"
          v-model:amount="state.amount"
          :placeholder="$t('common.optional')"
        />
      </UFormField>
      <UFormField
        :label="$t('itinerary.note')"
        name="note"
      >
        <UTextarea
          v-model="state.note"
          :rows="2"
          autoresize
          maxlength="2000"
          class="w-full"
        />
      </UFormField>
      <UFormField
        :label="$t('itinerary.linkLabel')"
        name="link"
      >
        <UInput
          v-model="state.link"
          type="url"
          inputmode="url"
          placeholder="https://"
          class="w-full"
        />
      </UFormField>
      <UFormField
        :label="$t('itinerary.image')"
        name="image"
      >
        <ImageField
          v-model:file="state.image"
          v-model:removed="state.removeImage"
          :existing-id="item?.imageFileId ?? null"
        />
      </UFormField>
    </form>
    <template #footer>
      <UButton
        type="submit"
        form="item-form"
        block
        :loading="pending"
        class="h-[52px] text-base"
      >
        {{ $t('common.save') }}
      </UButton>
      <UButton
        v-if="item"
        block
        color="error"
        variant="ghost"
        class="h-[52px] text-base"
        @click="confirmOpen = true"
      >
        {{ $t('common.delete') }}
      </UButton>
      <ConfirmDelete
        v-model:open="confirmOpen"
        :title="$t('itinerary.deleteTitle')"
        :text="$t('itinerary.deleteText', { name: item?.description ?? '' })"
        :loading="pending"
        @confirm="remove"
      />
    </template>
  </FormDrawer>
</template>
