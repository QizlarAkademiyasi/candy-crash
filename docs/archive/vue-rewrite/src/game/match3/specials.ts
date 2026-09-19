import type { BoardGrid } from './board'
import { getCell, posKey } from './board'
import type { CellPos } from './types'
import { BOARD_SIZE } from './types'

export function cellsForSpecialActivation(
  board: BoardGrid,
  pos: CellPos,
): CellPos[] {
  const cell = getCell(board, pos.r, pos.c)
  if (!cell) return []

  const out: CellPos[] = []
  const add = (r: number, c: number) => {
    if (r >= 0 && c >= 0 && r < BOARD_SIZE && c < BOARD_SIZE && getCell(board, r, c)) {
      const k = posKey(r, c)
      if (!out.some((p) => posKey(p.r, p.c) === k)) out.push({ r, c })
    }
  }

  switch (cell.special) {
    case 'striped_h':
      for (let c = 0; c < BOARD_SIZE; c++) add(pos.r, c)
      break
    case 'striped_v':
      for (let r = 0; r < BOARD_SIZE; r++) add(r, pos.c)
      break
    case 'wrapped':
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) add(pos.r + dr, pos.c + dc)
      }
      break
    case 'color_bomb':
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (getCell(board, r, c)?.color === cell.color) add(r, c)
        }
      }
      add(pos.r, pos.c)
      break
    default:
      out.push(pos)
  }
  return out
}

export function comboActivation(
  board: BoardGrid,
  a: CellPos,
  b: CellPos,
): CellPos[] {
  const ca = getCell(board, a.r, a.c)
  const cb = getCell(board, b.r, b.c)
  if (!ca || !cb) return []

  const sa = ca.special
  const sb = cb.special

  if (sa === 'none' && sb === 'none') return []

  if (sa === 'color_bomb' && sb === 'color_bomb') {
    const all: CellPos[] = []
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (getCell(board, r, c)) all.push({ r, c })
      }
    }
    return all
  }

  if (sa === 'color_bomb' || sb === 'color_bomb') {
    const bombPos = sa === 'color_bomb' ? a : b
    const other = sa === 'color_bomb' ? cb : ca
    const out: CellPos[] = []
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (getCell(board, r, c)?.color === other.color) out.push({ r, c })
      }
    }
    out.push(bombPos)
    return out
  }

  const isStriped = (s: string) => s === 'striped_h' || s === 'striped_v'
  const isWrapped = (s: string) => s === 'wrapped'

  if (isStriped(sa) && isStriped(sb)) {
    const out: CellPos[] = []
    for (let c = 0; c < BOARD_SIZE; c++) {
      out.push({ r: a.r, c })
      out.push({ r: b.r, c })
    }
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (!out.some((p) => p.r === r && p.c === a.c)) out.push({ r, c: a.c })
      if (!out.some((p) => p.r === r && p.c === b.c)) out.push({ r, c: b.c })
    }
    return dedupe(out)
  }

  if ((isStriped(sa) && isWrapped(sb)) || (isStriped(sb) && isWrapped(sa))) {
    const center = isWrapped(sa) ? a : b
    const out: CellPos[] = []
    for (let dr = -1; dr <= 1; dr++) {
      const r = center.r + dr
      if (r >= 0 && r < BOARD_SIZE) {
        for (let c = 0; c < BOARD_SIZE; c++) out.push({ r, c })
      }
    }
    for (let dc = -1; dc <= 1; dc++) {
      const c = center.c + dc
      if (c >= 0 && c < BOARD_SIZE) {
        for (let r = 0; r < BOARD_SIZE; r++) out.push({ r, c })
      }
    }
    return dedupe(out)
  }

  if (isWrapped(sa) && isWrapped(sb)) {
    const out: CellPos[] = []
    const midR = Math.round((a.r + b.r) / 2)
    const midC = Math.round((a.c + b.c) / 2)
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const r = midR + dr
        const c = midC + dc
        if (r >= 0 && c >= 0 && r < BOARD_SIZE && c < BOARD_SIZE && getCell(board, r, c)) {
          out.push({ r, c })
        }
      }
    }
    return out
  }

  return dedupe([
    ...cellsForSpecialActivation(board, a),
    ...cellsForSpecialActivation(board, b),
  ])
}

function dedupe(cells: CellPos[]): CellPos[] {
  const s = new Set<string>()
  const out: CellPos[] = []
  for (const p of cells) {
    const k = posKey(p.r, p.c)
    if (!s.has(k)) {
      s.add(k)
      out.push(p)
    }
  }
  return out
}

export function isSpecialSwap(board: BoardGrid, a: CellPos, b: CellPos): boolean {
  const ca = getCell(board, a.r, a.c)
  const cb = getCell(board, b.r, b.c)
  if (!ca || !cb) return false
  return ca.special !== 'none' || cb.special !== 'none'
}
