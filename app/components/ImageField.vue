<script setup lang="ts">
/** Single optional image: existing stored file, a newly picked file, or none. */
const file = defineModel<File | null>('file', { required: true })
const removed = defineModel<boolean>('removed', { default: false })
const props = defineProps<{ existingId: string | null }>()

const input = useTemplateRef<HTMLInputElement>('input')
const previewUrl = ref<string | null>(null)
watch(file, (f, _, onCleanup) => {
  previewUrl.value = f ? URL.createObjectURL(f) : null
  onCleanup(() => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  })
}, { immediate: true })

const src = computed(() => previewUrl.value ?? (props.existingId && !removed.value ? `/api/files/${props.existingId}?size=thumb` : null))
const name = computed(() => file.value?.name ?? null)

function pick(event: Event) {
  const f = (event.target as HTMLInputElement).files?.[0]
  if (f) {
    file.value = f
    removed.value = false
  }
}
function remove() {
  file.value = null
  removed.value = true
  if (input.value) input.value.value = ''
}
</script>

<template>
  <div>
    <input
      ref="input"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
      class="hidden"
      @change="pick"
    >
    <div
      v-if="src"
      class="flex items-center gap-3 rounded-2xl bg-white p-2.5 ring-[1.5px] ring-[#F0E6DA]"
    >
      <img
        :src="src"
        alt=""
        class="size-16 rounded-[14px] object-cover"
      >
      <div class="flex min-w-0 flex-col gap-1">
        <p
          v-if="name"
          class="truncate font-semibold"
        >
          {{ name }}
        </p>
        <div class="flex gap-4 text-sm font-bold">
          <button
            type="button"
            class="text-primary"
            @click="input?.click()"
          >
            {{ $t('common.replace') }}
          </button>
          <button
            type="button"
            class="text-error"
            @click="remove"
          >
            {{ $t('common.remove') }}
          </button>
        </div>
      </div>
    </div>
    <button
      v-else
      type="button"
      class="flex h-[74px] w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-primary bg-[#F0FDFA] font-semibold text-primary"
      @click="input?.click()"
    >
      <UIcon
        name="i-lucide-image-plus"
        class="size-5"
      />
      {{ $t('itinerary.addImage') }}
    </button>
  </div>
</template>
