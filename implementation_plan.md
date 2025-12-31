# Implementation Plan: Brain Training Danmaku Typing Game

## Goal
Build a high-difficulty web-based game combining **Bullet Hell (Danmaku)**, **Brain Training**, and **Typing**.
The game runs in a browser using HTML5 Canvas and Vanilla JavaScript.

## User Review Required
> [!IMPORTANT]
> **Audio Restriction**: Web browsers do not allow automatic access to local folders.
> The "BGM Folder" feature will be implemented using `<input type="file" webkitdirectory>`.
> The user **must** manually select a folder containing audio files (mp3/wav/ogg) every time the page is reloaded/opened.
> Without this selection, the game will run without BGM.

## Architecture

### 1. Core Structure
- **Index.html**: Canvas element, hidden inputs for keyboard/file focus.
- **Main.js**: Entry point, initializes `Game` class.
- **Game.js**: Handles the game loop (`requestAnimationFrame`), delta time calculation, and high-level state (Menu, Play, Pause, Over).

### 2. Subsystems
#### **InputHandler**
- **Mouse**: Tracks specific X/Y coordinates for Player movement.
- **Keyboard**: Listens to `keydown` for Typing Mode. Captures all keys.

#### **Player**
- Properties: `x`, `y`, `hitboxRadius`, `speed` (if not 1:1 mouse), `lives` (Zanki), `hp`.
- Render: Simple distinctive shape (e.g., Triangle/Ship).
- **Movement**:
  - Follows Mouse Cursor exactly.
  - *Correction*: If mouse moves too fast, player might teleport through bullets.
  - *Solution*: Raycast check between previous frame pos and current frame pos for bullet collision can be expensive.
  - *Decision*: Since it's "Mouse coordinate" movement, we assume infinite speed. We will check collision at the *current* position. High FPS recommended.

#### **BulletManager (Danmaku)**
- Object Pooling for performance (thousands of bullets).
- **Bullet Types**:
  - `Normal`: Linear velocity.
  - `Accelerating`: Changes speed.
  - `Curving`: Changes angle.
  - `Laser`: Ray/Rectangle collision.
- **PatternGenerator**: Static functions/classes to spawn complex patterns (spirals, circles).

#### **BrainTaskManager**
- **RPS (Rock-Paper-Scissors)**:
  - Logic: Generates a rule (e.g., "Win!") and a CPU Move (e.g., Rock).
  - Spawns 3 Target Zones (Rock, Paper, Scissors) at random locations.
  - Checks logic on player collision.
- **Color/Stroop**:
  - Logic: Chooses Text (e.g., "RED") and Color (e.g., Blue).
  - Spawns Color Zones.
  - Rule: Match Text Color (or user defined variation).
- **Counting**:
  - Phase 1: Show Box.
  - Phase 2: Animate balls entering/leaving.
  - Phase 3: Pause, Spawn Number Options.
  - Phase 4: Validate.

#### **TypingManager**
- Dictionary: List of Japanese sentences (short for regular, long for boss).
- **Romaji Engine**:
  - Maps `k` -> `ka/ki/ku...` pending vowel.
  - Handles `n` (nn), small `tsu`, etc.
  - Visual: Displays "Target Kana", "Romaji Typed", "Romaji Remaining".

#### **Enemy/Boss**
- Single Boss entity that changes behavior per Stage.
- **Stages**:
  1.  **Dodge**: Just patterns.
  2.  **Brain**: Patterns + Brain Tasks.
  3.  **Type**: Patterns + Typing.
  4.  **Multi**: Patterns + Brain + Type.
  5.  **Hell**: Overload.

### 3. File Structure
```
/
├── index.html
├── style.css
├── js/
│   ├── main.js
│   ├── Game.js
│   ├── Player.js
│   ├── BulletManager.js
│   ├── InputHandler.js
│   ├── SoundManager.js
│   ├── BrainGame/
│   │   ├── RPSTask.js
│   │   ├── colorTask.js
│   │   └── CountTask.js
│   └── Typing/
│       ├── TypingEngine.js
│       └── WordList.js
```

## Verification Plan

### Automated Tests
- N/A (Visual Game).

### Manual Verification
1.  **Movement**: Ensure player follows mouse smoothy.
2.  **Collision**: Run into a bullet -> Lose HP.
3.  **RPS**:
    - "Win" + Rock -> Hit Paper -> Success.
    - "Win" + Rock -> Hit Scissors -> Fail.
4.  **Typing**: Type "sushi" -> checks internal logic.
5.  **Audio**: Select a localized folder, ensure BGM plays and loops.
