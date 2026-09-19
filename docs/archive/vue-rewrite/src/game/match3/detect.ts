import type { BoardGrid } from './board'
import { getCell, posKey } from './board'
import type { CandyColor, CellPos, SpecialType } from './types'
import { BOARD_SIZE } from './types'

export interface MatchGroup {
  cells: CellPos[]
  color: CandyColor
  horizontal: boolean
  vertical: boolean
}

function sameMatchColor(
  board: BoardGrid,
  r: number,
  c: number,
  color: CandyColor,
): boolean {
  const cell = getCell(board, r, c)
  if (!cell) return false
  if (cell.special === 'color_bomb') return false
  return cell.color === color
}

export function findAllMatchGroups(board: BoardGrid): MatchGroup[] {
  const used = new Set<string>()
  const groups: MatchGroup[] = []

  for (let r = 0; r < BOARD_SIZE; r++) {
    let c = 0
    while (c < BOARD_SIZE) {
      const cell = getCell(board, r, c)
      if (!cell || cell.special === 'color_bomb') {
        c++
        continue
      }
      const color = cell.color
      let end = c + 1
      while (end < BOARD_SIZE && sameMatchColor(board, r, end, color)) end++
      const len = end - c
      if (len >= 3) {
        const cells: CellPos[] = []
        for (let cc = c; cc < end; cc++) cells.push({ r, c: cc })
        groups.push({ cells, color, horizontal: true, vertical: false })
        for (const p of cells) used.add(posKey(p.r, p.c))
      }
      c = end
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let r = 0
    while (r < BOARD_SIZE) {
      const cell = getCell(board, r, c)
      if (!cell || cell.special === 'color_bomb') {
        r++
        continue
      }
      const color = cell.color
      let end = r + 1
      while (end < BOARD_SIZE && sameMatchColor(board, end, c, color)) end++
      const len = end - r
      if (len >= 3) {
        const cells: CellPos[] = []
        for (let rr = r; rr < end; rr++) cells.push({ r: rr, c })
        groups.push({ cells, color, horizontal: false, vertical: true })
        for (const p of cells) used.add(posKey(p.r, p.c))
      }
      r = end
    }
  }

  return groups
}

export function mergeMatchedCells(groups: MatchGroup[]): CellPos[] {
  const set = new Set<string>()
  const out: CellPos[] = []
  for (const g of groups) {
    for (const p of g.cells) {
      const k = posKey(p.r, p.c)
      if (!set.has(k)) {
        set.add(k)
        out.push(p)
      }
    }
  }
  return out
}

export interface SpecialSpawn {
  at: CellPos
  special: SpecialType
  color: CandyColor
}

/** Pick special to create from merged match at swap pivot. */
export function specialFromMatch(
  allCells: CellPos[],
  pivot: CellPos | null,
  groups: MatchGroup[],
): SpecialSpawn | null {
  if (allCells.length < 4) return null

  const cellSet = new Set(allCells.map((p) => posKey(p.r, p.c)))
  const color = groups[0]?.color ?? 0

  const hasH = groups.some((g) => g.horizontal && g.cells.length >= 4)
  const hasV = groups.some((g) => g.vertical && g.cells.length >= 4)
  const straight5 = groups.some((g) => g.cells.length >= 5)

  let special: SpecialType = 'none'
  if (straight5) special = 'color_bomb'
  else if (hasH && hasV) special = 'wrapped'
  else if (hasH) special = 'striped_h'
  else if (hasV) special = 'striped_v'
  else if (allCells.length >= 5) special = 'wrapped'
  else if (allCells.length === 4) special = hasH ? 'striped_h' : 'striped_v'

  if (special === 'none') return null

  let at = pivot
  if (!at || !cellSet.has(posKey(at.r, at.c))) {
    at = allCells[Math.floor(allCells.length / 2)]
  }

  return { at, special, color }
}

export function wouldMatchAfterSwap(
  board: BoardGrid,
  a: CellPos,
  b: CellPos,
): boolean {
  const copy = board.map((row) => row.map((c) => (c ? { ...c } : null)))
  const tmp = copy[a.r][a.c]
  copy[a.r][a.c] = copy[b.r][b.c]
  copy[b.r][b.c] = tmp
  const groups = findAllMatchGroups(copy)
  if (groups.length === 0) return false
  const merged = mergeMatchedCells(groups)
  return merged.some(
    (p) => (p.r === a.r && p.c === a.c) || (p.r === b.r && p.c === b.c),
  )
}
