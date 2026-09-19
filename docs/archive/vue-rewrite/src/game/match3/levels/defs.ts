import type { LevelConfig } from '../types'
import { TOTAL_LEVELS } from '../types'
import { buildLevelConfig } from '../scoring'

export const LEVELS: LevelConfig[] = Array.from({ length: TOTAL_LEVELS }, (_, i) =>
  buildLevelConfig(i + 1),
)

export function getLevelConfig(id: number): LevelConfig {
  return LEVELS[id - 1] ?? LEVELS[0]
}
