// @ts-check
/** Classic patterns in plaintext format ('O' alive, '.' dead). */

/** @type {Readonly<Record<string, { name: string, cells: readonly string[] }>>} */
export const PATTERNS = Object.freeze({
  gun: {
    name: 'Gosper glider gun',
    cells: [
      '........................O...........',
      '......................O.O...........',
      '............OO......OO............OO',
      '...........O...O....OO............OO',
      'OO........O.....O...OO..............',
      'OO........O...O.OO....O.O...........',
      '..........O.....O.......O...........',
      '...........O...O....................',
      '............OO......................',
    ],
  },
  glider: { name: 'Glider', cells: ['.O.', '..O', 'OOO'] },
  lwss: { name: 'Lightweight spaceship', cells: ['.O..O', 'O....', 'O...O', 'OOOO.'] },
  pulsar: {
    name: 'Pulsar',
    cells: [
      '..OOO...OOO..',
      '.............',
      'O....O.O....O',
      'O....O.O....O',
      'O....O.O....O',
      '..OOO...OOO..',
      '.............',
      '..OOO...OOO..',
      'O....O.O....O',
      'O....O.O....O',
      'O....O.O....O',
      '.............',
      '..OOO...OOO..',
    ],
  },
  pentadecathlon: {
    name: 'Pentadecathlon',
    cells: ['..O....O..', 'OO.OOOO.OO', '..O....O..'],
  },
  rpentomino: { name: 'R-pentomino', cells: ['.OO', 'OO.', '.O.'] },
  acorn: { name: 'Acorn', cells: ['.O.....', '...O...', 'OO..OOO'] },
});
