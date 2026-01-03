// Game Configuration
const GRID_SIZE = 6;
const FIRST_PLAY_KEY = 'verbra_played';

// Game State
const gameState = {
  grid: [],
  mysteryWord: '',
  captured: [],
  pieces: [],
  gameOver: false,
  won: false,
  selectedPieceIndex: null,
  linesCleared: 0,
  combo: 0,
  score: 0,
  streak: 0,  // Consecutive line clears
  movesRemaining: 0,
  maxMoves: 0
};

// DOM Elements
const boardEl = document.getElementById('game-board');
const trayEl = document.getElementById('piece-tray');
const mysteryWordEl = document.getElementById('mystery-word');
const neededLettersEl = document.getElementById('needed-letters');
const progressFill = document.getElementById('progress-fill');
const captureContainer = document.getElementById('capture-container');
const particlesContainer = document.getElementById('particles-container');
const confettiCanvas = document.getElementById('confetti-canvas');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalStats = document.getElementById('modal-stats');
const modalBtn = document.getElementById('modal-btn');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const helpCloseBtn = document.getElementById('help-close-btn');
const scoreEl = document.getElementById('score');
const movesEl = document.getElementById('moves');

// Confetti system
const confettiCtx = confettiCanvas.getContext('2d');
let confettiPieces = [];
let confettiAnimating = false;

function resizeConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeConfetti();
window.addEventListener('resize', resizeConfetti);

function createConfetti() {
  confettiPieces = [];
  const colors = ['#a855f7', '#6366f1', '#3b82f6', '#ec4899', '#f59e0b', '#10b981'];

  for (let i = 0; i < 150; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 100,
      w: 8 + Math.random() * 8,
      h: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      velocityX: (Math.random() - 0.5) * 4,
      velocityY: 2 + Math.random() * 4,
      swing: Math.random() * Math.PI * 2
    });
  }

  confettiAnimating = true;
  animateConfetti();
}

function animateConfetti() {
  if (!confettiAnimating) return;

  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  let stillActive = false;

  confettiPieces.forEach(p => {
    p.y += p.velocityY;
    p.x += p.velocityX + Math.sin(p.swing) * 0.5;
    p.rotation += p.rotationSpeed;
    p.swing += 0.05;

    if (p.y < confettiCanvas.height + 50) {
      stillActive = true;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rotation * Math.PI / 180);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      confettiCtx.restore();
    }
  });

  if (stillActive) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiAnimating = false;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

// Particle effects
function createParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.background = color || '#a855f7';

    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
    const velocity = 50 + Math.random() * 80;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity;

    particle.style.transition = 'all 0.6s ease-out';
    particlesContainer.appendChild(particle);

    requestAnimationFrame(() => {
      particle.style.transform = `translate(${dx}px, ${dy}px) scale(0)`;
      particle.style.opacity = '0';
    });

    setTimeout(() => particle.remove(), 600);
  }
}

// Initialize the game
function initGame() {
  gameState.mysteryWord = MYSTERY_WORDS[Math.floor(Math.random() * MYSTERY_WORDS.length)].toUpperCase();
  gameState.captured = Array(gameState.mysteryWord.length).fill(false);

  setMysteryWord(gameState.mysteryWord);

  gameState.grid = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({ letter: null, filled: false }))
  );

  gameState.pieces = [generatePiece(), generatePiece(), generatePiece()];
  gameState.gameOver = false;
  gameState.won = false;
  gameState.selectedPieceIndex = null;
  gameState.linesCleared = 0;
  gameState.combo = 0;
  gameState.score = 0;
  gameState.streak = 0;

  // Set moves based on word length: 5 letters = 20 moves, 6 = 23, 7 = 26
  gameState.maxMoves = 17 + (gameState.mysteryWord.length * 1);
  gameState.movesRemaining = gameState.maxMoves;

  scoreEl.textContent = '0';
  updateMovesDisplay();

  renderBoard();
  renderPieces();
  renderMysteryWord();
  updateProgress();
  hideModal();

  // Show help on first play
  if (!localStorage.getItem(FIRST_PLAY_KEY)) {
    setTimeout(() => {
      helpModal.classList.add('show');
      localStorage.setItem(FIRST_PLAY_KEY, 'true');
    }, 300);
  }

  console.log('Mystery word:', gameState.mysteryWord);
}

