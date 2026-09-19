<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import BubbleCanvas from '../components/BubbleCanvas.vue'
import HudBar from '../components/HudBar.vue'
import PowerUpBar from '../components/PowerUpBar.vue'
import ResultModal from '../components/ResultModal.vue'
import TutorialModal from '../components/TutorialModal.vue'
import { useAudio } from '../composables/useAudio'
import { useGamePersist } from '../composables/useGamePersist'
import { GameEngine } from '../game/engine'
import { TOTAL_LEVELS } from '../game/types'

const props = defineProps<{ levelId: number }>()
const emit = defineEmits<{
  home: []
  map: []
  next: [levelId: number]
}>()

const engine = new GameEngine()
const snap = ref(engine.snapshot())
const showTutorial = ref(false)
const showPause = ref(false)
const { state, recordLevelComplete, setTutorialSeen } = useGamePersist()
const audio = useAudio()
let recorded = false

const showResult = computed(
  () => snap.value.phase === 'won' || snap.value.phase === 'lost',
)

onMounted(() => {
  engine.initLevel(props.levelId)
  snap.value = engine.snapshot()
  if (!state.tutorialSeen) showTutorial.value = true
  const tick = () => {
    snap.value = engine.snapshot()
    if (snap.value.phase === 'won' && !recorded) {
      recorded = true
      recordLevelComplete(snap.value.levelId, snap.value.stars, snap.value.score)
      audio.win()
    }
    if (snap.value.phase === 'lost' && !recorded) {
      recorded = true
      audio.lose()
    }
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})

watch(
  () => props.levelId,
  (id) => {
    recorded = false
    engine.initLevel(id)
    snap.value = engine.snapshot()
  },
)

function onShoot(): void {
  if (engine.shoot()) audio.shoot()
}

watch(
  () => snap.value.pops.length,
  (len, prev) => {
    if (len > prev && len > 0) audio.pop()
  },
)

function closeTutorial(): void {
  showTutorial.value = false
  setTutorialSeen()
}

function togglePause(): void {
  if (engine.phase === 'paused') {
    engine.resume()
    showPause.value = false
  } else {
    engine.pause()
    showPause.value = true
  }
}

function retry(): void {
  recorded = false
  engine.initLevel(props.levelId)
}

function goNext(): void {
  const next = Math.min(TOTAL_LEVELS, props.levelId + 1)
  emit('next', next)
}
</script>

<template>
  <div class="game">
    <HudBar
      :level-id="snap.levelId"
      :score="snap.score"
      :high-score="state.highScore"
      :combo="snap.combo"
    />
    <div class="game__toolbar">
      <button type="button" class="game__icon" aria-label="Yordam" @click="showTutorial = true">
        ?
      </button>
      <button type="button" class="game__icon" aria-label="Menyu" @click="togglePause">≡</button>
    </div>
    <BubbleCanvas :engine="engine" @shoot="onShoot" />
    <PowerUpBar
      :aim-charges="snap.powerUps.aimCharges"
      :bomb-charges="snap.powerUps.bombCharges"
      :aim-active="snap.powerUps.aimActive"
      :bomb-armed="snap.powerUps.bombArmed"
      :disabled="snap.phase !== 'playing' || !!snap.projectile"
      @aim="engine.useAimHelper()"
      @bomb="engine.useBomb()"
    />
    <TutorialModal :open="showTutorial" @close="closeTutorial" />
    <ResultModal
      :open="showResult"
      :won="snap.phase === 'won'"
      :score="snap.score"
      :stars="snap.stars"
      :level-id="snap.levelId"
      @retry="retry"
      @next="goNext"
      @map="emit('map')"
    />
    <div v-if="showPause" class="pause">
      <div class="pause__card">
        <h3>Pauza</h3>
        <button type="button" @click="togglePause">Davom etish</button>
        <button type="button" @click="retry">Qayta boshlash</button>
        <button type="button" @click="emit('home')">Bosh sahifa</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game {
  width: var(--phone-width);
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.game__toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 12px 4px;
}

.game__icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface);
  box-shadow: 0 2px 8px var(--shadow);
  font-weight: 700;
  color: var(--brand-ink);
}

.pause {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgb(15 23 42 / 45%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pause__card {
  background: var(--surface);
  padding: 20px;
  border-radius: var(--radius);
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pause__card h3 {
  margin: 0 0 8px;
  text-align: center;
}

.pause__card button {
  padding: 10px;
  border-radius: var(--radius);
  background: #e2e8f0;
  font-weight: 600;
}
</style>
