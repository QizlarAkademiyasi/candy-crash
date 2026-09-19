export type {
  CandyColor,
  SpecialType,
  Candy,
  GamePhase,
  LevelConfig,
  LevelBoosters,
  CellPos,
} from './match3/types'

export {
  BOARD_SIZE,
  TOTAL_LEVELS,
  MAX_LIVES,
  LIFE_REGEN_MS,
  CANE_CHUNK,
  CANDY_HEX,
} from './match3/types'

export interface LevelResult {
  stars: 0 | 1 | 2 | 3
  score: number
}

export interface BoosterInventory {
  colorBomb: number
  wrappedStriped: number
  extraMoves: number
  hints: number
}

export interface PersistState {
  maxLevel: number
  stars: Record<number, 0 | 1 | 2 | 3>
  highScore: number
  muted: boolean
  tutorialSeen: boolean
  lives: number
  lastLifeRegen: number
  boosters: BoosterInventory
}

export const UNLIMITED_LIVES =
  import.meta.env.VITE_UNLIMITED_LIVES === 'true' ||
  import.meta.env.VITE_UNLIMITED_LIVES === '1'
