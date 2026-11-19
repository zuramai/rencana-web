<script setup lang="ts">
const props = withDefaults(defineProps<{
  cover: Pick<PlanListItem, 'coverType' | 'coverEmoji' | 'coverFileId' | 'coverColor'>
  size?: number
  radius?: number
  /** Local preview (object URL) that overrides the stored image. */
  previewUrl?: string | null
}>(), { size: 56, radius: 16, previewUrl: null })

const imageUrl = computed(() => {
  if (props.cover.coverType !== 'image') return null
  return props.previewUrl ?? (props.cover.coverFileId ? apiUrl(`/api/files/${props.cover.coverFileId}?size=thumb`) : null)
})
</script>

<template>
  <div
    class="flex shrink-0 items-center justify-center overflow-hidden"
    :style="{ width: `${size}px`, height: `${size}px`, borderRadius: `${radius}px`, background: cover.coverColor }"
  >
    <img
      v-if="imageUrl"
      :src="imageUrl"
      alt=""
      class="size-full object-cover"
    >
    <UIcon
      v-else
      :name="cover.coverEmoji ?? DEFAULT_COVER_EMOJI"
      :style="{ width: `${size * 0.58}px`, height: `${size * 0.58}px` }"
    />
  </div>
</template>
