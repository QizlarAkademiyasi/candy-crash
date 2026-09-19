<script setup lang="ts">
import { reactive } from 'vue'
import type { LevelBoosters } from '../game/types'

const props = defineProps<{
  open: boolean
  levelId: number
  lives: number
  boosters: {
    colorBomb: number
    wrappedStriped: number
    extraMoves: number
    hints: number
  }
}>()

const emit = defineEmits<{
  close: []
  start: [boosters: LevelBoosters, useInventory: Record<string, boolean>]
}>()

const selected = reactive({
  extraMoves: false,
  startColorBomb: false,
  startWrappedStriped: false,
})

function toggle(key: keyof typeof selected): void {
  selected[key] = !selected[key]
}

function start(): void {
  emit('start', { ...selected }, { ...selected })
  selected.extraMoves = false
  selected.startColorBomb = false
  selected.startWrappedStriped = false
}
</script>

<template>
  <div v-if="open" class="modal" role="dialog" aria-modal="true">
    <div class="modal__card">
      <h2>Level {{ levelId }}</h2>
      <p class="modal__lives">Jonlar: {{ lives }} ♥</p>
      <p class="modal__sub">Akademiya sovg‘alari (reklamasiz):</p>
      <div class="modal__boosters">
        <button
          type="button"
          class="boost"
          :class="{ 'boost--on': selected.extraMoves }"
          :disabled="boosters.extraMoves <= 0 && !selected.extraMoves"
          @click="toggle('extraMoves')"
        >
          +10 yurish
          <span class="boost__count">×{{ boosters.extraMoves }}</span>
        </button>
        <button
          type="button"
          class="boost"
          :class="{ 'boost--on': selected.startColorBomb }"
          :disabled="boosters.colorBomb <= 0 && !selected.startColorBomb"
          @click="toggle('startColorBomb')"
        >
          Rang bomba
          <span class="boost__count">×{{ boosters.colorBomb }}</span>
        </button>
        <button
          type="button"
          class="boost"
          :class="{ 'boost--on': selected.startWrappedStriped }"
          :disabled="boosters.wrappedStriped <= 0 && !selected.startWrappedStriped"
          @click="toggle('startWrappedStriped')"
        >
          Yulduz + o‘ralgan
          <span class="boost__count">×{{ boosters.wrappedStriped }}</span>
        </button>
      </div>
      <div class="modal__actions">
        <button type="button" class="btn btn--ghost" @click="emit('close')">Orqaga</button>
        <button type="button" class="btn btn--primary" @click="start">Boshlash</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 110;
  background: rgb(15 23 42 / 55%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal__card {
  width: min(400px, 100%);
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: 0 12px 40px var(--shadow);
}

.modal__card h2 {
  margin: 0 0 4px;
  text-align: center;
  color: var(--brand-primary);
}

.modal__lives {
  text-align: center;
  margin: 0 0 12px;
  font-weight: 700;
  color: #ef4444;
}

.modal__sub {
  margin: 0 0 8px;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.modal__boosters {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.boost {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: var(--radius);
  background: #f1f5f9;
  font-weight: 600;
  color: var(--brand-ink);
  border: 2px solid transparent;
}

.boost--on {
  border-color: var(--brand-primary);
  background: #eff6ff;
}

.boost__count {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.modal__actions {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  padding: 12px;
  border-radius: var(--radius);
  font-weight: 700;
  background: #e2e8f0;
}

.btn--primary {
  background: var(--brand-primary);
  color: var(--text-light);
}

.btn--ghost {
  background: transparent;
  border: 1px solid #cbd5e1;
}
</style>
