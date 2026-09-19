<script setup lang="ts">
defineProps<{
  progress: number
  score: number
}>()
</script>

<template>
  <div class="cane" aria-label="Candy cane progress">
    <div class="cane__track">
      <div class="cane__fill" :style="{ height: `${Math.round(progress * 100)}%` }" />
    </div>
    <span class="cane__label">{{ score }}</span>
  </div>
</template>

<style scoped>
.cane {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 36px;
}

.cane__track {
  width: 22px;
  height: 120px;
  border-radius: 11px;
  background: linear-gradient(90deg, #fff 50%, #fecaca 50%);
  border: 2px solid #dc2626;
  overflow: hidden;
  display: flex;
  flex-direction: column-reverse;
  box-shadow: inset 0 2px 6px rgb(0 0 0 / 15%);
}

.cane__fill {
  width: 100%;
  background: linear-gradient(180deg, #ef4444, #b91c1c);
  transition: height 0.25s ease;
}

.cane__label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
</style>
