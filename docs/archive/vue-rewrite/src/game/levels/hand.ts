import type { BubbleColor, HandCell } from '../types'



const c = (col: number, row: number, color: BubbleColor): HandCell => ({ col, row, color })



/** Levels 1–30: o‘ynaladigan boshlang‘ich layoutlar (LAK-style puzzle) */

export function getHandLayout(levelId: number): readonly HandCell[] | undefined {

  if (levelId > 30) return undefined



  if (levelId === 1) {

    return [

      c(3, 0, 0),

      c(4, 0, 0),

      c(5, 0, 0),

      c(2, 1, 1),

      c(3, 1, 1),

      c(4, 1, 1),

    ]

  }

  if (levelId === 2) {

    return [

      c(2, 0, 0),

      c(3, 0, 1),

      c(4, 0, 0),

      c(5, 0, 1),

      c(3, 1, 2),

      c(4, 1, 2),

      c(5, 1, 2),

    ]

  }

  if (levelId === 3) {

    return [

      c(1, 0, 0),

      c(2, 0, 0),

      c(6, 0, 0),

      c(7, 0, 0),

      c(3, 1, 1),

      c(4, 1, 1),

      c(5, 1, 1),

      c(4, 2, 2),

      c(5, 2, 2),

    ]

  }



  const layouts: Record<number, readonly HandCell[]> = {

    4: [

      c(0, 0, 0),

      c(7, 0, 0),

      c(3, 0, 1),

      c(4, 0, 1),

      c(2, 1, 2),

      c(3, 1, 2),

      c(4, 1, 2),

      c(5, 1, 2),

    ],

    5: [

      c(3, 0, 0),

      c(4, 0, 0),

      c(5, 0, 0),

      c(2, 1, 1),

      c(4, 1, 1),

      c(6, 1, 1),

      c(3, 2, 2),

      c(4, 2, 2),

      c(5, 2, 2),

    ],

    6: [

      c(2, 0, 3),

      c(3, 0, 0),

      c(4, 0, 0),

      c(5, 0, 0),

      c(6, 0, 3),

      c(3, 1, 1),

      c(4, 1, 1),

      c(5, 1, 1),

      c(4, 2, 2),

    ],

    7: [

      c(1, 0, 0),

      c(2, 0, 1),

      c(3, 0, 0),

      c(4, 0, 2),

      c(5, 0, 0),

      c(6, 0, 1),

      c(3, 1, 1),

      c(4, 1, 1),

      c(5, 1, 1),

      c(2, 2, 2),

      c(6, 2, 2),

    ],

    8: [

      c(0, 0, 0),

      c(1, 0, 0),

      c(6, 0, 1),

      c(7, 0, 1),

      c(3, 1, 2),

      c(4, 1, 2),

      c(5, 1, 2),

      c(2, 2, 3),

      c(3, 2, 3),

      c(4, 2, 0),

    ],

    9: [

      c(3, 0, 0),

      c(4, 0, 1),

      c(5, 0, 0),

      c(2, 1, 1),

      c(3, 1, 2),

      c(4, 1, 1),

      c(5, 1, 2),

      c(6, 1, 1),

      c(3, 2, 0),

      c(4, 2, 0),

      c(5, 2, 0),

    ],

    10: [

      c(2, 0, 0),

      c(3, 0, 0),

      c(4, 0, 1),

      c(5, 0, 1),

      c(6, 0, 0),

      c(1, 1, 2),

      c(4, 1, 2),

      c(7, 1, 2),

      c(3, 2, 3),

      c(4, 2, 3),

      c(5, 2, 3),

    ],

  }



  if (layouts[levelId]) return layouts[levelId]



  const colors = 3 + Math.floor((levelId - 1) / 10)

  const rows = 4 + Math.floor((levelId - 1) / 6)

  const cells: HandCell[] = []

  for (let row = 0; row < Math.min(rows, 8); row++) {

    const colsInRow = row % 2 === 0 ? 8 : 7

    const offset = (levelId + row) % 3

    for (let col = offset; col < colsInRow; col += 3) {

      const color = ((col + row + levelId) % colors) as BubbleColor

      cells.push(c(col, row, color))

    }

  }

  return cells

}