// Render mystery word
function renderMysteryWord() {
  mysteryWordEl.innerHTML = '';

  for (let i = 0; i < gameState.mysteryWord.length; i++) {
    const letterEl = document.createElement('div');
    letterEl.className = 'mystery-letter';
    letterEl.id = `mystery-${i}`;

    if (gameState.captured[i]) {
      letterEl.classList.add('captured');
      letterEl.textContent = gameState.mysteryWord[i];
    } else {
      letterEl.classList.add('needed');
    }

    mysteryWordEl.appendChild(letterEl);
  }

  // Show needed letters
  const needed = getNeededLettersArray();
  if (needed.length > 0 && needed.length < gameState.mysteryWord.length) {
    neededLettersEl.innerHTML = 'Need: ' + needed.map(l => `<span>${l}</span>`).join('');
  } else if (needed.length === 0) {
    neededLettersEl.innerHTML = '';
  } else {
    neededLettersEl.innerHTML = '';
  }
}

function updateProgress() {
  const captured = gameState.captured.filter(c => c).length;
  const percent = (captured / gameState.mysteryWord.length) * 100;
  progressFill.style.width = percent + '%';
}

function addScore(points) {
  gameState.score += points;
  scoreEl.textContent = gameState.score;
  scoreEl.classList.add('bump');
  setTimeout(() => scoreEl.classList.remove('bump'), 300);
}

function updateMovesDisplay() {
  movesEl.textContent = gameState.movesRemaining;

  // Remove previous state classes
  movesEl.classList.remove('warning', 'danger', 'bump');

  // Add warning/danger states
  if (gameState.movesRemaining <= 3) {
    movesEl.classList.add('danger');
  } else if (gameState.movesRemaining <= 6) {
    movesEl.classList.add('warning');
  }
}

function useMove() {
  gameState.movesRemaining--;
  movesEl.classList.add('bump');
  setTimeout(() => movesEl.classList.remove('bump'), 300);
  updateMovesDisplay();
}

// Apply gravity - blocks fall down to fill gaps
function applyGravity() {
  let blocksMoved = false;

  // Process each column
  for (let col = 0; col < GRID_SIZE; col++) {
    // Start from bottom, move up
    let writeRow = GRID_SIZE - 1;

    for (let row = GRID_SIZE - 1; row >= 0; row--) {
      if (gameState.grid[row][col].filled) {
        if (row !== writeRow) {
          // Move this cell down
          gameState.grid[writeRow][col] = { ...gameState.grid[row][col] };
          gameState.grid[row][col] = { letter: null, filled: false };
          blocksMoved = true;
        }
        writeRow--;
      }
    }
  }

  return blocksMoved;
}

// Check for complete lines (used for chain reactions)
function findCompleteLines() {
  const rowsToClear = [];
  const colsToClear = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    if (gameState.grid[row].every(cell => cell.filled)) {
      rowsToClear.push(row);
    }
  }

  for (let col = 0; col < GRID_SIZE; col++) {
    if (gameState.grid.every(row => row[col].filled)) {
      colsToClear.push(col);
    }
  }

  return { rowsToClear, colsToClear };
}

function calculateLineScore(linesCleared, lettersCapt) {
  // Base points: 100 per line
  let points = linesCleared * 100;

  // Combo multiplier (multiple lines at once)
  if (linesCleared > 1) {
    points *= linesCleared; // 2 lines = 2x, 3 lines = 3x, etc.
  }

  // Streak bonus (consecutive turns with line clears)
  if (gameState.streak > 0) {
    points += gameState.streak * 25;
  }

  // Bonus for capturing letters
  points += lettersCapt * 50;

  return points;
}

