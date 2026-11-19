<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{
  planId: string
  budgetCurrency: string
  tripDays: number
  cost: CostDto | null
  preset: typeof COST_PRESETS[number] | null
}>()
const emit = defineEmits<{ saved: [] }>()

const { t } = useI18n()
const toast = useToast()
const errorMessage = useErrorMessage()
const { money } = useFormat()

const state = reactive({ name: '', frequency: 'one_time' as CostFrequency, currency: props.budgetCurrency, amount: '', useTripLength: true, days: 1 })
const selectedPreset = ref<string | null>(null)
const pending = ref(false)
const confirmOpen = ref(false)

function applyPreset(preset: typeof COST_PRESETS[number]) {
  selectedPreset.value = preset.key
  state.name = t(`costPresets.${preset.key}`)
  state.frequency = preset.frequency
}

watch(open, (isOpen) => {
  if (!isOpen) return
  const c = props.cost
  selectedPreset.value = null
  Object.assign(state, c
    ? { name: c.name, frequency: c.frequency, currency: c.currency, amount: amountToInput(c.amount), useTripLength: c.days == null, days: c.days ?? props.tripDays }
    : { name: '', frequency: 'one_time', currency: props.budgetCurrency, amount: '', useTripLength: true, days: props.tripDays })
  if (!c && props.preset) applyPreset(props.preset)
})

const total = computed(() => {
  const amount = Number(normalizeAmount(state.amount) ?? 0)
  if (!Number.isFinite(amount)) return null
  return state.frequency === 'daily' ? amount * (state.useTripLength ? props.tripDays : state.days) : amount
})

async function save() {
  const body = {
    name: state.name,
    frequency: state.frequency,
    currency: state.currency,
    amount: normalizeAmount(state.amount) ?? '',
    days: state.frequency === 'daily' && !state.useTripLength ? state.days : null
  }
  pending.value = true
  try {
    if (props.cost) await $fetch(`/api/plans/${props.planId}/costs/${props.cost.id}`, { method: 'PATCH', body })
    else await $fetch(`/api/plans/${props.planId}/costs`, { method: 'POST', body })
    open.value = false
    emit('saved')
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  } finally {
    pending.value = false
  }
}

async function remove() {
  if (!props.cost) return
  pending.value = true
  try {
    await $fetch(`/api/plans/${props.planId}/costs/${props.cost.id}`, { method: 'DELETE' })
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
    :title="cost ? $t('costs.editCost') : $t('costs.newCost')"
  >
    <form
      id="cost-form"
      class="flex flex-col gap-3.5"
      @submit.prevent="save"
    >
      <div class="flex flex-col gap-1.5">
        <span class="text-[13px] font-semibold text-muted">{{ $t('costs.presets') }}</span>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="option in COST_PRESETS"
            :key="option.key"
            type="button"
            class="h-9 rounded-full px-3.5 text-sm font-semibold ring-[1.5px] ring-inset"
            :class="selectedPreset === option.key ? 'bg-[#E0F2F1] text-primary-700 ring-primary' : 'bg-white ring-[#F0E6DA]'"
            @click="applyPreset(option)"
          >
            {{ $t(`costPresets.${option.key}`) }}
          </button>
        </div>
      </div>
      <UFormField
        :label="$t('costs.name')"
        name="name"
      >
        <UInput
          v-model="state.name"
          required
          maxlength="80"
          class="w-full"
        />
      </UFormField>
      <SegmentedControl
        v-model="state.frequency"
        :options="[{ value: 'one_time', label: $t('costs.oneTime') }, { value: 'daily', label: $t('costs.daily') }]"
      />
      <UFormField
        :label="state.frequency === 'daily' ? $t('costs.amountPerDay') : $t('costs.amount')"
        name="amount"
      >
        <MoneyInput
          v-model:currency="state.currency"
          v-model:amount="state.amount"
        />
      </UFormField>
      <template v-if="state.frequency === 'daily'">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="font-semibold">
              {{ $t('costs.useTripLength') }}
            </p>
            <p class="text-[13px] font-semibold text-muted">
              {{ $t('costs.tripLengthDays', { n: tripDays }) }}
            </p>
          </div>
          <USwitch
            v-model="state.useTripLength"
            size="xl"
            :aria-label="$t('costs.useTripLength')"
          />
        </div>
        <UFormField
          v-if="!state.useTripLength"
          :label="$t('costs.days')"
          name="days"
        >
          <UInputNumber
            v-model="state.days"
            :min="1"
            :max="365"
            class="w-full"
          />
        </UFormField>
      </template>
      <div
        v-if="total != null && state.amount"
        class="flex items-center justify-between rounded-[14px] bg-[#FAF6F0] px-3.5 py-3"
      >
        <span class="font-semibold text-muted">{{ $t('costs.total') }}</span>
        <span class="text-xl font-bold">{{ money(total, state.currency) }}</span>
      </div>
    </form>
    <template #footer>
      <UButton
        type="submit"
        form="cost-form"
        block
        :loading="pending"
        class="h-[52px] text-base"
      >
        {{ $t('common.save') }}
      </UButton>
      <UButton
        v-if="cost"
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
        :title="$t('costs.deleteTitle')"
        :text="$t('costs.deleteText', { name: cost?.name ?? '' })"
        :loading="pending"
        @confirm="remove"
      />
    </template>
  </FormDrawer>
</template>
