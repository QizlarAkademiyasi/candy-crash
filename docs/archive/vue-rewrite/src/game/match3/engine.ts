import {
  applyGravity,
  cloneBoard,
  createRng,
  generateBoard,
  getCell,
  isAdjacent,
  placeStartBoosters,
  posKey,
  refillBoard,
  shuffleBoard,
  type BoardGrid,
} from './board'
import {
  findAllMatchGroups,
  mergeMatchedCells,
  specialFromMatch,
  wouldMatchAfterSwap,
} from './detect'
import { findHintSwap, hasAnyValidMove } from './hints'
import { getLevelConfig } from './levels/defs'
import { scoreForClear, starsForScore } from './scoring'
import { cellsForSpecialActivation, comboActivation, isSpecialSwap } from './specials'
import type { CellPos, GamePhase, LevelBoosters, LevelConfig } from './types'
import { CANE_CHUNK } from './types'
import { makeCandy as mk } from './board'

export interface GameSnapshot {
  levelId: number
  config: LevelConfig
  phase: GamePhase
  board: BoardGrid
  score: number
  movesLeft: number
  targetScore: number
  cascadeStep: number
  stars: 0 | 1 | 2 | 3
  caneProgress: number
  selected: CellPos | null
  hintPair: [CellPos, CellPos] | null
  lastClear: CellPos[]
  swapAnim: { a: CellPos; b: CellPos; t: number } | null
}

const RESOLVE_DELAY = 0.28
const SWAP_DURATION = 0.18

export class Match3Engine {
  levelId = 1
  config: LevelConfig = getLevelConfig(1)
  phase: GamePhase = 'playing'
  board: BoardGrid = []
  score = 0
  movesLeft = 0
  cascadeStep = 0
  selected: CellPos | null = null
  hintPair: [CellPos, CellPos] | null = null
  lastClear: CellPos[] = []
  swapAnim: { a: CellPos; b: CellPos; t: number } | null = null

  private rng = () => Math.random()
  private resolveTimer = 0
  private pivot: CellPos | null = null
  private pendingCombo: [CellPos, CellPos] | null = null

  initLevel(levelId: number, boosters: LevelBoosters = {
    extraMoves: false,
    startColorBomb: false,
    startWrappedStriped: false,
  }): void {
    this.levelId = levelId
    this.config = getLevelConfig(levelId)
    this.rng = createRng(this.config)
    this.board = generateBoard(this.config, this.rng)
    placeStartBoosters(this.board, {
      colorBomb: boosters.startColorBomb,
      wrappedStriped: boosters.startWrappedStriped,
    }, this.rng)
    this.movesLeft = this.config.moves + (boosters.extraMoves ? 10 : 0)
    this.score = 0
    this.cascadeStep = 0
    this.phase = 'playing'
    this.selected = null
    this.hintPair = null
    this.lastClear = []
    this.swapAnim = null
    this.resolveTimer = 0
    this.pivot = null
    this.pendingCombo = null
    this.ensurePlayable()
  }

  pause(): void {
    if (this.phase === 'playing') this.phase = 'paused'
  }

  resume(): void {
    if (this.phase === 'paused') this.phase = 'playing'
  }

  selectCell(pos: CellPos): boolean {
    if (this.phase !== 'playing' || this.swapAnim) return false
    const cell = getCell(this.board, pos.r, pos.c)
    if (!cell) return false

    if (!this.selected) {
      this.selected = pos
      this.hintPair = null
      return true
    }

    if (this.selected.r === pos.r && this.selected.c === pos.c) {
      this.selected = null
      return true
    }

    if (!isAdjacent(this.selected, pos)) {
      this.selected = pos
      return true
    }

    return this.trySwap(this.selected, pos)
  }

  trySwap(a: CellPos, b: CellPos): boolean {
    if (this.phase !== 'playing') return false
    const special = isSpecialSwap(this.board, a, b)
    const valid = special || wouldMatchAfterSwap(this.board, a, b)
    if (!valid) {
      this.swapCells(a, b)
      this.swapAnim = { a, b, t: 0, revert: true }
      this.phase = 'swapping'
      this.selected = null
      return false
    }

    this.swapCells(a, b)
    this.movesLeft -= 1
    this.selected = null
    this.pivot = a
    this.cascadeStep = 0

    if (special) {
      this.pendingCombo = [a, b]
    } else {
      this.pendingCombo = null
    }

    this.phase = 'resolving'
    this.resolveTimer = 0
    this.stepResolve()
    return true
  }

