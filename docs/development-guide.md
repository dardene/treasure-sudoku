# Treasure Sudoku: Developer Guide for Lauren

> **The Lost Relics of Solara** — from prototype to published app.
>
> You've already built a LOT. This guide picks up where your prototype leaves off
> and walks you through the remaining steps to turn it into a polished, published app.
> Every command, every concept, every decision is explained.
> You've got this.

---

## Where You Are Now — Prototype Inventory

Your prototype (`beta/treasure-sudoku-v3.html`) is a fully playable game with an impressive amount of features already working. Here's what you've built:

### Already Working

| Feature | Status | Notes |
|---------|--------|-------|
| Sudoku engine (generate + validate) | Working | Backtracking solver, shuffled generation |
| 9 custom SVG treasure artifacts | Working | Crown, Ruby, Emerald, Sapphire, Compass, Coin, Chalice, Key, Idol |
| Puzzle Mode (4 difficulties) | Working | Easy, Medium, Hard, Expert with cell removal |
| Cell selection + row/col/box highlighting | Working | With relic matching (same artifact glow) |
| Number pad with artifact icons | Working | Includes used-up tracking and active relic state |
| Notes mode (pencil marks) | Working | Mini artifact grid per cell |
| Undo, Erase, Hints (3 per game) | Working | Full undo stack with note restoration |
| Mistake tracking (3 strikes) | Working | Visual dot indicators |
| Score & streak system | Working | Points with streak multiplier |
| Timer + best time tracking | Working | Per-difficulty best times |
| Correct/wrong placement animations | Working | Sparkles, particles, shake, red glow |
| Win overlay + coin rain | Working | Gold celebration effect |
| Daily Puzzle Mode | Working | Date-seeded, draw-hand mechanic, 5 lives |
| Daily scoring (row/col/box bonuses) | Working | +400/+400/+300 completion bonuses |
| Perfect set bonus (+500) | Working | Reward for using all 5 hand cards |
| Treasure chest opening animation | Working | Multi-stage: particles, shake, burst, gold rays |
| Daily inspirational quotes | Working | Claude API + fallback pool |
| Leaderboard | Working | localStorage + Claude API competitor generation |
| Treasure Vault | Working | Best times, win counts, artifact collection |
| Settings panel | Working | Sound, particles, highlighting, errors toggles |
| Keyboard controls | Working | 1-9, arrows, Ctrl+Z, N, Backspace |
| Tropical beach environment | Working | Sky, clouds, ocean waves, sand, palm trees, pirate ship |
| Ambient particle system | Working | Floating colored particles |
| Screen routing with transitions | Working | Menu → Puzzle/Daily/Vault/Settings |

### What Still Needs Work

| Issue | Priority | Why It Matters |
|-------|----------|---------------|
| **No unique-solution guarantee** | CRITICAL | Puzzles can have multiple solutions — unfair for a paid game |
| **No persistent state** | CRITICAL | Closing the browser loses all progress, best times, and vault data |
| **Monolithic architecture** | HIGH | One 2500-line file makes changes risky and testing impossible |
| **No real backend** | HIGH | Leaderboard is localStorage only, can't compete with others |
| **API key exposed in client** | HIGH | Claude API calls from browser would expose your secret key |
| **No sound effects** | MEDIUM | Settings toggle exists, but no audio files connected |
| **DOM-based particles** | MEDIUM | Could be slow on older phones; Canvas/WebGL would be faster |
| **No mobile wrapper** | HIGH | Can't submit to App Store / Google Play without native shell |
| **No tests** | HIGH | No way to verify puzzles are fair without manual play |
| **No monetization** | LATER | No in-app purchases or payment integration |
| **No app store assets** | LATER | No icon, screenshots, or descriptions |

---

## Table of Contents

