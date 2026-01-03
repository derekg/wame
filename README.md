# WAME - Word + Game Collection

A collection of casual word puzzle games built with pure HTML/CSS/JS. Mobile-first, no frameworks, no build tools.

## Play Now

**[Play Verbra](https://derekg.github.io/wame/verbra/)** - Block puzzle meets word game

## Games

### Verbra

A satisfying block puzzle game combined with word discovery.

**Gameplay:**
1. Drag tetromino-style letter blocks onto a 6x6 grid
2. Tap any piece to rotate it 90 degrees
3. Fill complete rows or columns to clear them
4. Cleared letters matching the mystery word get captured
5. Capture all letters to reveal the mystery word and win!
6. Game over when no pieces can be placed

**Features:**
- Touch-optimized drag and drop with floating preview
- Minimal Mono theme with coral accents
- Progressive difficulty with level system
- Move limit and gravity mechanics with chain reactions
- Combo system for clearing multiple lines at once
- Streak bonuses for consecutive clears
- Clean victory burst animation
- 500+ mystery words ranging from 5-7 letters
- Haptic feedback on supported devices

## Tech Stack

- **Pure HTML/CSS/JS** - No frameworks, no build step
- **Mobile-first** - Touch controls, responsive design
- **No backend** - All client-side, uses localStorage

## Local Development

Just open the HTML file directly in your browser:

```bash
open verbra/index.html
```

Or use any local server:

```bash
python -m http.server 8000
# Then visit http://localhost:8000/verbra/
```

## Project Structure

```
wame/
├── verbra/          # Block puzzle + word game
│   ├── index.html   # Main HTML structure
│   ├── style.css    # Styling + animations
│   ├── game.js      # Core game logic
│   ├── pieces.js    # Tetromino piece definitions
│   └── words.js     # Word dictionary
├── AGENTS.md        # Developer documentation
└── README.md        # This file
```

## License

MIT
