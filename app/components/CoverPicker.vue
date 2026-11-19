<script setup lang="ts">
export interface CoverValue {
  coverType: 'emoji' | 'image'
  coverEmoji: string
  coverColor: string
  coverFileId: string | null
  /** Newly chosen image, not uploaded yet. */
  file: File | null
}

const model = defineModel<CoverValue>({ required: true })
const input = useTemplateRef<HTMLInputElement>('fileInput')
const previewUrl = ref<string | null>(null)

watch(() => model.value.file, (file, _, onCleanup) => {
  previewUrl.value = file ? URL.createObjectURL(file) : null
  onCleanup(() => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  })
}, { immediate: true })

const tab = computed({
  get: () => model.value.coverType,
  set: (coverType: 'emoji' | 'image') => { model.value = { ...model.value, coverType } }
})

function pickFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) model.value = { ...model.value, file, coverType: 'image' }
}
</script>

<template>
  <div class="card flex flex-col gap-3 p-3.5">
    <SegmentedControl
      v-model="tab"
      :options="[{ value: 'emoji', label: $t('plan.emoji') }, { value: 'image', label: $t('plan.photo') }]"
    />
    <div class="flex items-center justify-between gap-3">
      <PlanCover
        :cover="model"
        :preview-url="previewUrl"
        :size="104"
        :radius="24"
      />
      <div
        v-if="model.coverType === 'emoji'"
        class="grid grid-cols-4 gap-2"
      >
        <button
          v-for="emoji in COVER_EMOJIS"
          :key="emoji"
          type="button"
          class="flex size-[38px] items-center justify-center rounded-xl transition-colors"
          :class="model.coverEmoji === emoji ? 'bg-[#E0F2F1] ring-2 ring-primary ring-inset' : 'bg-[#FAF6F0]'"
          :aria-pressed="model.coverEmoji === emoji"
          :aria-label="emoji.split(':')[1]"
          @click="model = { ...model, coverEmoji: emoji }"
        >
          <UIcon
            :name="emoji"
            class="size-6"
          />
        </button>
      </div>
      <div
        v-else
        class="flex flex-1 flex-col items-center gap-2"
      >
        <UButton
          icon="i-lucide-image-plus"
          color="primary"
          variant="soft"
          class="h-11 px-4"
          @click="input?.click()"
        >
          {{ $t('plan.choosePhoto') }}
        </UButton>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          class="hidden"
          @change="pickFile"
        >
      </div>
    </div>
    <div
      v-if="model.coverType === 'emoji'"
      class="flex justify-between"
    >
      <button
        v-for="color in COVER_COLORS"
        :key="color"
        type="button"
        class="size-[26px] rounded-full"
        :class="model.coverColor === color ? 'ring-[2.5px] ring-primary ring-inset' : 'ring-1 ring-[#F0E6DA] ring-inset'"
        :style="{ background: color }"
        :aria-pressed="model.coverColor === color"
        :aria-label="color"
        @click="model = { ...model, coverColor: color }"
      />
    </div>
  </div>
</template>
