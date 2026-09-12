# 🦸‍♂️ SPLENDOR: MARVEL — The Infinity Gauntlet Board Game

A real-time multiplayer & solo digital board game adaptation of **Splendor: Marvel**, powered by Node.js, Socket.io, React, and TypeScript.

---

## ⚡ Features

- **Authentic Marvel Comic Art**: Features all 90 Marvel characters (Iron Man, Thanos, Spider-Man, Captain America, Black Panther, Thor, Scarlet Witch...) and 10 Marvel locations (Avengers Tower, Wakanda, Asgard, Helicarrier...).
- **Infinity Stones Mechanics**:
  - 🔴 **Reality Stone** (Red)
  - 🔵 **Space Stone** (Blue)
  - 🟢 **Time Stone** (Green)
  - 🟠 **Soul Stone** (Orange)
  - 🟡 **Mind Stone** (Yellow)
  - 🟣 **Power Stone** (Purple)
  - 🛡️ **S.H.I.E.L.D. Token** (Silver Wildcard)
- **Avengers Assemble Tile**: Collect 3+ Avengers symbols (`A`) to claim the +3 Victory Points bonus tile.
- **Solo Play vs Marvel AI**: Play immediately against intelligent AI Bots (*Tony Stark AI*, *Ultron*, *Thanos Bot*, *F.R.I.D.A.Y.*) with 1–3 bots without waiting for other players!
- **Real-Time Multiplayer**: Room creation, join codes, and live synchronized turns for 2–4 players.

---

## 🏆 Win Conditions (The Infinity Gauntlet)

To claim victory and trigger the final round, a player must simultaneously meet **ALL THREE** conditions:
1. **16+ Victory Points**
2. **All 6 Infinity Stone Bonus Colors** (at least 1 card of each stone color)
3. **At least 1 Tier-3 Hero Card**

---

## 🚀 Quick Start

### One-Click Launch (Windows)
Double-click `start-game.bat`!

### Manual Start

#### 1. Server (Terminal 1)
```bash
npm install
npx ts-node-dev --respawn --transpile-only src/server/index.ts
```

#### 2. Client (Terminal 2)
```bash
cd client
npm install
npm run dev
```

#### 3. Play
Open your browser at **`http://localhost:5173`**!
