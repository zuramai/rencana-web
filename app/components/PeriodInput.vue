<script setup lang="ts">
export interface PeriodValue {
  mode: 'none' | 'month' | 'range'
  startYear: number | null
  startMonth: number | null
  endYear: number | null
  endMonth: number | null
}

const model = defineModel<PeriodValue>({ required: true })
const { t } = useI18n()
const { intlLocale } = useFormat()

const thisYear = new Date().getFullYear()
const ANY = 0 // USelect can't hold null; 0 stands for "any month"

const years = computed(() => {
  const list = Array.from({ length: 7 }, (_, i) => thisYear - 1 + i)
  for (const y of [model.value.startYear, model.value.endYear]) if (y && !list.includes(y)) list.push(y)
  return list.sort((a, b) => a - b).map(y => ({ value: y, label: String(y) }))
})
const months = computed(() => [
  { value: ANY, label: t('common.anyMonth') },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Intl.DateTimeFormat(intlLocale.value, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, i, 1)))
  }))
])

const mode = computed({
  get: () => model.value.mode,
  set: (mode) => {
    const next = { ...model.value, mode }
    if (mode === 'none') Object.assign(next, { startYear: null, startMonth: null, endYear: null, endMonth: null })
    if (mode !== 'none') next.startYear ??= thisYear
    if (mode === 'month') Object.assign(next, { endYear: null, endMonth: null })
    if (mode === 'range') next.endYear ??= next.startYear
    model.value = next
  }
})

function field(key: 'startYear' | 'endYear' | 'startMonth' | 'endMonth') {
  return computed({
    get: () => model.value[key] ?? ANY,
    set: (v: number) => { model.value = { ...model.value, [key]: v === ANY ? null : v } }
  })
}
const startYear = field('startYear')
const startMonth = field('startMonth')
const endYear = field('endYear')
const endMonth = field('endMonth')
</script>

<template>
  <div class="flex flex-col gap-2">
    <span class="text-[13px] font-semibold text-muted">{{ $t('plan.when') }}</span>
    <SegmentedControl
      v-model="mode"
      :options="[
        { value: 'none', label: $t('plan.noDate') },
        { value: 'month', label: $t('plan.month') },
        { value: 'range', label: $t('plan.range') }
      ]"
    />
    <div
      v-if="mode !== 'none'"
      class="flex items-center gap-2"
    >
      <span
        v-if="mode === 'range'"
        class="w-10 shrink-0 font-semibold"
      >{{ $t('plan.from') }}</span>
      <USelect
        v-model="startMonth"
        :items="months"
        value-key="value"
        class="min-w-0 flex-1"
        :aria-label="$t('plan.month')"
      />
      <USelect
        v-model="startYear"
        :items="years"
        value-key="value"
        class="min-w-0 flex-1"
        :aria-label="$t('plan.year')"
      />
    </div>
    <div
      v-if="mode === 'range'"
      class="flex items-center gap-2"
    >
      <span class="w-10 shrink-0 font-semibold">{{ $t('plan.to') }}</span>
      <USelect
        v-model="endMonth"
        :items="months"
        value-key="value"
        class="min-w-0 flex-1"
        :aria-label="$t('plan.month')"
      />
      <USelect
        v-model="endYear"
        :items="years"
        value-key="value"
        class="min-w-0 flex-1"
        :aria-label="$t('plan.year')"
      />
    </div>
  </div>
</template>
