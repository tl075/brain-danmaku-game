# Task List: Brain Training Danmaku Typing Game

## Core Engine & Infrastructure
- [/] Initialize project structure (index.html, css, js)
- [ ] Implement Game Loop (requestAnimationFrame, delta time)
- [ ] Implement Input Handling (Mouse for movement)
- [ ] Implement Canvas Rendering System
- [ ] Implement Collision Detection System (Circle/Rect)
- [ ] Implement State Manager (Title, Gameplay, Pause, GameOver, Victory)

## Gameplay Systems
- [ ] **Player System**
    - [ ] Movement logic (Mouse tracking)
    - [ ] Hitbox & Health System
    - [ ] Lives (Zanki) System
- [ ] **Enemy/Boss System**
    - [ ] Boss HP Bars
    - [ ] Phase transition logic
- [ ] **Danmaku (Bullet) System**
    - [ ] Basic Bullet Class (coordinates, velocity, vector)
    - [ ] Pattern Generators (Spirals, Rain, Aimed, Random)
    - [ ] Laser logic

## Brain Training Modules
- [ ] **Rock-Paper-Scissors (RPS) Module**
    - [ ] Logic for instruction generation ("Win", "Lose", "Don't Lose", etc.)
    - [ ] Target spawning (Gu, Choki, Pa)
    - [ ] Validation logic
- [ ] **Color/Stroop Module**
    - [ ] Logic for Text/Color combinations
    - [ ] Validation logic (Matching text color)
- [ ] **Counting Module**
    - [ ] Animation: Box open/close, Bullets in/out without player interaction (visual only)
    - [ ] Logic: Tracking count
    - [ ] Target spawning (Numbers)

## Typing Module
- [ ] Romaji/Kana Conversion Logic (Custom or lightweight implementation)
- [ ] Question Display UI
- [ ] Keyboard Input Handling
- [ ] WPM / Speed tracking for difficulty adjustment

## Audio System
- [ ] **BGM System**
    - [ ] `<input type="file" webkitdirectory>` implementation for user folder
    - [ ] Playlist management & Random playback
    - [ ] Now Playing UI (display filename)
- [ ] **SE System**
    - [ ] Basic sound effects (Shoot, Hit, Select, Correct, Wrong, Type) using Web Audio API or Audio Elements

## Content & Stages
- [ ] **Boss 1: The Dodger**
    - [ ] Pure Danmaku patterns (Warmup)
- [ ] **Boss 2: The Brain**
    - [ ] Integrate RPS, Color, Counting tasks
    - [ ] Interleaved with Danmaku
- [ ] **Boss 3: The Typist**
    - [ ] Typing tasks only + Danmaku
- [ ] **Boss 4: The Scholar**
    - [ ] Brain Training + Typing + Danmaku (Simultaneous/Alternating)
- [ ] **Final Boss: Overload**
    - [ ] High-speed Long-text Typing
    - [ ] Continuous Brain Training
    - [ ] Intense Danmaku (Touhou Lunatic style)

## UI & Polish
- [ ] Main Menu
- [ ] HUD (HP, Time, Current Task)
- [ ] Game Over / Retry Screen
- [ ] Victory Screen

## User Requested Enhancements (v1.1)
- [x] **Audio**
    - [x] Add BGM Mute Button (with Icon/Text toggle)
    - [x] Add Sound Effects (Damage, Attack, UI Click) (v1.1.3)
- [x] **UI Improvements**
    - [x] Fix RPS Icon / Typing Box overlap
    - [x] Fix RPS Icon self-overlap
    - [x] Remove `show` command capability
    - [x] Add Boss HP Bar (Top Red Bar)
    - [x] Add Player HP Bar (Bottom Blue Bar, Green on Heal) (v1.1.0)
    - [x] Add Social Media Links & Icon (Bottom Right) (v1.1.3)
- [x] **Gameplay Features**
    - [x] Add `power` command (Persistent 1.5x damage) (v1.1.2)
    - [x] Add `weak` command (Persistent 0.75x damage) (v1.1.2)
    - [x] Reduce bullet clear radius for RPS clear
    - [x] Track Typing Success Count
- [x] **Ranking Logic Update**
    - [x] Score Formula: Time(sec) - (Lives*30) - (TypeSuccess*10)
    - [x] Ranking Display: Score order (low score is better)
    - [x] Update GAS sorting logic
