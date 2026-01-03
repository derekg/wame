# WAME - Word + Game Collection

A casual word puzzle game built with pure HTML/CSS/JS. Mobile-first, no frameworks, no build tools.

## Project Structure

```
wame/
├── verbra/          # Block puzzle + word collection game
│   ├── index.html   # Main HTML structure
│   ├── style.css    # Styling + animations
│   ├── game.js      # Core game logic
│   ├── pieces.js    # Tetromino piece definitions
│   └── words.js     # Word dictionary
│
├── AGENTS.md        # This file
└── README.md        # Project readme
```

## Tech Stack

- **Pure HTML/CSS/JS** - No frameworks, no build step
- **Mobile-first** - Touch controls, responsive design
- **No backend** - All client-side, uses localStorage for persistence

## Games

### Verbra
A block puzzle game combined with word collection.

**Gameplay:**
1. Drag letter-covered tetromino pieces onto a 6x6 grid
2. Tap a piece to rotate it 90°
3. Fill complete rows or columns to clear them
4. Cleared letters matching the mystery word are captured
5. Win by capturing all mystery word letters
6. Lose when no pieces can be placed

**Key Files:**
- `game.js` - Game state, rendering, drag/drop, line clearing, win/lose logic
- `pieces.js` - Tetromino shapes, letter generation (45% bias toward mystery word letters)
- `words.js` - WORD_LIST (valid words), MYSTERY_WORDS (guessable 5-6 letter words)
- `style.css` - Purple gradient theme, animations (confetti, particles, flying letters)

**localStorage Keys:**
- `verbra_played` - First play detection (shows help modal)

## Code Patterns

### Game State
```javascript
const gameState = {
  grid: [],              // 6x6 array of {letter, filled}
  mysteryWord: '',       // Current mystery word (uppercase)
  captured: [],          // Boolean array tracking captured letters
  pieces: [],            // Current 3 available pieces
  selectedPieceIndex: null,
  gameOver: false,
  won: false,
  linesCleared: 0,
  score: 0,              // Current score
  streak: 0              // Consecutive turns with line clears
};
```

### Piece Structure
```javascript
{
  name: 'T',                          // Shape name
  cells: [[0,0], [0,1], [0,2], [1,1]], // Relative positions
  width: 3,
  height: 2,
  letters: ['A', 'B', 'C', 'D'],      // One letter per cell
  id: 'abc123'                        // Unique ID
}
```

### Adding New Games

1. Create a new folder (e.g., `newgame/`)
2. Copy the file structure from `verbra/`
3. Modify mechanics as needed
4. Keep the mobile-first, no-framework approach

## Style Guidelines

- **Colors:** Purple gradient theme (`#a855f7`, `#6366f1`, `#3b82f6`)
- **Animations:** Use CSS keyframes, cubic-bezier for snappy feel
- **Touch:** Large tap targets, prevent double-tap zoom, haptic feedback
- **Fonts:** System fonts (`-apple-system, BlinkMacSystemFont, 'Segoe UI'`)

## Testing

Open `index.html` directly in browser. No build step needed.

```bash
open verbra/index.html
```

## Future Ideas

- Daily challenge mode with shareable results
- Sound effects
- More game variants (see game ideas in plan history)
- Leaderboards (would require backend)
