import type { BoardGrid } from './board'
import { isAdjacent } from './board'
import { wouldMatchAfterSwap } from './detect'
import type { CellPos } from './types'
import { BOARD_SIZE } from './types'

export function findHintSwap(board: BoardGrid): [CellPos, CellPos] | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const a = { r, c }
      const neighbors: CellPos[] = [
        { r: r + 1, c },
        { r, c: c + 1 },
      ]
      for (const b of neighbors) {
        if (b.r >= BOARD_SIZE || b.c >= BOARD_SIZE) continue
        if (wouldMatchAfterSwap(board, a, b)) return [a, b]
      }
    }
  }
  return null
}

export function hasAnyValidMove(board: BoardGrid): boolean {
  return findHintSwap(board) !== null
}

export function validateSwap(board: BoardGrid, a: CellPos, b: CellPos): boolean {
  if (!isAdjacent(a, b)) return false
  return wouldMatchAfterSwap(board, a, b)
}
