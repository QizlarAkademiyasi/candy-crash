import type { LevelMeta } from '../types'
import { TOTAL_LEVELS } from '../types'
import { powerUpsForLevel } from '../scoring'
import { getHandLayout } from './hand'

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildLevelMeta(id: number): LevelMeta {
  const rng = mulberry32(id * 9973 + 42)
  const tier = Math.min(1, id / TOTAL_LEVELS)
  const colorCount = Math.min(6, 3 + Math.floor(id / 18))
  const handLayout = getHandLayout(id)
  const rows = handLayout
    ? Math.max(...handLayout.map((h) => h.row)) + 1
    : Math.min(12, 5 + Math.floor(id / 8))
  const density = handLayout
    ? 0.75
    : Math.min(0.88, 0.52 + tier * 0.32 + rng() * 0.06)
  const seed = Math.floor(rng() * 1_000_000)
  const { aimCharges, bombCharges } = powerUpsForLevel(id)
  return {
    id,
    seed,
    colorCount,
    rows,
    density,
    aimCharges,
    bombCharges,
    handLayout,
  }
}

export const LEVELS: LevelMeta[] = Array.from({ length: TOTAL_LEVELS }, (_, i) =>
  buildLevelMeta(i + 1),
)

