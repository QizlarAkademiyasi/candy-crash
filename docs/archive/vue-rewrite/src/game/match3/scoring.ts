import type { LevelConfig } from './types'

/** V1-style: level n gives ~30*(n+1) per candy in a simple match. */
export function pointsPerCandy(levelId: number): number {
  return 30 * (levelId + 1)
}

export function scoreForClear(count: number, levelId: number, cascadeStep: number): number {
  const base = count * pointsPerCandy(levelId)
  const mult = 1 + Math.max(0, cascadeStep - 1) * 0.15
  return Math.round(base * mult)
}

export function starsForScore(
  score: number,
  config: LevelConfig,
  won: boolean,
): 0 | 1 | 2 | 3 {
  if (!won) return 0
  if (score >= config.star3Score) return 3
  if (score >= config.star2Score) return 2
  return 1
}

export function buildLevelConfig(id: number): LevelConfig {
  const tier = Math.min(1, id / 100)
  const targetScore = 800 + id * 120 + Math.floor(id * id * 0.8)
  const moves = Math.max(18, 32 - Math.floor(id / 8))
  const colorCount = Math.min(6, 3 + Math.floor(id / 15))
  return {
    id,
    seed: id * 7919 + 42,
    targetScore,
    moves,
    colorCount,
    star2Score: Math.floor(targetScore * 1.35),
    star3Score: Math.floor(targetScore * 1.75),
  }
}