// Render game board
function renderBoard() {
  boardEl.innerHTML = '';

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;

      const gridCell = gameState.grid[row][col];
      if (gridCell.filled) {
        cell.classList.add('filled');
        cell.textContent = gridCell.letter;

        if (isLetterNeeded(gridCell.letter)) {
          cell.classList.add('needed');
        }
      }

      cell.addEventListener('click', () => handleCellClick(row, col));
      boardEl.appendChild(cell);
    }
  }
}

// Render pieces
function renderPieces() {
  trayEl.innerHTML = '';

  gameState.pieces.forEach((piece, index) => {
    if (!piece) {
      const placeholder = document.createElement('div');
      placeholder.className = 'piece used';
      placeholder.style.width = '65px';
      placeholder.style.height = '65px';
      trayEl.appendChild(placeholder);
      return;
    }

    const pieceEl = document.createElement('div');
    pieceEl.className = 'piece';
    if (gameState.selectedPieceIndex === index) {
      pieceEl.classList.add('selected');
    }
    pieceEl.dataset.index = index;
    pieceEl.style.gridTemplateColumns = `repeat(${piece.width}, 28px)`;
    pieceEl.style.gridTemplateRows = `repeat(${piece.height}, 28px)`;

    for (let row = 0; row < piece.height; row++) {
      for (let col = 0; col < piece.width; col++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'piece-cell';

        const cellIndex = piece.cells.findIndex(c => c[0] === row && c[1] === col);
        if (cellIndex !== -1) {
          const letter = piece.letters[cellIndex];
          cellEl.textContent = letter;
          if (isLetterNeeded(letter)) {
            cellEl.classList.add('needed');
          }
        } else {
          cellEl.classList.add('empty');
        }

        pieceEl.appendChild(cellEl);
      }
    }

    // Tap to select/rotate
    pieceEl.addEventListener('click', (e) => {
      e.stopPropagation();
      handlePieceTap(index);
    });

    // Drag
    pieceEl.addEventListener('mousedown', (e) => startDrag(e, index));
    pieceEl.addEventListener('touchstart', (e) => startDrag(e, index), { passive: false });

    trayEl.appendChild(pieceEl);
  });
}

// Handle piece tap - select or rotate
function handlePieceTap(index) {
  if (!gameState.pieces[index]) return;

  if (gameState.selectedPieceIndex === index) {
    // Already selected - rotate it
    const rotated = rotatePiece(gameState.pieces[index]);
    gameState.pieces[index] = rotated;

    // Animate rotation
    const pieceEl = trayEl.querySelector(`[data-index="${index}"]`);
    if (pieceEl) {
      pieceEl.classList.add('rotate-animation');
      setTimeout(() => pieceEl.classList.remove('rotate-animation'), 250);
    }

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(20);

    renderPieces();
  } else {
    // Select this piece
    gameState.selectedPieceIndex = index;
    renderPieces();
  }
}

// Handle cell click
function handleCellClick(row, col) {
  if (gameState.selectedPieceIndex === null) return;

  const piece = gameState.pieces[gameState.selectedPieceIndex];
  if (!piece) return;

  const startRow = row - Math.floor(piece.height / 2);
  const startCol = col - Math.floor(piece.width / 2);

  if (canPlacePiece(piece, startRow, startCol)) {
    placePiece(piece, startRow, startCol, gameState.selectedPieceIndex);
    gameState.selectedPieceIndex = null;
  }
}

// Drag handling
let draggedPiece = null;
let dragStartTime = 0;
let dragGhost = null;

