<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Match3Engine } from '../game/match3/engine'
import type { CellPos } from '../game/types'
import { BOARD_SIZE, CANDY_HEX } from '../game/types'

const props = defineProps<{ engine: Match3Engine }>()
const emit = defineEmits<{ cleared: [] }>()

const stageRef = ref<HTMLElement | null>(null)
const cellSize = ref(48)
let prevClearLen = 0

const STAGE_W = 540
const STAGE_H = 540

function resize(): void {
  const el = stageRef.value
  if (!el) return
  const w = el.clientWidth
  cellSize.value = Math.floor(w / BOARD_SIZE)
}

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
})

function posStyle(r: number, c: number): Record<string, string> {
  const s = cellSize.value
  return {
    width: `${s - 4}px`,
    height: `${s - 4}px`,
    left: `${c * s + 2}px`,
    top: `${r * s + 2}px`,
  }
}

function candyClass(special: string): string {
  if (special === 'none') return ''
  return `candy--${special.replace('_', '-')}`
}

function isSelected(r: number, c: number): boolean {
  const s = props.engine.selected
  return !!s && s.r === r && s.c === c
}

function isHint(r: number, c: number): boolean {
  const h = props.engine.hintPair
  if (!h) return false
  return (h[0].r === r && h[0].c === c) || (h[1].r === r && h[1].c === c)
}

function isClearing(r: number, c: number): boolean {
  return props.engine.lastClear.some((p) => p.r === r && p.c === c)
}

function pointerPos(e: PointerEvent): CellPos | null {
  const el = stageRef.value
  if (!el) return null
  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const c = Math.floor(x / cellSize.value)
  const r = Math.floor(y / cellSize.value)
  if (r < 0 || c < 0 || r >= BOARD_SIZE || c >= BOARD_SIZE) return null
  return { r, c }
}

function onPointerDown(e: PointerEvent): void {
  if (props.engine.phase !== 'playing') return
  const pos = pointerPos(e)
  if (!pos) return
  ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  props.engine.selectCell(pos)
}

const board = computed(() => props.engine.board)

defineExpose({ tick: () => {
  const len = props.engine.lastClear.length
  if (len > prevClearLen) emit('cleared')
  prevClearLen = len
}})
</script>

<template>
  <div class="stage-wrap">
    <div
      ref="stageRef"
      class="stage"
      :style="{ width: '100%', maxWidth: `${STAGE_W}px`, aspectRatio: '1' }"
      @pointerdown="onPointerDown"
    >
      <div
        v-for="(row, r) in board"
        :key="`r${r}`"
      >
        <div
          v-for="(cell, c) in row"
          :key="`${r}-${c}-${cell?.id ?? 'e'}`"
          v-show="cell"
          class="candy"
          :class="[
            candyClass(cell?.special ?? 'none'),
            { 'candy--selected': isSelected(r, c), 'candy--hint': isHint(r, c), 'candy--pop': isClearing(r, c) },
          ]"
          :style="{
            ...posStyle(r, c),
            background: cell ? CANDY_HEX[cell.color] : 'transparent',
          }"
        >
          <span v-if="cell?.special === 'striped_h'" class="candy__stripe candy__stripe--h" />
          <span v-if="cell?.special === 'striped_v'" class="candy__stripe candy__stripe--v" />
          <span v-if="cell?.special === 'wrapped'" class="candy__wrap" />
          <span v-if="cell?.special === 'color_bomb'" class="candy__bomb">★</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stage-wrap {
  width: 100%;
  padding: 0 12px;
  display: flex;
  justify-content: center;
}

.stage {
  position: relative;
  touch-action: none;
  background: linear-gradient(180deg, #4a1942 0%, #2d1b4e 100%);
  border-radius: 16px;
  border: 4px solid #7c3aed;
  box-shadow:
    inset 0 0 24px rgb(0 0 0 / 35%),
    0 8px 24px var(--shadow);
  overflow: hidden;
}

.candy {
  position: absolute;
  border-radius: 12px;
  box-shadow:
    inset 0 -3px 0 rgb(0 0 0 / 20%),
    inset 0 2px 0 rgb(255 255 255 / 35%);
  transition: transform 0.12s ease;
}

.candy--selected {
  outline: 3px solid var(--brand-accent);
  transform: scale(1.08);
  z-index: 2;
}

.candy--hint {
  animation: hint-pulse 0.8s ease infinite;
}

.candy--pop {
  animation: pop 0.25s ease forwards;
}

.candy__stripe {
  position: absolute;
  background: rgb(255 255 255 / 75%);
  border-radius: 2px;
}

.candy__stripe--h {
  left: 10%;
  right: 10%;
  top: 45%;
  height: 10%;
}

.candy__stripe--v {
  top: 10%;
  bottom: 10%;
  left: 45%;
  width: 10%;
}

.candy__wrap {
  position: absolute;
  inset: 15%;
  border: 3px dashed rgb(255 255 255 / 80%);
  border-radius: 8px;
}

.candy__bomb {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: #fff;
  text-shadow: 0 1px 3px rgb(0 0 0 / 50%);
}

@keyframes pop {
  to {
    transform: scale(1.4);
    opacity: 0;
  }
}

@keyframes hint-pulse {
  50% {
    box-shadow: 0 0 0 4px rgb(251 191 36 / 80%);
  }
}
</style>
