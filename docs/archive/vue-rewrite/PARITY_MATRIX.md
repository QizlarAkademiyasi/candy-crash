# Candy Crush V1 — parity matrix (reference: GameFools `CandyCrush.swf`)

Reference: 755×600 stage, `CandyCrush.swf` via Ruffle. Implementation targets **mechanics + UX flow**, not King assets.

## Grid

| Item | SWF (V1) | Vue implementation |
|------|----------|-------------------|
| Size | 9×9 square | `BOARD_SIZE = 9` |
| Shape | Full rectangle | Full rectangle |
| Initial matches | None on deal | `board.ts` regenerates until clean |

## Level rules

| Item | SWF (V1) | Vue implementation |
|------|----------|-------------------|
| Win | Score ≥ target before moves = 0 | `objectives.ts` |
| Lose | Moves = 0 and score < target | Same |
| Moves | Per-level limit (typical 20–35) | `LevelConfig.moves` |
| Timer | Some arcade modes use time; level map uses **moves** | Moves-only for map levels |
| Stars | 1 = pass, 2/3 = score thresholds | `star2Score`, `star3Score` per level |

## Scoring (V1 wiki parity)

| Item | Formula |
|------|---------|
| Base match level `n` | ~`30 × (n + 1)` per candy in match (implemented in `scoring.ts`) |
| Cascade combo | Multiplier on consecutive cascade steps |

## Special creation (swap-caused match)

| Pattern | Result |
|---------|--------|
| 4 in a row/col | Striped (orientation = line direction) |
| 5 in a straight line | Color bomb |
| T or L (5+ cells) | Wrapped at swap pivot / intersection |
| 2×2 square | Wrapped (bonus rule) |

## Special activation

| Candy | Effect |
|-------|--------|
| Striped H | Clear entire row |
| Striped V | Clear entire column |
| Wrapped | 3×3 blast (V1 radius, not Saga 5×5) |
| Color bomb | Swap with color → clear all that color; bomb+bomb → clear board |

## Combinations (V1)

| Pair | Effect |
|------|--------|
| Striped + Striped | Row + column through both cells |
| Striped + Wrapped | 3 rows + 3 cols stripe burst |
| Wrapped + Wrapped | 5×5 area (approximation) |
| Bomb + color | Clear all of swapped color |
| Bomb + Bomb | Clear entire grid |

## Candy cane meter

| Item | SWF | Vue |
|------|-----|-----|
| Fill | Progress toward “episode” feel; fills on score chunks | `caneProgress = score % caneChunk / caneChunk` visual + level win advances map |
| Advance | Level complete → next on map | `maxLevel` persist |

## Boosters (pre-level, no ads)

| Booster | Effect |
|---------|--------|
| Color bomb start | One bomb placed random |
| Wrapped + striped start | Pair placed adjacent |
| +10 moves | Add 10 to move limit |
| Live hints | Highlight one valid swap |

## No valid moves

| SWF | Vue |
|-----|-----|
| Shuffle board | `board.shuffleUntilMoves()` |

## Removed (GameFools / portal)

- Side ads, footer, social widgets, rating prompts
- Ruffle context menu / SWF download in production app