function createDragGhost(piece) {
  const ghost = document.createElement('div');
  ghost.className = 'drag-ghost';
  ghost.style.gridTemplateColumns = `repeat(${piece.width}, 32px)`;
  ghost.style.gridTemplateRows = `repeat(${piece.height}, 32px)`;
  ghost.style.display = 'grid';
  ghost.style.gap = '2px';

  for (let row = 0; row < piece.height; row++) {
    for (let col = 0; col < piece.width; col++) {
      const cellEl = document.createElement('div');
      cellEl.className = 'piece-cell';

      const cellIndex = piece.cells.findIndex(c => c[0] === row && c[1] === col);
      if (cellIndex !== -1) {
        const letter = piece.letters[cellIndex];
        cellEl.textContent = letter;
        if (isLetterNeeded(letter)) {
          cellEl.classList.add('needed');
        }
      } else {
        cellEl.classList.add('empty');
      }

      ghost.appendChild(cellEl);
    }
  }

  document.body.appendChild(ghost);
  return ghost;
}

function startDrag(e, pieceIndex) {
  if (gameState.gameOver || !gameState.pieces[pieceIndex]) return;

  e.preventDefault();
  dragStartTime = Date.now();

  const piece = gameState.pieces[pieceIndex];
  draggedPiece = { piece, index: pieceIndex };

  gameState.selectedPieceIndex = pieceIndex;
  renderPieces();

  const pieceEl = trayEl.querySelector(`[data-index="${pieceIndex}"]`);
  if (pieceEl) pieceEl.classList.add('dragging');

  // Create floating ghost
  dragGhost = createDragGhost(piece);

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchmove', onDrag, { passive: false });
  document.addEventListener('touchend', endDrag);

  onDrag(e);
}

function onDrag(e) {
  if (!draggedPiece) return;

  e.preventDefault();

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  // Move ghost to follow finger/cursor
  if (dragGhost) {
    dragGhost.style.left = clientX + 'px';
    dragGhost.style.top = (clientY - 40) + 'px'; // Offset so user can see where placing
  }

  const boardRect = boardEl.getBoundingClientRect();
  const cellSize = boardRect.width / GRID_SIZE;

  const relX = clientX - boardRect.left;
  const relY = clientY - boardRect.top;

  const col = Math.floor(relX / cellSize);
  const row = Math.floor(relY / cellSize);

  clearPreview();

  const startRow = row - Math.floor(draggedPiece.piece.height / 2);
  const startCol = col - Math.floor(draggedPiece.piece.width / 2);

  if (row >= 0 && col >= 0 && row < GRID_SIZE && col < GRID_SIZE) {
    showPreview(draggedPiece.piece, startRow, startCol);
  }
}

function endDrag(e) {
  if (!draggedPiece) return;

  const dragDuration = Date.now() - dragStartTime;

  const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
  const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

  const boardRect = boardEl.getBoundingClientRect();
  const cellSize = boardRect.width / GRID_SIZE;

  const relX = clientX - boardRect.left;
  const relY = clientY - boardRect.top;

  const col = Math.floor(relX / cellSize);
  const row = Math.floor(relY / cellSize);

  const startRow = row - Math.floor(draggedPiece.piece.height / 2);
  const startCol = col - Math.floor(draggedPiece.piece.width / 2);

  // Check if this was a tap (not a drag)
  if (dragDuration <= 150) {
    // It's a tap - handle selection/rotation
    const pieceIndex = draggedPiece.index;

    // Clean up drag state first
    if (dragGhost) {
      dragGhost.remove();
      dragGhost = null;
    }
    const pieceEl = trayEl.querySelector(`[data-index="${draggedPiece.index}"]`);
    if (pieceEl) pieceEl.classList.remove('dragging');
    draggedPiece = null;

    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', endDrag);

    // Now handle the tap
    handlePieceTap(pieceIndex);
    return;
  }

  // It's a drag - try to place the piece
  if (canPlacePiece(draggedPiece.piece, startRow, startCol)) {
    placePiece(draggedPiece.piece, startRow, startCol, draggedPiece.index);
    gameState.selectedPieceIndex = null;
  }

  clearPreview();

  // Remove drag ghost
  if (dragGhost) {
    dragGhost.remove();
    dragGhost = null;
  }

  const pieceEl = trayEl.querySelector(`[data-index="${draggedPiece.index}"]`);
  if (pieceEl) pieceEl.classList.remove('dragging');

  draggedPiece = null;

  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', endDrag);
}

