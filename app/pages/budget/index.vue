<template>
  <div class="flex flex-col gap-12 pt-3">
    <h1 class="text-[28px] leading-[34px] font-extrabold">
      {{ $t('budget.title') }}
    </h1>
    <EmptyState
      pose="construction"
      :title="$t('budget.comingSoon')"
      :text="$t('budget.comingSoonText')"
    />
  </div>
</template>
