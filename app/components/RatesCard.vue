<script setup lang="ts">
const props = defineProps<{ planId: string, summary: SummaryDto }>()
const emit = defineEmits<{ changed: [] }>()
const { t } = useI18n()
const toast = useToast()
const errorMessage = useErrorMessage()
const { intlLocale } = useFormat()

const editing = ref<string | null>(null)
const draft = ref('')
const pending = ref(false)

const rows = computed(() => [
  ...props.summary.rates.map(r => ({ currency: r.currency, rate: r })),
  ...props.summary.missingRates.map(c => ({ currency: c, rate: null }))
].sort((a, b) => a.currency.localeCompare(b.currency)))

const fmtRate = (n: number) => n.toLocaleString(intlLocale.value, { maximumFractionDigits: n < 1 ? 6 : 2 })
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(intlLocale.value, { day: 'numeric', month: 'short' })

function edit(currency: string, current: number | null) {
  editing.value = currency
  draft.value = current == null ? '' : String(current)
}

function saveDraft(currency: string) {
  // Rates are decimals; accept a decimal comma too ("0,0087").
  const rate = Number(draft.value.trim().replace(',', '.'))
  if (Number.isFinite(rate) && rate > 0) put(currency, rate)
  else toast.add({ title: t('errors.validation'), color: 'error' })
}

async function put(currency: string, rate: number | null) {
  pending.value = true
  try {
    await $fetch(`/api/plans/${props.planId}/rates/${currency}`, { method: 'PUT', body: { rate } })
    editing.value = null
    emit('changed')
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="card flex flex-col gap-2.5 p-4">
    <h2 class="text-xl font-bold">
      {{ $t('rates.title') }}
    </h2>
    <p
      v-if="!rows.length"
      class="text-sm text-muted"
    >
      {{ $t('rates.none') }}
    </p>
    <div
      v-for="row in rows"
      :key="row.currency"
    >
      <form
        v-if="editing === row.currency"
        class="flex items-center gap-2"
        @submit.prevent="saveDraft(row.currency)"
      >
        <span class="w-10 shrink-0 text-sm font-bold">{{ row.currency }}</span>
        <UInput
          v-model="draft"
          inputmode="decimal"
          autocomplete="off"
          required
          autofocus
          :aria-label="$t('rates.setRate', { currency: summary.currency })"
          class="min-w-0 flex-1"
        />
        <UButton
          type="submit"
          icon="i-lucide-check"
          :loading="pending"
          class="size-11 justify-center"
          :aria-label="$t('common.save')"
        />
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          class="size-11 justify-center"
          :aria-label="$t('common.cancel')"
          @click="editing = null"
        />
      </form>
      <div
        v-else-if="row.rate"
        class="flex items-center gap-2"
      >
        <span class="w-10 shrink-0 text-sm font-bold">{{ row.currency }}</span>
        <span class="min-w-0 flex-1 text-[13px] font-semibold text-muted">
          {{ $t('rates.line', { from: row.currency, rate: fmtRate(row.rate.rate), to: summary.currency }) }}
          · {{ $t(`rates.${row.rate.source}`) }} · {{ fmtDate(row.rate.fetchedAt) }}
          <button
            v-if="row.rate.source === 'manual'"
            type="button"
            class="block font-bold text-primary"
            @click="put(row.currency, null)"
          >
            {{ $t('rates.resetToAuto') }}
          </button>
        </span>
        <UButton
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          class="size-9 justify-center text-muted"
          :aria-label="$t('common.edit')"
          @click="edit(row.currency, row.rate.rate)"
        />
      </div>
      <div
        v-else
        class="flex items-center gap-2 rounded-xl bg-amber-100 py-2 pr-2 pl-3 text-amber-700"
      >
        <UIcon
          name="i-lucide-triangle-alert"
          class="size-[18px] shrink-0"
        />
        <span class="flex-1 text-[13px] font-semibold">{{ $t('rates.missing', { currency: row.currency }) }}</span>
        <UButton
          icon="i-lucide-pencil"
          color="warning"
          variant="ghost"
          class="size-9 justify-center"
          :aria-label="$t('common.edit')"
          @click="edit(row.currency, null)"
        />
      </div>
    </div>
  </div>
</template>