function clearPreview() {
  document.querySelectorAll('.cell.preview, .cell.invalid-preview, .cell.preview-letter').forEach(cell => {
    cell.classList.remove('preview', 'invalid-preview', 'preview-letter');
    if (!cell.classList.contains('filled')) cell.textContent = '';
  });
}

function showPreview(piece, startRow, startCol) {
  const canPlace = canPlacePiece(piece, startRow, startCol);

  piece.cells.forEach(([row, col], i) => {
    const gridRow = startRow + row;
    const gridCol = startCol + col;

    if (gridRow >= 0 && gridRow < GRID_SIZE && gridCol >= 0 && gridCol < GRID_SIZE) {
      const cell = boardEl.querySelector(`[data-row="${gridRow}"][data-col="${gridCol}"]`);
      if (cell && !gameState.grid[gridRow][gridCol].filled) {
        cell.classList.add(canPlace ? 'preview' : 'invalid-preview');
        if (canPlace) {
          cell.classList.add('preview-letter');
          cell.textContent = piece.letters[i];
        }
      }
    }
  });
}

function canPlacePiece(piece, startRow, startCol) {
  for (const [row, col] of piece.cells) {
    const gridRow = startRow + row;
    const gridCol = startCol + col;

    if (gridRow < 0 || gridRow >= GRID_SIZE || gridCol < 0 || gridCol >= GRID_SIZE) {
      return false;
    }
    if (gameState.grid[gridRow][gridCol].filled) {
      return false;
    }
  }
  return true;
}

function placePiece(piece, startRow, startCol, pieceIndex) {
  const placedCells = [];

  piece.cells.forEach(([row, col], i) => {
    const gridRow = startRow + row;
    const gridCol = startCol + col;
    gameState.grid[gridRow][gridCol] = {
      letter: piece.letters[i],
      filled: true
    };
    placedCells.push({ row: gridRow, col: gridCol });
  });

  gameState.pieces[pieceIndex] = null;

  // Use a move
  useMove();

  // Haptic
  if (navigator.vibrate) navigator.vibrate(30);

  renderBoard();
  renderPieces();

  placedCells.forEach(({ row, col }) => {
    const cell = boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) cell.classList.add('new');
  });

  setTimeout(() => checkLines(), 200);
}