1. [Before You Start — Setting Up Your Computer](#1-before-you-start)
2. [Phase 1 — Fix the Puzzle Engine (Unique Solutions)](#2-phase-1-fix-engine)
3. [Phase 2 — Add Persistent State (Save Progress)](#3-phase-2-persistent-state)
4. [Phase 3 — Break Up the Monolith (Modular Architecture)](#4-phase-3-modular)
5. [Phase 4 — Add Sound & Upgrade Particles](#5-phase-4-polish)
6. [Phase 5 — Mobile Wrapper & Touch Controls](#6-phase-5-mobile)
7. [Phase 6 — Real Backend & Leaderboards](#7-phase-6-backend)
8. [Phase 7 — Monetization & App Store](#8-phase-7-monetization)
9. [Key Concepts Glossary](#9-glossary)
10. [Resources & Learning Links](#10-resources)

---

## 1. Before You Start — Setting Up Your Computer <a name="1-before-you-start"></a>

Before writing any code, you need a few tools installed. Think of these as your workbench.

### 1.1 Install Node.js

Node.js lets you run JavaScript outside a browser. It also comes with **npm** (Node Package Manager), which installs libraries other people have written so you don't have to build everything yourself.

```bash
# Check if you already have it
node --version    # Should show v18 or higher
npm --version     # Should show v9 or higher
```

If not installed, download from: https://nodejs.org (choose the **LTS** version).

### 1.2 Install a Code Editor

If you don't already have one, download **VS Code**: https://code.visualstudio.com

Recommended extensions to install (click the Extensions icon in the left sidebar):
- **ESLint** — catches mistakes in your code as you type
- **Prettier** — auto-formats your code so it looks clean
- **TypeScript + JavaScript** — already built in, but good to verify

### 1.3 Install Git

Git tracks changes to your code so you can undo mistakes and collaborate.

```bash
# Check if installed
git --version

# If not, install:
# macOS: It usually comes pre-installed. If not:
xcode-select --install
```

### 1.4 Create a GitHub Account

Go to https://github.com and sign up if you haven't. This is where your code will live online (like Google Drive for code).

---

## 2. Phase 1 — Fix the Puzzle Engine (Unique Solutions) <a name="2-phase-1-fix-engine"></a>

**Goal:** Make sure every puzzle has EXACTLY one solution. This is the most important fix in the entire project.

**Why this matters:** Right now, your `generatePuzzle` function removes random cells without checking if the puzzle still has only one answer. This means a player could find a "correct" solution that's different from what the game expects — and the game would mark them wrong. For a paid app, this destroys trust instantly.

### 2.1 The Problem in Your Current Code

Look at your current generator (around line 1381 in the prototype):

```javascript
// CURRENT CODE — has a bug!
function generatePuzzle(diff){
  const sol=generateSolution(),puz=[...sol];
  const indices=shuffle([...Array(81).keys()]);
  for(let i=0;i<DIFF_REMOVE[diff];i++)puz[indices[i]]=0;  // Just removes cells randomly!
  return{puzzle:puz,solution:sol};
}
```

The problem: it removes cells without checking if the puzzle can now be solved in multiple ways.

### 2.2 The Fix — Add a Solution Counter

You need a function that counts how many valid solutions a puzzle has. If removing a cell creates more than one solution, put the cell back and try a different one.

Add this function to your code, right after the existing `generateSolution` function:

```javascript
/**
 * Count how many solutions a puzzle has.
 * We stop counting at 2 — that's enough to know it's bad.
 *
 * HOW IT WORKS (plain English):
 * It's the same backtracking solver, but instead of stopping at the
 * first solution, it keeps going to find a second one. If it finds
 * two, we know the puzzle is ambiguous and needs more clues.
 */
function countSolutions(puzzle, limit) {
  limit = limit || 2;
  var count = 0;
  var grid = puzzle.slice();  // Make a copy

  function valid(pos, num) {
    var r = Math.floor(pos / 9), c = pos % 9;
    for (var i = 0; i < 9; i++) {
      if (grid[r * 9 + i] === num) return false;
      if (grid[i * 9 + c] === num) return false;
    }
    var br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
    for (var dr = 0; dr < 3; dr++)
      for (var dc = 0; dc < 3; dc++)
        if (grid[(br + dr) * 9 + (bc + dc)] === num) return false;
    return true;
  }

  function solve(pos) {
    if (count >= limit) return;  // Stop early — already found too many
    if (pos === 81) { count++; return; }
    if (grid[pos] !== 0) { solve(pos + 1); return; }
    for (var n = 1; n <= 9; n++) {
      if (valid(pos, n)) {
        grid[pos] = n;
        solve(pos + 1);
        grid[pos] = 0;
      }
    }
  }

  solve(0);
  return count;
}
```

> **What is this doing?** Imagine you have a jigsaw puzzle with 50 pieces. This function tries to complete the puzzle and counts how many different ways it can be finished. A good Sudoku puzzle should only have ONE way to complete it.

### 2.3 Replace the Generator

Replace your `generatePuzzle` function with this improved version:

```javascript
/**
 * Generate a puzzle that has EXACTLY one solution.
 *
 * Strategy: Remove cells one at a time, in random order.
 * After each removal, check if the puzzle still has only one solution.
 * If removing a cell creates multiple solutions, put it back and skip it.
 */
function generatePuzzle(diff) {
  var sol = generateSolution();
  var puz = sol.slice();  // Copy the solution

  var indices = shuffle([...Array(81).keys()]);  // Random order
  var removed = 0;
  var target = DIFF_REMOVE[diff];

  for (var i = 0; i < indices.length && removed < target; i++) {
    var idx = indices[i];
    var backup = puz[idx];
    puz[idx] = 0;  // Try removing this cell

    if (countSolutions(puz) !== 1) {
      // Removing this cell created ambiguity — put it back!
      puz[idx] = backup;
    } else {
      removed++;  // This removal is safe
    }
  }

  return { puzzle: puz, solution: sol };
}
```

> **Important:** Do the same fix for `generateDailyPuzzle` — it has the same bug. Replace the cell-removal section (around line 1429-1430) with the same check-after-each-removal logic.

### 2.4 Fix the Daily Puzzle Generator Too

In your `generateDailyPuzzle` function, replace the simple removal loop:

```javascript
// OLD (around line 1428-1430):
const idxs=shuffleS([...Array(81).keys()]);
for(let i=0;i<diff.removes;i++)puz[idxs[i]]=0;

// NEW:
const idxs = shuffleS([...Array(81).keys()]);
let removed = 0;
for (let i = 0; i < idxs.length && removed < diff.removes; i++) {
  const backup = puz[idxs[i]];
  puz[idxs[i]] = 0;
  if (countSolutions(puz) !== 1) {
    puz[idxs[i]] = backup;  // Put it back — creates ambiguity
  } else {
    removed++;
  }
}
```

### 2.5 Test It

Open your game in the browser and check the console:

```javascript
// Paste this in the browser console (F12 → Console tab) to test:
(function testPuzzles() {
  var passes = 0, fails = 0;
  for (var i = 0; i < 20; i++) {
    var result = generatePuzzle('easy');
    var solutions = countSolutions(result.puzzle, 3);
    if (solutions === 1) passes++;
    else { fails++; console.error('FAIL: puzzle has', solutions, 'solutions'); }
  }
  console.log(passes + '/20 puzzles have exactly 1 solution. Fails: ' + fails);
})();
```

All 20 should pass. If any fail, something went wrong in the fix.

> **Note:** This will make puzzle generation a bit slower (maybe 0.5-2 seconds instead of instant) because it has to check uniqueness after every cell removal. That's fine — you'll only notice it when starting a new game, and correctness is more important than speed.

### Checklist — Phase 1
- [ ] `countSolutions()` function added
- [ ] `generatePuzzle()` updated to verify unique solutions
- [ ] `generateDailyPuzzle()` updated with same fix
- [ ] Console test passes (20/20 puzzles have exactly 1 solution)
- [ ] Game still plays normally after the change

---

## 3. Phase 2 — Add Persistent State (Save Progress) <a name="3-phase-2-persistent-state"></a>

**Goal:** Save the player's progress so they don't lose their game, best times, or vault data when they close the browser.

**Why this matters:** Right now, if you close the tab, everything resets. Best times gone. Vault data gone. Mid-game progress gone. Players will rage-quit your app and leave a 1-star review.

### 3.1 What Needs Saving

Your prototype has several pieces of state that should persist:

| Data | Variable | Where It Lives Now |
|------|----------|-------------------|
| Best times per difficulty | `BEST_TIMES` | In-memory only — lost on refresh |
| Win counts, artifact counts | `GAME_STATS` | In-memory only — lost on refresh |
| Settings (sound, particles, etc.) | `SETTINGS` | In-memory only — lost on refresh |
| Current puzzle progress | `PZ` / `DP` objects | In-memory only — lost on refresh |

### 3.2 The Simplest Fix — localStorage

`localStorage` is a built-in browser feature that saves data as text, even after you close the tab. It's like a tiny file on your computer that your website can read and write.

Add these helper functions near the top of your `<script>` section (after the `ARTIFACTS` definition):

```javascript
/* ══════════════════════════════════════════════════════
   PERSISTENT STORAGE
══════════════════════════════════════════════════════ */
const STORAGE_KEY = 'treasure_sudoku_save';

function saveState() {
  try {
    var data = {
      bestTimes: BEST_TIMES,
      gameStats: GAME_STATS,
      settings: SETTINGS,
      savedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}

function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    var data = JSON.parse(raw);

    // Restore best times
    if (data.bestTimes) {
      Object.keys(data.bestTimes).forEach(function(k) {
        BEST_TIMES[k] = data.bestTimes[k];
      });
    }

    // Restore game stats
    if (data.gameStats) {
      Object.keys(data.gameStats).forEach(function(k) {
        GAME_STATS[k] = data.gameStats[k];
      });
    }

    // Restore settings
    if (data.settings) {
      Object.keys(data.settings).forEach(function(k) {
        SETTINGS[k] = data.settings[k];
      });
      // Update toggle buttons to match loaded settings
      document.getElementById('set-sound').classList.toggle('on', SETTINGS.sound);
      document.getElementById('set-particles').classList.toggle('on', SETTINGS.particles);
      document.getElementById('set-highlight').classList.toggle('on', SETTINGS.highlight);
      document.getElementById('set-errors').classList.toggle('on', SETTINGS.showErrors);
    }
  } catch (e) {
    console.warn('Could not load state:', e);
  }
}
```

### 3.3 Call These Functions at the Right Times

**Load on startup** — add this at the very end of your script, after all the event listeners:

```javascript
// Load saved state when the page opens
loadState();
```

**Save after important events** — add `saveState()` calls to:

```javascript
// After winning a puzzle:
function pzCheckWin(){
  if(!PZ.board.every((v,i)=>v!==0&&v===PZ.solution[i]))return;
  clearInterval(PZ.timerInterval);GAME_STATS.puzzleWins++;
  // ... (existing win logic) ...
  saveState();  // ADD THIS LINE
}

// After winning a daily puzzle:
function dpCheckWin(){
  // ... (existing win logic) ...
  saveState();  // ADD THIS LINE
}

// After changing settings:
document.querySelectorAll('.toggle-btn').forEach(btn=>{
  btn.addEventListener('click',function(){
    // ... (existing toggle logic) ...
    saveState();  // ADD THIS LINE
  });
});

// After resetting records:
document.getElementById('reset-records').addEventListener('click',()=>{
  // ... (existing reset logic) ...
  saveState();  // ADD THIS LINE
});
```

### 3.4 Optional: Save Puzzle Progress Mid-Game

If you want players to resume an in-progress puzzle after closing the browser, you can save the `PZ` and `DP` objects too. This is more complex because those objects contain `Set` types (for notes) that don't serialize to JSON directly:

```javascript
// Convert a notes array (of Sets) to a serializable format
function serializeNotes(notes) {
  return notes.map(function(s) { return Array.from(s); });
}

// Convert back from arrays to Sets
function deserializeNotes(arrays) {
  return arrays.map(function(a) { return new Set(a); });
}
```

> **Recommendation:** Start with just saving best times, stats, and settings. Add mid-game saving later — it adds complexity and the game is playable without it.

### Checklist — Phase 2
- [ ] `saveState()` and `loadState()` functions added
- [ ] State loads on page open (best times, stats, settings)
- [ ] State saves after each puzzle win
- [ ] State saves after settings changes
- [ ] State saves after record reset
- [ ] Test: win a puzzle, close the tab, reopen — best time is still there
- [ ] Test: change settings, reload — settings are preserved

---

## 4. Phase 3 — Break Up the Monolith (Modular Architecture) <a name="4-phase-3-modular"></a>

**Goal:** Split your single 2500-line HTML file into organized modules that are easier to work with, test, and extend.

**Why this matters:** Right now, everything is in one file. If you want to change how particles work, you have to scroll past the Sudoku engine, the leaderboard, the vault, etc. When files are small and focused, bugs are easier to find and new features are easier to add.

> **Important note:** This phase is a BIG change. You don't have to do it all at once. You can continue improving the prototype as a single file (Phases 1 and 2 work fine in the prototype). Do this phase when you're ready to take the game to the next level.

### 4.1 Create the React + TypeScript Project

```bash
cd ~/Lauren-Claude/games/treasure-sudoku

# Create a new React + TypeScript project using Vite
npm create vite@latest app -- --template react-ts
cd app
npm install
```

> **What just happened?** `Vite` (pronounced "veet") created a starter project inside an `app/` folder. It set up React (the UI library), TypeScript (JavaScript with type checking), and a dev server that auto-refreshes when you change code.

```bash
npm run dev
```

Open the URL it shows (usually http://localhost:5173) in your browser to verify it works.

### 4.2 The New File Structure

You'll migrate your prototype code into this structure:

```
app/
├── src/
│   ├── engine/                ← Sudoku logic (from your prototype)
│   │   ├── types.ts           ← Data shapes (Grid, Difficulty, etc.)
│   │   ├── validator.ts       ← isValidPlacement, isGridComplete
│   │   ├── solver.ts          ← solve, countSolutions
│   │   ├── generator.ts       ← generatePuzzle, generateDailyPuzzle
│   │   └── engine.test.ts     ← Tests for the engine
│   ├── components/            ← UI pieces
│   │   ├── Board.tsx          ← The 9x9 grid
│   │   ├── Cell.tsx           ← A single cell
│   │   ├── NumberPad.tsx      ← The artifact input buttons
│   │   ├── GameHeader.tsx     ← Timer, score, mistakes
│   │   ├── ToolBar.tsx        ← Undo, erase, notes, hint buttons
│   │   ├── Hand.tsx           ← Daily mode draw-hand cards
│   │   ├── WinOverlay.tsx     ← Victory screen
│   │   ├── Vault.tsx          ← Treasure vault screen
│   │   └── Settings.tsx       ← Settings toggles
│   ├── screens/               ← Full-page views
│   │   ├── MenuScreen.tsx     ← Main menu
│   │   ├── PuzzleScreen.tsx   ← Puzzle mode
│   │   └── DailyScreen.tsx    ← Daily challenge mode
│   ├── state/                 ← State management
│   │   └── gameStore.ts       ← Zustand store (replaces PZ/DP/GAME_STATS)
│   ├── assets/                ← Art and sounds
│   │   ├── artifacts.ts       ← Your 9 SVG artifact definitions
│   │   └── sounds/            ← Audio files
│   ├── utils/                 ← Small helpers
│   │   ├── audio.ts           ← Sound playback
│   │   ├── particles.ts       ← Particle effects
│   │   └── storage.ts         ← localStorage helpers
│   └── App.tsx                ← Root component + screen routing
```

### 4.3 Migration Strategy — Piece by Piece

Don't try to migrate everything at once. Do it in this order:

**Step 1: Move the engine** (easiest, no UI involved)
- Copy `generateSolution`, `generatePuzzle`, `countSolutions`, etc. into `engine/` files
- Add TypeScript types
- Write tests to verify they produce the same results

**Step 2: Move the artifacts**
- Copy the `ARTIFACTS` object (SVG definitions, names, glow colors) into `assets/artifacts.ts`
- Export it so other files can import it

**Step 3: Move the state**
- Install Zustand: `npm install zustand`
- Create a store that replaces the `PZ`, `DP`, `GAME_STATS`, `BEST_TIMES`, and `SETTINGS` global variables
- Add localStorage persistence using Zustand's `persist` middleware

**Step 4: Build components one at a time**
- Start with `Cell.tsx` — the simplest UI unit
- Then `Board.tsx` — renders 81 cells
- Then `NumberPad.tsx` — the 9 artifact buttons
- Then `GameHeader.tsx` and `ToolBar.tsx`
- Then `PuzzleScreen.tsx` — assembles the pieces
- Then tackle `DailyScreen.tsx`, `Vault.tsx`, `Settings.tsx`, `MenuScreen.tsx`

> **Tip:** At each step, run `npm run dev` and compare with your prototype. The game should look and play the same — you're just reorganizing, not redesigning.

### 4.4 Example: Moving the Engine to TypeScript

Here's how `engine/types.ts` would look, based on your prototype:

```typescript
// A Sudoku grid as a flat array of 81 numbers (0 means empty)
// This matches your prototype's format: grid[row * 9 + col]
export type FlatGrid = number[];

// Difficulty levels — matching your prototype's DIFF_REMOVE
export type Difficulty = "easy" | "medium" | "hard" | "expert";

export const CELLS_TO_REMOVE: Record<Difficulty, number> = {
  easy: 30,
  medium: 40,
  hard: 50,
  expert: 58,
};

// Daily difficulty definitions — matching your prototype
export type DailyDifficulty = {
  name: string;
  emoji: string;
  removes: number;
  color: string;
};

export const DAILY_DIFFS: DailyDifficulty[] = [
  { name: "Easy", emoji: "⛵", removes: 28, color: "#50d890" },
  { name: "Medium", emoji: "⚓", removes: 38, color: "#f5c842" },
  { name: "Hard", emoji: "💀", removes: 50, color: "#ff8060" },
];
```

> **What is TypeScript?** It's JavaScript with labels. `type FlatGrid = number[]` tells TypeScript (and you!) that a FlatGrid is always an array of numbers. If you accidentally try to put a string in there, it'll warn you before you even run the code.

### 4.5 Testing the Engine

Install the test runner and create tests to make sure the engine works correctly after migration:

```bash
npm install -D vitest
```

Create `src/engine/engine.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { generatePuzzle } from "./generator";
import { countSolutions } from "./solver";

describe("Sudoku Engine", () => {
  it("generates puzzles with exactly one solution", () => {
    for (let i = 0; i < 10; i++) {
      const { puzzle } = generatePuzzle("easy");
      expect(countSolutions(puzzle)).toBe(1);
    }
  });

  it("solution matches puzzle clues", () => {
    const { puzzle, solution } = generatePuzzle("medium");
    for (let i = 0; i < 81; i++) {
      if (puzzle[i] !== 0) {
        expect(puzzle[i]).toBe(solution[i]);
      }
    }
  });

  it("puzzle has the right number of empty cells", () => {
    const { puzzle } = generatePuzzle("hard");
    const emptyCells = puzzle.filter((v) => v === 0).length;
    // Should be close to 50 (CELLS_TO_REMOVE for hard)
    // Might be slightly less if some removals were blocked by uniqueness check
    expect(emptyCells).toBeGreaterThanOrEqual(40);
    expect(emptyCells).toBeLessThanOrEqual(50);
  });
});
```

Run with: `npx vitest run`

> **What is a test?** It's code that checks your other code. Instead of manually playing the game to check if puzzles work, the computer checks thousands of puzzles in seconds. If you break something later, the tests will catch it.

### Checklist — Phase 3
- [ ] React + TypeScript project created in `app/` folder
- [ ] Engine migrated and tests pass
- [ ] Artifact SVGs moved to `assets/artifacts.ts`
- [ ] State management set up with Zustand + localStorage persistence
- [ ] Board, Cell, NumberPad components built
- [ ] Puzzle mode fully working in the new app
- [ ] Daily mode fully working in the new app
- [ ] Vault and Settings screens working
- [ ] Visual comparison: new app looks the same as prototype

---

## 5. Phase 4 — Add Sound & Upgrade Particles <a name="5-phase-4-polish"></a>

**Goal:** Connect the sound toggle to actual audio, and optionally upgrade particles for better mobile performance.

### 5.1 Add Sound Effects

Your prototype already has a `SETTINGS.sound` toggle — it just doesn't play any sounds yet. You need audio files for:

| Sound | When It Plays | Where to Find |
|-------|---------------|---------------|
| Cell tap | Player selects a cell | https://freesound.org — search "tap" or "click" |
| Correct placement | Artifact placed correctly | Search "chime" or "success" |
| Wrong placement | Artifact placed wrong | Search "error" or "buzz" |
| Puzzle complete | Victory! | Search "fanfare" or "victory" |
| Hint used | Hint button pressed | Search "magic" or "sparkle" |
| Draw hand | New hand drawn in daily mode | Search "card deal" or "whoosh" |

Download small MP3 files (under 100KB each) and save them in `assets/audio/`.

**Simple audio player (works in the single-file prototype too):**

```javascript
// Add this near the top of your script
const SOUNDS = {
  tap: new Audio('assets/audio/tap.mp3'),
  correct: new Audio('assets/audio/correct.mp3'),
  wrong: new Audio('assets/audio/wrong.mp3'),
  victory: new Audio('assets/audio/victory.mp3'),
  hint: new Audio('assets/audio/hint.mp3'),
  draw: new Audio('assets/audio/draw.mp3'),
};

function playSound(name) {
  if (!SETTINGS.sound) return;
  var sound = SOUNDS[name];
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(function() {});  // Ignore autoplay errors
}
```

Then sprinkle `playSound(...)` calls into your existing code:
- `pzSelectCell` → `playSound('tap')`
- Correct placement in `pzPlace` → `playSound('correct')`
- Wrong placement in `pzPlace` → `playSound('wrong')`
- `pzCheckWin` → `playSound('victory')`
- `pzHint` → `playSound('hint')`

### 5.2 Upgrade Particles (Optional, for Performance)

Your current particle system creates DOM elements (`<div>`) for each particle and animates them with CSS. This works fine on desktop but can stutter on older phones because each DOM element is expensive to render.

**If particles feel slow on a phone,** you can upgrade to a Canvas-based system:

```javascript
// Instead of creating <div> elements, draw circles on a <canvas>
var canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:200;';
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');
var particles = [];

function addParticle(x, y, color) {
  particles.push({
    x: x, y: y,
    vx: (Math.random() - 0.5) * 4,
    vy: -2 - Math.random() * 3,
    life: 1,           // 1 = full, 0 = dead
    decay: 0.02 + Math.random() * 0.02,
    size: 3 + Math.random() * 4,
    color: color
  });
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(function(p) { return p.life > 0; });
  particles.forEach(function(p) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;  // Gravity
    p.life -= p.decay;
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();
```

> **Recommendation:** Don't bother with this until you're testing on actual phones. Your current DOM particles might be perfectly fine.

### Checklist — Phase 4
- [ ] Audio files downloaded and placed in `assets/audio/`
- [ ] `playSound()` function added
- [ ] Sound plays on correct/wrong placement, victory, hint, cell tap
- [ ] Sound respects the Settings toggle
- [ ] (Optional) Canvas particle system replaces DOM particles
- [ ] Test on a phone — particles run at smooth 60fps

---

## 6. Phase 5 — Mobile Wrapper & Touch Controls <a name="6-phase-5-mobile"></a>

**Goal:** Wrap the web app so it can be installed on a phone and submitted to the App Store / Google Play.

### 6.1 Install Capacitor

Capacitor wraps your web app in a native shell so it can be submitted to app stores.

```bash
cd ~/Lauren-Claude/games/treasure-sudoku/app
npm install @capacitor/core @capacitor/cli
npx cap init "Treasure Sudoku" com.lauren.treasuresudoku

# Add platforms
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

> **What is Capacitor?** Think of it like putting your website inside a picture frame. The website (your game) is the picture, and the frame (Capacitor) is the native app shell that lets it run on phones and access phone features like haptics and notifications.

### 6.2 Build and Run on a Simulator

```bash
# Build the web app first
npm run build

# Copy the build into the native project
npx cap sync

# Open in Xcode (for iOS simulator)
npx cap open ios

# Or Android Studio (for Android emulator)
npx cap open android
```

### 6.3 Touch Optimization

Your prototype already has some good mobile practices (responsive sizing with `clamp()`, `min()`, etc.), but a few things to improve:

**Minimum tap target: 44x44 points** — Apple's Human Interface Guidelines require this. Check your:
- Number pad buttons (currently using `aspect-ratio: 1` — should be fine if container is wide enough)
- Action buttons (undo, erase, notes, hint) — currently `max-width: 90px; padding: 6px` — might be too small
- Daily hand cards — currently `width: 36px; height: 36px` — **too small!** Increase to at least 44x44

**Safe areas** — account for the iPhone notch/Dynamic Island and Android gesture bar:

```css
/* Add to your body or main container */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

**Touch gestures to consider:**
- Swipe left on a cell to erase
- Long-press a cell to toggle notes mode
- Double-tap a cell to deselect

### 6.4 Add Haptic Feedback

```bash
npm install @capacitor/haptics
npx cap sync
```

```javascript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// On cell selection — light tap
Haptics.impact({ style: ImpactStyle.Light });

// On correct placement — medium thud
Haptics.impact({ style: ImpactStyle.Medium });

// On puzzle completion — success pattern
Haptics.notification({ type: 'SUCCESS' });

// On wrong placement — error buzz
Haptics.notification({ type: 'ERROR' });
```

### Checklist — Phase 5
- [ ] Capacitor project initialized
- [ ] App runs in iOS Simulator
- [ ] App runs in Android Emulator
- [ ] Touch targets are 44x44pt minimum (especially hand cards and action buttons)
- [ ] Safe areas respected (no content hidden behind notch)
- [ ] Haptic feedback on interactions
- [ ] Game plays well with thumb on bottom half of screen

---

## 7. Phase 6 — Real Backend & Leaderboards <a name="7-phase-6-backend"></a>

**Goal:** Replace localStorage leaderboards with a real server so players compete against each other. Remove the client-side Claude API calls (security risk).

**Why this matters:** Right now your leaderboard is localStorage + fake competitors generated by Claude API. Two problems: (1) players only compete against themselves, and (2) the Claude API key would need to be embedded in the client, which anyone can steal.

### 7.1 Set Up Supabase

1. Go to https://supabase.com and create a free account
2. Create a new project called "treasure-sudoku"
3. Save your **project URL** and **anon key**

```bash
npm install @supabase/supabase-js
```

> **Important:** Never put API keys directly in your code! Use environment variables. Create a `.env` file and add it to `.gitignore`:
> ```
> VITE_SUPABASE_URL=your_url_here
> VITE_SUPABASE_ANON_KEY=your_key_here
> ```

### 7.2 Database Tables

Create these tables in the Supabase dashboard (SQL Editor):

```sql
-- Daily puzzles — one per day, same for everyone
CREATE TABLE daily_puzzles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date UNIQUE NOT NULL,
  puzzle jsonb NOT NULL,
  solution jsonb NOT NULL,
  difficulty text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Leaderboard entries
CREATE TABLE leaderboard_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  display_name text NOT NULL,
  puzzle_date date NOT NULL,
  score integer NOT NULL,
  solve_time_seconds integer NOT NULL,
  mistakes integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, puzzle_date)  -- One entry per player per day
);
```

### 7.3 Move Quote Generation Server-Side

Instead of calling the Claude API from the browser (which exposes your API key), create a Supabase Edge Function:

```bash
# In your Supabase project:
supabase functions new daily-quote
```

This runs on Supabase's servers, so the API key stays secret. Your app just calls a URL to get the quote.

### 7.4 Remove Client-Side API Calls

Delete the `fetch('https://api.anthropic.com/...')` calls from your client code (the `fetchDailyQuote` function around line 1669 and the `lbSubmitScore` function around line 1269). Replace them with calls to your Supabase endpoints.

### Checklist — Phase 6
- [ ] Supabase project created
- [ ] Database tables set up
- [ ] User authentication working (anonymous or email)
- [ ] Daily puzzles stored server-side
- [ ] Leaderboard writes to Supabase (real competitors!)
- [ ] Claude API calls moved to server-side Edge Functions
- [ ] No API keys in client code
- [ ] Works offline (cached puzzle, syncs when back online)

---

## 8. Phase 7 — Monetization & App Store <a name="8-phase-7-monetization"></a>

**Goal:** Add in-app purchases and submit to the App Store and Google Play.

### 8.1 Revenue Model

| Item | Price | Type |
|------|-------|------|
| Base game | $2.99–$4.99 | One-time purchase |
| Hint pack (10) | $0.99 | Consumable |
| Hint pack (30) | $1.99 | Consumable |
| Theme packs (new artifact sets) | $1.99–$2.99 each | Non-consumable |

### 8.2 Set Up RevenueCat

RevenueCat handles all the complicated App Store / Google Play billing code for you.

1. Create account at https://www.revenuecat.com
2. Set up your app and create product IDs
3. Install:

```bash
npm install @revenuecat/purchases-capacitor
npx cap sync
```

### 8.3 App Store Submission Checklist

**Apple App Store (iOS):**
- [ ] Apple Developer account ($99/year): https://developer.apple.com
- [ ] App icon (1024x1024 PNG, no transparency)
- [ ] 5-8 screenshots per device size (6.7", 6.5", 5.5")
- [ ] App description (4000 char max)
- [ ] Keywords (100 char max) — target "treasure puzzle", "sudoku", "brain game", "daily puzzle", "logic game"
- [ ] Privacy policy URL (required)
- [ ] Age rating questionnaire completed
- [ ] Build uploaded via Xcode
- [ ] TestFlight beta tested with 50-100 players

**Google Play Store (Android):**
- [ ] Google Play Developer account ($25 one-time): https://play.google.com/console
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (min 2 per device type)
- [ ] Short description (80 char) + full description (4000 char)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] App bundle (.aab) uploaded

### Checklist — Phase 7
- [ ] RevenueCat integrated
- [ ] In-app purchases working in sandbox/testing
- [ ] App Store assets created (icon, screenshots, descriptions)
- [ ] TestFlight beta distributed
- [ ] App Store submission approved
- [ ] Google Play submission approved

---

## 9. Key Concepts Glossary <a name="9-glossary"></a>

| Term | Meaning |
|------|---------|
| **Backtracking** | An algorithm that tries options, and if one fails, undoes it and tries the next — like solving a maze by trying every path |
| **React** | A JavaScript library for building user interfaces with reusable components |
| **TypeScript** | JavaScript with type annotations that catch bugs before you run code |
| **Component** | A reusable piece of UI (like a Cell or Board). Receives data via props |
| **Props** | The inputs/data you pass to a component |
| **State** | Data that changes over time (selected cell, player's grid, timer) |
| **Hook** | React functions starting with `use` (useState, useEffect) that add features to components |
| **useState** | A hook that lets a component remember a value between renders |
| **useEffect** | A hook that runs code when something changes (like starting a timer) |
| **Zustand** | A tiny state management library — like a shared notebook all components can read and write |
| **Vite** | A build tool that turns your TypeScript/React code into regular JS browsers can run |
| **Capacitor** | Wraps a web app in a native shell to run on iOS/Android |
| **Supabase** | An online database + authentication service (like Firebase but open source) |
| **npm** | Node Package Manager — installs JavaScript libraries other people have written |
| **Git** | Version control — saves snapshots of your code so you can undo mistakes |
| **localStorage** | Built-in browser storage — survives tab close, like a tiny file for your website |
| **Edge Function** | Server-side code that runs on Supabase's servers (keeps secrets safe) |
| **IAP** | In-App Purchase — buying something inside the app |
| **ASO** | App Store Optimization — like SEO but for app stores |
| **Safe Area** | The screen region not covered by the phone's notch, home indicator, etc. |

---

## 10. Resources & Learning Links <a name="10-resources"></a>

### React
- **Official Tutorial (tic-tac-toe):** https://react.dev/learn/tutorial-tic-tac-toe — highly recommended, it builds a game like yours
- **React docs:** https://react.dev/learn

### TypeScript
- **TypeScript in 5 minutes:** https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html

### Sudoku Algorithms
- **Backtracking explained visually:** https://en.wikipedia.org/wiki/Sudoku_solving_algorithms
- **Peter Norvig's Sudoku solver (famous article):** https://norvig.com/sudoku.html

### Capacitor (Mobile)
- **Getting Started:** https://capacitorjs.com/docs/getting-started
- **iOS Setup:** https://capacitorjs.com/docs/ios
- **Android Setup:** https://capacitorjs.com/docs/android

### Supabase (Backend)
- **Quickstart:** https://supabase.com/docs/guides/getting-started
- **Edge Functions:** https://supabase.com/docs/guides/functions

### Design
- **Apple Human Interface Guidelines:** https://developer.apple.com/design/human-interface-guidelines
- **Material Design (Android):** https://m3.material.io

### Free Assets
- **Sound effects:** https://freesound.org
- **Icons:** https://heroicons.com
- **Color palettes:** https://coolors.co

---

## Quick Reference — Git Commands

```bash
git status                    # See what files have changed
git add -A                    # Stage all changes
git commit -m "Your message"  # Save a snapshot
git log --oneline             # See recent commits
git diff                      # See what changed since last commit
```

## Quick Reference — Project Commands

```bash
npm run dev        # Start the dev server (see your app in browser)
npm run build      # Build for production
npx vitest run     # Run tests
npx cap sync       # Sync web build to native projects
npx cap open ios   # Open iOS project in Xcode
npx cap open android  # Open Android project in Android Studio
```

---

## Recommended Order of Attack

```
 Phase 1 — Fix unique solutions ← START HERE (can do in the prototype file)
   │
 Phase 2 — Add persistent state ← Also doable in the prototype file
   │
   ├─── At this point, your prototype is a solid, correct, save-capable game!
   │
 Phase 3 — Modular architecture ← Big refactor into React + TypeScript
   │
 Phase 4 — Sound & particle polish
   │
 Phase 5 — Mobile wrapper
   │
 Phase 6 — Backend & real leaderboards
   │
 Phase 7 — Monetization & App Store launch
```

> **Remember:** Phases 1 and 2 can be done directly in your existing prototype file.
> You don't need to set up React or TypeScript until Phase 3.
> A correct, save-capable prototype is more valuable than a half-migrated React app.
>
> Fix the engine first. Save state second. Reorganize third.