  useHint(): [CellPos, CellPos] | null {
    if (this.phase !== 'playing') return null
    const pair = findHintSwap(this.board)
    this.hintPair = pair
    return pair
  }

  update(dt: number): void {
    if (this.swapAnim) {
      this.swapAnim.t += dt
      if (this.swapAnim.t >= SWAP_DURATION) {
        this.swapAnim = null
        if (this.phase === 'swapping') this.phase = 'playing'
      }
    }
    if (this.phase === 'resolving') {
      this.resolveTimer -= dt
      if (this.resolveTimer <= 0) {
        this.stepResolve()
      }
    }
  }

  snapshot(): GameSnapshot {
    const won = this.phase === 'won'
    return {
      levelId: this.levelId,
      config: this.config,
      phase: this.phase,
      board: cloneBoard(this.board),
      score: this.score,
      movesLeft: this.movesLeft,
      targetScore: this.config.targetScore,
      cascadeStep: this.cascadeStep,
      stars: starsForScore(this.score, this.config, won),
      caneProgress: (this.score % CANE_CHUNK) / CANE_CHUNK,
      selected: this.selected ? { ...this.selected } : null,
      hintPair: this.hintPair,
      lastClear: [...this.lastClear],
      swapAnim: this.swapAnim ? { ...this.swapAnim } : null,
    }
  }

  private swapCells(a: CellPos, b: CellPos): void {
    const tmp = this.board[a.r][a.c]
    this.board[a.r][a.c] = this.board[b.r][b.c]
    this.board[b.r][b.c] = tmp
  }

  private stepResolve(): void {
    if (this.pendingCombo) {
      const [a, b] = this.pendingCombo
      this.pendingCombo = null
      const cells = comboActivation(this.board, a, b)
      this.clearCells(cells, true)
      this.cascadeStep += 1
      applyGravity(this.board)
      refillBoard(this.board, this.config.colorCount, this.rng)
      this.resolveTimer = RESOLVE_DELAY
      return
    }

    const groups = findAllMatchGroups(this.board)
    if (groups.length === 0) {
      this.finishResolveChain()
      return
    }

    const merged = mergeMatchedCells(groups)
    const spawn = this.cascadeStep === 0
      ? specialFromMatch(merged, this.pivot, groups)
      : null

    this.clearCells(merged, false)

    if (spawn) {
      const existing = getCell(this.board, spawn.at.r, spawn.at.c)
      if (!existing) {
        this.board[spawn.at.r][spawn.at.c] = mk(spawn.color, spawn.special)
      } else {
        existing.special = spawn.special
      }
    }

    this.cascadeStep += 1
    applyGravity(this.board)
    refillBoard(this.board, this.config.colorCount, this.rng)
    this.pivot = null
    this.resolveTimer = RESOLVE_DELAY
  }

  private clearCells(cells: CellPos[], fromSpecial: boolean): void {
    this.lastClear = cells
    const count = cells.length
    this.score += scoreForClear(count, this.levelId, this.cascadeStep)

    for (const p of cells) {
      const cell = getCell(this.board, p.r, p.c)
      if (!cell) continue
      if (!fromSpecial && cell.special !== 'none') {
        const extra = cellsForSpecialActivation(this.board, p)
        for (const e of extra) {
          if (!cells.some((c) => c.r === e.r && c.c === e.c)) {
            this.board[e.r][e.c] = null
          }
        }
      }
      this.board[p.r][p.c] = null
    }
  }

  private finishResolveChain(): void {
    this.pivot = null
    this.cascadeStep = 0

    if (this.score >= this.config.targetScore) {
      this.phase = 'won'
      return
    }

    if (this.movesLeft <= 0) {
      this.phase = 'lost'
      return
    }

    if (!hasAnyValidMove(this.board)) {
      shuffleBoard(this.board, this.config.colorCount, this.rng)
      let guard = 0
      while (!hasAnyValidMove(this.board) && guard < 50) {
        shuffleBoard(this.board, this.config.colorCount, this.rng)
        guard++
      }
    }

    this.phase = 'playing'
  }

  private ensurePlayable(): void {
    if (!hasAnyValidMove(this.board)) {
      shuffleBoard(this.board, this.config.colorCount, this.rng)
    }
  }
}

/** Back-compat export name for views */
export { Match3Engine as GameEngine }