function checkLines() {
  const rowsToClear = [];
  const colsToClear = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    if (gameState.grid[row].every(cell => cell.filled)) {
      rowsToClear.push(row);
    }
  }

  for (let col = 0; col < GRID_SIZE; col++) {
    if (gameState.grid.every(row => row[col].filled)) {
      colsToClear.push(col);
    }
  }

  const totalLines = rowsToClear.length + colsToClear.length;

  if (totalLines > 0) {
    const clearedLetters = [];
    const clearedPositions = new Set();

    rowsToClear.forEach(row => {
      for (let col = 0; col < GRID_SIZE; col++) {
        const key = `${row}-${col}`;
        if (!clearedPositions.has(key)) {
          const letter = gameState.grid[row][col].letter;
          const cell = boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
          clearedLetters.push({ letter, cell, row, col });
          clearedPositions.add(key);
          if (cell) cell.classList.add('clearing');
        }
      }
    });

    colsToClear.forEach(col => {
      for (let row = 0; row < GRID_SIZE; row++) {
        const key = `${row}-${col}`;
        if (!clearedPositions.has(key)) {
          const letter = gameState.grid[row][col].letter;
          const cell = boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
          clearedLetters.push({ letter, cell, row, col });
          clearedPositions.add(key);
          if (cell) cell.classList.add('clearing');
        }
      }
    });

    gameState.linesCleared += totalLines;
    gameState.streak++;

    // Screen shake for combo
    if (totalLines > 1) {
      boardEl.classList.add('shake');
      setTimeout(() => boardEl.classList.remove('shake'), 400);
    }

    // Find captures
    const lettersToCapture = [];
    clearedLetters.forEach(({ letter, cell }) => {
      for (let i = 0; i < gameState.mysteryWord.length; i++) {
        if (!gameState.captured[i] && gameState.mysteryWord[i] === letter) {
          if (!lettersToCapture.some(c => c.slotIndex === i)) {
            lettersToCapture.push({ letter, cell, slotIndex: i });
            break;
          }
        }
      }
    });

    // Calculate and add score
    const points = calculateLineScore(totalLines, lettersToCapture.length);
    addScore(points);

    // Show message
    if (totalLines > 1) {
      showFlash(`${totalLines}x COMBO! +${points}`, true);
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    } else if (lettersToCapture.length > 0) {
      showFlash(`+${points}`);
    } else {
      showFlash(`+${points}`);
    }

    // Particles
    clearedLetters.forEach(({ cell }) => {
      if (cell) {
        const rect = cell.getBoundingClientRect();
        createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 6, '#a855f7');
      }
    });

    setTimeout(() => {
      // Clear grid
      rowsToClear.forEach(row => {
        for (let col = 0; col < GRID_SIZE; col++) {
          gameState.grid[row][col] = { letter: null, filled: false };
        }
      });
      colsToClear.forEach(col => {
        for (let row = 0; row < GRID_SIZE; row++) {
          gameState.grid[row][col] = { letter: null, filled: false };
        }
      });

      // Animate captures
      lettersToCapture.forEach(({ letter, cell, slotIndex }, index) => {
        setTimeout(() => animateCapture(letter, cell, slotIndex), index * 120);
      });

      // Update state
      lettersToCapture.forEach(({ slotIndex }) => {
        gameState.captured[slotIndex] = true;
      });
      updateNeededLetters(gameState.captured);

      // Apply gravity - blocks fall down
      const blocksMoved = applyGravity();
      renderBoard();

      // Add falling animation class to cells that moved
      if (blocksMoved) {
        document.querySelectorAll('.cell.filled').forEach(cell => {
          cell.classList.add('new');
        });
      }

      setTimeout(() => {
        renderMysteryWord();
        updateProgress();

        if (gameState.captured.every(c => c)) {
          gameState.won = true;
          gameState.gameOver = true;
          setTimeout(showWin, 400);
          return;
        }

        // Check for chain reactions after gravity
        if (blocksMoved) {
          setTimeout(() => checkChainReaction(), 200);
        } else {
          checkRefillPieces();
        }
      }, lettersToCapture.length * 120 + 150);

    }, 450);
  } else {
    // Reset streak when no lines cleared
    gameState.streak = 0;
    checkRefillPieces();
  }
}

