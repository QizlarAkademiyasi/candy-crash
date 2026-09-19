<script setup lang="ts">
defineProps<{
  levelId: number
  score: number
  targetScore: number
  movesLeft: number
}>()
</script>

<template>
  <header class="hud">
    <div class="hud__block">
      <span class="hud__label">Level</span>
      <strong>{{ levelId }}</strong>
    </div>
    <div class="hud__block hud__block--score">
      <span class="hud__label">Maqsad</span>
      <strong>{{ score }} / {{ targetScore }}</strong>
    </div>
    <div class="hud__block">
      <span class="hud__label">Yurish</span>
      <strong>{{ movesLeft }}</strong>
    </div>
  </header>
</template>

<style scoped>
.hud {
  width: 100%;
  max-width: var(--stage-max);
  display: grid;
  grid-template-columns: 1fr 1.4fr 1fr;
  gap: 8px;
  padding: 8px 12px 4px;
}

.hud__block {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 8px 10px;
  text-align: center;
  box-shadow: 0 2px 8px var(--shadow);
}

.hud__block--score strong {
  color: var(--brand-primary);
  font-size: 0.95rem;
}

.hud__label {
  display: block;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  font-weight: 600;
}

.hud__block strong {
  font-size: 1.1rem;
  color: var(--brand-ink);
}
</style>
