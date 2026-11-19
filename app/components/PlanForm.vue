<script setup lang="ts">
import type { CoverValue } from './CoverPicker.vue'
import type { PeriodValue } from './PeriodInput.vue'

const { $api } = useNuxtApp()

const props = defineProps<{ plan?: PlanDto }>()
const emit = defineEmits<{ saved: [id: string] }>()

const { t } = useI18n()
const toast = useToast()
const errorMessage = useErrorMessage()
const { user } = useAuth()

const p = props.plan
const name = ref(p?.name ?? '')
const cover = ref<CoverValue>({
  coverType: p?.coverType === 'image' ? 'image' : 'emoji',
  coverEmoji: p?.coverEmoji ?? DEFAULT_COVER_EMOJI,
  coverColor: p?.coverColor ?? '#D6ECFF',
  coverFileId: p?.coverFileId ?? null,
  file: null
})
const period = ref<PeriodValue>({
  mode: p?.endYear != null ? 'range' : p?.startYear != null ? 'month' : 'none',
  startYear: p?.startYear ?? null,
  startMonth: p?.startMonth ?? null,
  endYear: p?.endYear ?? null,
  endMonth: p?.endMonth ?? null
})
const budgetCurrency = ref(p?.budgetCurrency ?? user.value?.defaultCurrency ?? 'USD')
const budgetAmount = ref(amountToInput(p?.budgetAmount))
const pending = ref(false)

async function submit() {
  if (cover.value.coverType === 'image' && !cover.value.file && !cover.value.coverFileId) {
    toast.add({ title: t('errors.cover_required'), color: 'error' })
    return
  }
  const data = {
    name: name.value,
    coverType: cover.value.coverType,
    coverEmoji: cover.value.coverEmoji,
    coverColor: cover.value.coverColor,
    startYear: period.value.startYear,
    startMonth: period.value.startMonth,
    endYear: period.value.mode === 'range' ? period.value.endYear : null,
    endMonth: period.value.mode === 'range' ? period.value.endMonth : null,
    budgetCurrency: budgetCurrency.value,
    budgetAmount: normalizeAmount(budgetAmount.value)
  }
  const body = new FormData()
  body.append('data', JSON.stringify(data))
  if (cover.value.coverType === 'image' && cover.value.file) body.append('image', cover.value.file)

  pending.value = true
  try {
    const res = p
      ? await $api<{ id: string }>(`/api/plans/${p.id}`, { method: 'PATCH', body })
      : await $api<{ id: string }>('/api/plans', { method: 'POST', body })
    emit('saved', res.id)
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <form
    class="flex flex-col gap-3 pb-24"
    @submit.prevent="submit"
  >
    <CoverPicker v-model="cover" />
    <UFormField
      :label="$t('plan.tripName')"
      name="name"
    >
      <UInput
        v-model="name"
        required
        maxlength="80"
        :placeholder="$t('plan.tripNamePlaceholder')"
        class="w-full"
      />
    </UFormField>
    <PeriodInput v-model="period" />
    <UFormField
      :label="$t('plan.expectedBudget')"
      name="budget"
    >
      <MoneyInput
        v-model:currency="budgetCurrency"
        v-model:amount="budgetAmount"
      />
    </UFormField>
    <div class="fixed inset-x-0 bottom-0 z-40 border-t border-default bg-[#FFFBF5] px-4 pt-3 pb-[max(env(safe-area-inset-bottom),16px)]">
      <div class="mx-auto max-w-md">
        <UButton
          type="submit"
          block
          :loading="pending"
          class="h-[52px] text-base"
        >
          {{ p ? $t('common.save') : $t('plan.create') }}
        </UButton>
      </div>
    </div>
  </form>
</template>