// Handle chain reactions after gravity
function checkChainReaction() {
  const { rowsToClear, colsToClear } = findCompleteLines();

  if (rowsToClear.length === 0 && colsToClear.length === 0) {
    checkRefillPieces();
    return;
  }

  const totalLines = rowsToClear.length + colsToClear.length;
  gameState.linesCleared += totalLines;

  // Collect letters from cleared cells
  const clearedLetters = [];
  const clearedPositions = new Set();

  rowsToClear.forEach(row => {
    for (let col = 0; col < GRID_SIZE; col++) {
      const key = `${row}-${col}`;
      if (!clearedPositions.has(key)) {
        const letter = gameState.grid[row][col].letter;
        const cell = boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        clearedLetters.push({ letter, cell, row, col });
        clearedPositions.add(key);
        if (cell) cell.classList.add('clearing');
      }
    }
  });

  colsToClear.forEach(col => {
    for (let row = 0; row < GRID_SIZE; row++) {
      const key = `${row}-${col}`;
      if (!clearedPositions.has(key)) {
        const letter = gameState.grid[row][col].letter;
        const cell = boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        clearedLetters.push({ letter, cell, row, col });
        clearedPositions.add(key);
        if (cell) cell.classList.add('clearing');
      }
    }
  });

  // Find captures
  const lettersToCapture = [];
  clearedLetters.forEach(({ letter, cell }) => {
    for (let i = 0; i < gameState.mysteryWord.length; i++) {
      if (!gameState.captured[i] && gameState.mysteryWord[i] === letter) {
        if (!lettersToCapture.some(c => c.slotIndex === i)) {
          lettersToCapture.push({ letter, cell, slotIndex: i });
          break;
        }
      }
    }
  });

  // Chain bonus!
  const points = calculateLineScore(totalLines, lettersToCapture.length) * 2; // Double points for chains
  addScore(points);
  showFlash(`CHAIN! +${points}`, true);

  if (navigator.vibrate) navigator.vibrate([30, 20, 30, 20, 50]);
  boardEl.classList.add('shake');
  setTimeout(() => boardEl.classList.remove('shake'), 400);

  // Particles
  clearedLetters.forEach(({ cell }) => {
    if (cell) {
      const rect = cell.getBoundingClientRect();
      createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 8, '#f59e0b');
    }
  });

  setTimeout(() => {
    // Clear grid
    rowsToClear.forEach(row => {
      for (let col = 0; col < GRID_SIZE; col++) {
        gameState.grid[row][col] = { letter: null, filled: false };
      }
    });
    colsToClear.forEach(col => {
      for (let row = 0; row < GRID_SIZE; row++) {
        gameState.grid[row][col] = { letter: null, filled: false };
      }
    });

    // Animate captures
    lettersToCapture.forEach(({ letter, cell, slotIndex }, index) => {
      setTimeout(() => animateCapture(letter, cell, slotIndex), index * 120);
    });

    // Update state
    lettersToCapture.forEach(({ slotIndex }) => {
      gameState.captured[slotIndex] = true;
    });
    updateNeededLetters(gameState.captured);

    // Apply gravity again
    const blocksMoved = applyGravity();
    renderBoard();

    setTimeout(() => {
      renderMysteryWord();
      updateProgress();

      if (gameState.captured.every(c => c)) {
        gameState.won = true;
        gameState.gameOver = true;
        setTimeout(showWin, 400);
        return;
      }

      // Check for more chains
      if (blocksMoved) {
        setTimeout(() => checkChainReaction(), 200);
      } else {
        checkRefillPieces();
      }
    }, lettersToCapture.length * 120 + 150);

  }, 400);
}

function animateCapture(letter, fromCell, toSlotIndex) {
  const targetSlot = document.getElementById(`mystery-${toSlotIndex}`);
  if (!fromCell || !targetSlot) return;

  const fromRect = fromCell.getBoundingClientRect();
  const toRect = targetSlot.getBoundingClientRect();

  const flyingLetter = document.createElement('div');
  flyingLetter.className = 'flying-letter';
  flyingLetter.textContent = letter;
  flyingLetter.style.left = `${fromRect.left + fromRect.width / 2 - 18}px`;
  flyingLetter.style.top = `${fromRect.top + fromRect.height / 2 - 18}px`;

  captureContainer.appendChild(flyingLetter);

  // Particles at start
  createParticles(fromRect.left + fromRect.width / 2, fromRect.top + fromRect.height / 2, 8, '#a855f7');

  requestAnimationFrame(() => {
    flyingLetter.style.transition = 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
    flyingLetter.style.left = `${toRect.left + toRect.width / 2 - 18}px`;
    flyingLetter.style.top = `${toRect.top + toRect.height / 2 - 18}px`;
  });

  setTimeout(() => {
    flyingLetter.remove();
    // Particles at end
    createParticles(toRect.left + toRect.width / 2, toRect.top + toRect.height / 2, 10, '#6366f1');
    if (navigator.vibrate) navigator.vibrate(40);
  }, 450);
}

