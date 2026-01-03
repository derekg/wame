// Tetromino piece definitions for 6x6 grid

const PIECE_SHAPES = {
  // 4-cell pieces
  I4: { cells: [[0, 0], [0, 1], [0, 2], [0, 3]], width: 4, height: 1 },
  O: { cells: [[0, 0], [0, 1], [1, 0], [1, 1]], width: 2, height: 2 },
  T: { cells: [[0, 0], [0, 1], [0, 2], [1, 1]], width: 3, height: 2 },
  S: { cells: [[0, 1], [0, 2], [1, 0], [1, 1]], width: 3, height: 2 },
  Z: { cells: [[0, 0], [0, 1], [1, 1], [1, 2]], width: 3, height: 2 },
  L: { cells: [[0, 0], [1, 0], [2, 0], [2, 1]], width: 2, height: 3 },
  J: { cells: [[0, 1], [1, 1], [2, 0], [2, 1]], width: 2, height: 3 },

  // 3-cell pieces
  I3: { cells: [[0, 0], [0, 1], [0, 2]], width: 3, height: 1 },
  L3: { cells: [[0, 0], [1, 0], [1, 1]], width: 2, height: 2 },

  // 2-cell pieces
  I2: { cells: [[0, 0], [0, 1]], width: 2, height: 1 },

  // 1-cell
  DOT: { cells: [[0, 0]], width: 1, height: 1 }
};

// Piece weights (smaller = more common for faster gameplay)
const PIECE_WEIGHTS = {
  I4: 2, O: 3, T: 2, S: 2, Z: 2, L: 2, J: 2,
  I3: 5, L3: 5,
  I2: 6,
  DOT: 2
};

// Letter frequencies
const LETTER_WEIGHTS = {
  'E': 12, 'T': 9, 'A': 8, 'O': 8, 'I': 7, 'N': 7, 'S': 6, 'H': 6, 'R': 6,
  'D': 4, 'L': 4, 'C': 3, 'U': 3, 'M': 3, 'W': 2, 'F': 2, 'G': 2, 'Y': 2,
  'P': 2, 'B': 2, 'V': 1, 'K': 1, 'J': 1, 'X': 1, 'Q': 1, 'Z': 1
};

// Create pools
function createLetterPool() {
  const pool = [];
  for (const [letter, weight] of Object.entries(LETTER_WEIGHTS)) {
    for (let i = 0; i < weight; i++) pool.push(letter);
  }
  return pool;
}

function createPiecePool() {
  const pool = [];
  for (const [name, weight] of Object.entries(PIECE_WEIGHTS)) {
    for (let i = 0; i < weight; i++) pool.push(name);
  }
  return pool;
}

const BASE_LETTER_POOL = createLetterPool();
const PIECE_POOL = createPiecePool();

// Mystery word tracking
let currentMysteryWord = '';
let neededLetters = [];
let currentLetterBias = 0.45; // Default, updated by game

function setMysteryWord(word) {
  currentMysteryWord = word.toUpperCase();
  neededLetters = [...new Set(currentMysteryWord.split(''))]; // Unique letters needed
}

function setLetterBias(bias) {
  currentLetterBias = bias;
}

function updateNeededLetters(captured, revealed = null) {
  const still = [];
  for (let i = 0; i < currentMysteryWord.length; i++) {
    // Only include letters that are revealed (or if no revealed array, include all uncaptured)
    const isRevealed = revealed === null || revealed[i];
    if (!captured[i] && isRevealed) {
      still.push(currentMysteryWord[i]);
    }
  }
  neededLetters = [...new Set(still)];
}

function getNeededLettersArray() {
  return neededLetters;
}

function getRandomLetter() {
  // Chance for mystery word letters based on current difficulty
  if (neededLetters.length > 0 && Math.random() < currentLetterBias) {
    return neededLetters[Math.floor(Math.random() * neededLetters.length)];
  }
  return BASE_LETTER_POOL[Math.floor(Math.random() * BASE_LETTER_POOL.length)];
}

function isLetterNeeded(letter) {
  return neededLetters.includes(letter.toUpperCase());
}

let currentBigPieceBias = 0; // 0 = normal, 0.5 = 50% more likely big pieces

function setBigPieceBias(bias) {
  currentBigPieceBias = bias;
}

// Big pieces (4 cells)
const BIG_PIECES = ['I4', 'O', 'T', 'S', 'Z', 'L', 'J'];
// Small pieces (1-3 cells)
const SMALL_PIECES = ['I3', 'L3', 'I2', 'DOT'];

function getRandomPieceShape() {
  // Apply big piece bias
  if (currentBigPieceBias > 0 && Math.random() < currentBigPieceBias) {
    const shapeName = BIG_PIECES[Math.floor(Math.random() * BIG_PIECES.length)];
    return { name: shapeName, ...PIECE_SHAPES[shapeName] };
  }

  // Normal weighted selection
  const shapeName = PIECE_POOL[Math.floor(Math.random() * PIECE_POOL.length)];
  return { name: shapeName, ...PIECE_SHAPES[shapeName] };
}

// Rotate piece 90 degrees clockwise
function rotatePiece(piece) {
  const { cells, width, height, letters, id, name } = piece;

  // Rotate cells: (row, col) -> (col, height - 1 - row)
  const rotatedCells = cells.map(([row, col]) => [col, height - 1 - row]);

  // Normalize to start from 0,0
  const minRow = Math.min(...rotatedCells.map(c => c[0]));
  const minCol = Math.min(...rotatedCells.map(c => c[1]));
  const normalizedCells = rotatedCells.map(([r, c]) => [r - minRow, c - minCol]);

  const newWidth = height;
  const newHeight = width;

  return {
    name,
    cells: normalizedCells,
    width: newWidth,
    height: newHeight,
    letters, // Letters stay with their cells
    id
  };
}

function generatePiece() {
  const shape = getRandomPieceShape();
  const letters = shape.cells.map(() => getRandomLetter());
  return {
    ...shape,
    letters,
    id: Math.random().toString(36).substr(2, 9)
  };
}