function showFlash(text, isCombo = false) {
  const flash = document.createElement('div');
  flash.className = 'clear-flash' + (isCombo ? ' combo' : '');
  flash.textContent = text;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1000);
}

function checkRefillPieces() {
  if (gameState.pieces.every(p => p === null)) {
    gameState.pieces = [generatePiece(), generatePiece(), generatePiece()];
    renderPieces();
  }

  setTimeout(checkGameOver, 100);
}

function checkGameOver() {
  if (gameState.gameOver) return;

  // Check if out of moves
  if (gameState.movesRemaining <= 0) {
    gameState.gameOver = true;
    setTimeout(() => showLose('out_of_moves'), 300);
    return;
  }

  const remainingPieces = gameState.pieces.filter(p => p !== null);

  for (const piece of remainingPieces) {
    // Try all 4 rotations
    let rotated = piece;
    for (let r = 0; r < 4; r++) {
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (canPlacePiece(rotated, row, col)) {
            return; // Can still play
          }
        }
      }
      rotated = rotatePiece(rotated);
    }
  }

  gameState.gameOver = true;
  setTimeout(() => showLose('no_space'), 300);
}

function showWin() {
  createConfetti();
  if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);

  modalTitle.textContent = 'Amazing!';
  modalMessage.textContent = `You found the word!`;
  modalStats.innerHTML = `
    <div class="modal-stat">
      <div class="modal-stat-value">${gameState.mysteryWord}</div>
      <div class="modal-stat-label">Word</div>
    </div>
    <div class="modal-stat">
      <div class="modal-stat-value">${gameState.score}</div>
      <div class="modal-stat-label">Score</div>
    </div>
    <div class="modal-stat">
      <div class="modal-stat-value">${gameState.linesCleared}</div>
      <div class="modal-stat-label">Lines</div>
    </div>
  `;
  showModal();
}

function showLose(reason = 'no_space') {
  const found = gameState.captured.filter(c => c).length;

  if (reason === 'out_of_moves') {
    modalTitle.textContent = 'Out of Moves!';
    modalMessage.textContent = `The word was "${gameState.mysteryWord}"`;
  } else {
    modalTitle.textContent = 'No Space Left!';
    modalMessage.textContent = `The word was "${gameState.mysteryWord}"`;
  }

  modalStats.innerHTML = `
    <div class="modal-stat">
      <div class="modal-stat-value">${found}/${gameState.mysteryWord.length}</div>
      <div class="modal-stat-label">Letters</div>
    </div>
    <div class="modal-stat">
      <div class="modal-stat-value">${gameState.score}</div>
      <div class="modal-stat-label">Score</div>
    </div>
    <div class="modal-stat">
      <div class="modal-stat-value">${gameState.linesCleared}</div>
      <div class="modal-stat-label">Lines</div>
    </div>
  `;
  showModal();
}

function showModal() {
  modal.classList.add('show');
}

function hideModal() {
  modal.classList.remove('show');
  helpModal.classList.remove('show');
}

// Event listeners
modalBtn.addEventListener('click', initGame);
helpBtn.addEventListener('click', () => helpModal.classList.add('show'));
helpCloseBtn.addEventListener('click', () => helpModal.classList.remove('show'));

document.addEventListener('click', (e) => {
  if (!e.target.closest('.piece') && !e.target.closest('.cell') && !e.target.closest('.modal-content')) {
    gameState.selectedPieceIndex = null;
    renderPieces();
    clearPreview();
  }
});

// Prevent double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd < 300) e.preventDefault();
  lastTouchEnd = now;
}, { passive: false });

// Start
initGame();
