# 🦸‍♂️ SPLENDOR: MARVEL — The Infinity Gauntlet Board Game
**Nachapol Industries Interactive Digital Board Game System**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 18](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F5A623?style=for-the-badge)](LICENSE)
[![Game Engine](https://img.shields.io/badge/Infinity%20Engine-ONLINE-10B981?style=for-the-badge)](#)

เว็บแอปพลิเคชันดิจิทัลบอร์ดเกมแบบเรียลไทม์ ดัดแปลงจากเกมกระดานชื่อดัง **Splendor: Marvel** โดยรวบรวมเหล่าฮีโร่และวายร้ายจากจักรวาล Marvel Comics ครบทั้ง 90 ตัวละคร, 10 การ์ดสถานที่สำคัญ, ระบบจำลองการเล่นคนเดียวร่วมกับ **Marvel AI Bots (Tony Stark, Ultron, Thanos, F.R.I.D.A.Y.)** และระบบมัลติเพลเยอร์แบบ Synchronized Turns ผ่าน WebSockets

<div align="center">
<pre>
================================================================================
 __  __            ______      ________ _      _____ _____  _      ____  _____  
|  \/  |   /\     |  __ \ \   / /  ____| |    / ____|  __ \| |    / __ \|  __ \ 
| \  / |  /  \    | |__) \ \ / /| |__  | |   | (___ | |__) | |   | |  | | |__) |
| |\/| | / /\ \   |  _  / \ V / |  __| | |    \___ \|  ___/| |   | |  | |  _  / 
| |  | |/ ____ \  | | \ \  | |  | |____| |____ ____) | |    | |___| |__| | | \ \ 
|_|  |_/_/    \_\_|_|  \_\ |_|  |______|______|_____/|_|    |______\____/|_|  \_================================================================================
                    THE INFINITY GAUNTLET BOARD GAME
</pre>
</div>

<p align="center">
  <img src="docs/images/marvel_splendor_banner.png" alt="SPLENDOR: MARVEL — The Infinity Gauntlet Board Game" width="100%">
</p>

<p align="center">
  <a href="#-overview--core-mechanics">🌌 Overview</a> •
  <a href="#-infinity-stones--token-matrix">💎 Infinity Stones</a> •
  <a href="#-win-conditions-the-infinity-gauntlet">🏆 Win Conditions</a> •
  <a href="#-marvel-ai-opponent-protocol-matrix">🤖 Marvel AI Bots</a> •
  <a href="#-card-tiers--locations">🃏 Cards & Locations</a> •
  <a href="#-quick-start">🚀 Quick Start</a> •
  <a href="#-system-architecture--socketio-bus">🏗️ Architecture</a> •
  <a href="#-บันทึกจากผู้พัฒนา-developers-note">📝 Dev Note</a>
</p>

---

## 🌌 Overview & Core Mechanics

**Splendor: Marvel** นำผู้เล่นเข้าสู่สมรภูมิชิงอัญมณีเพื่อครอบครอง **Infinity Gauntlet** ในฐานะผู้บัญชาการฮีโร่ โดยต้องวางแผนบริหารทรัพยากร (Gem Tokens), สะสมโบนัสการ์ดตัวละครเพื่อลดต้นทุนการซื้อครั้งถัดไป, ดึงดูดการ์ดสถานที่ (Locations), และรวบรวมสัญลักษณ์ **Avengers Assemble** เพื่อคว้าชัยชนะ

### ⚡ จุดเด่นสำคัญของระบบ:
- **🎨 Authentic Comic Art:** รวบรวมอาร์ตเวิร์กแท้จากการ์ตูน Marvel Comics ครบทั้ง 90 ตัวละคร (3 ระดับ Tiers) และ 10 สถานที่ระดับตำนาน
- **🤖 Marvel AI Opponent Engine:** ระบบบอทปัญญาประดิษฐ์ 4 สไตล์การเล่น (*Tony Stark, Ultron, Thanos, F.R.I.D.A.Y.*) สำหรับโหมดเล่นคนเดียว (Solo Mode) ทันทีโดยไม่ต้องรอผู้เล่นอื่น
- **🌐 Real-Time Multiplayer:** ระบบห้องเล่นเกมออนไลน์ (Lobby, Room Code, Live Sync Turn State) สำหรับผู้เล่น 2–4 คน ผ่าน WebSockets (Socket.io)
- **✨ Framer Motion Recruitment VFX:** แอนิเมชันแสงสีเอฟเฟกต์การเกณฑ์ฮีโร่เข้าสู่ทีมแบบไดนามิก
- **🎵 Built-in Marvel Soundtrack Player:** สตรีมมิงเพลงธีม Marvel และบรรยากาศการต่อสู้ระดับภาพยนตร์ในตัวเกม
- **📱 Responsive & Orientation Guard:** ปรับขนาดย่อขยายตามหน้าจออัตโนมัติ (Scalable Canvas) พร้อมแจ้งเตือนเมื่อหมุนหน้าจอไม่เหมาะสม

---

## 💎 Infinity Stones & Token Matrix

ในเกมมีอัญมณีอินฟินิตี้ 6 สี พร้อมโทเค็นพิเศษของหน่วย S.H.I.E.L.D. ที่ผู้เล่นต้องบริหารจัดการตามกติกา:

<p align="center">
  <img src="docs/images/infinity_stones_guide.png" alt="Infinity Stones & Token Matrix" width="100%">
</p>

| อัญมณี (Stone) | สี (Color) | รหัสระบบ | หน้าที่ & กฎการใช้งานในเกม |
| :--- | :--- | :--- | :--- |
| 🔴 **Reality Stone** | แดง (Ruby) | `ruby` | ใช้จ่ายในการเกณฑ์การ์ด และให้ส่วนลดสีแดงถาวร |
| 🔵 **Space Stone** | น้ำเงิน (Sapphire) | `sapphire` | ใช้จ่ายในการเกณฑ์การ์ด และให้ส่วนลดสีน้ำเงินถาวร |
| 🟢 **Time Stone** | เขียว (Emerald) | `emerald` | **สิทธิ์พิเศษ:** ได้รับทันที 1 ก้อนเมื่อผู้เล่นเกณฑ์ฮีโร่ Tier 3 ได้สำเร็จ (ไม่มีให้หยิบจากกองกลาง) |
| 🟠 **Soul Stone** | ส้ม (Obsidian) | `obsidian` | ใช้จ่ายในการเกณฑ์การ์ด และให้ส่วนลดสีส้มถาวร |
| 🟡 **Mind Stone** | เหลือง (Topaz) | `topaz` | ใช้จ่ายในการเกณฑ์การ์ด และให้ส่วนลดสีเหลืองถาวร |
| 🟣 **Power Stone** | ม่วง (Amethyst) | `amethyst` | ใช้จ่ายในการเกณฑ์การ์ด และให้ส่วนลดสีม่วงถาวร |
| 🛡️ **S.H.I.E.L.D. Token** | เงิน (Wildcard) | `gold` | ได้รับ 1 ชิ้นเมื่อใช้แอ็กชัน **จองการ์ด (Reserve Card)** สามารถใช้แทนอัญมณีสีใดก็ได้ (ผู้เล่นถือการ์ดจองได้สูงสุด 3 ใบ) |

> [!NOTE]
> **กติกาการหยิบอัญมณีต่อเทิร์น (Take Tokens Action):**
> 1. เลือกหยิบอัญมณี **3 สีที่ต่างกัน** สีละ 1 ก้อน (ไม่นับสีเขียวและสีทอง)
> 2. หรือเลือกหยิบอัญมณี **สีเดียวกัน 2 ก้อน** (ทำได้เฉพาะเมื่อกองอัญมณีสีนั้นเหลือกองกลางตั้งแต่ 4 ก้อนขึ้นไป)
> 3. ผู้เล่นถือโทเค็นในมือได้สูงสุดไม่เกิน **10 ก้อน** เมื่อจบรอบ (หากเกินต้องเลือกคืนกองกลาง)

---

## 🏆 Win Conditions (The Infinity Gauntlet)

ผู้เล่นที่จะประกาศชัยชนะและเรียกการเล่นรอบสุดท้าย (Final Round) จะต้องมีคุณสมบัติครบถ้วนตามเงื่อนไข **3 ประการพร้อมกัน**:

```
┌────────────────────────────────────────────────────────────────────────┐
│               THE INFINITY GAUNTLET WINNING CRITERIA                   │
├────────────────────────────────────────────────────────────────────────┤
│  [✓] 1. มีคะแนนชัยชนะรวม (Victory Points) อย่างน้อย 16 แต้มขึ้นไป       │
│  [✓] 2. มีโบนัสอัญมณีครบทั้ง 6 สี (มีฮีโร่ลดต้นทุนครบทั้ง 6 สี)          │
│  [✓] 3. ครอบครองการ์ดฮีโร่ Tier 3 อย่างน้อย 1 ใบ (ถือครอง Time Stone)   │
└────────────────────────────────────────────────────────────────────────┘
```

- **Avengers Assemble Bonus Tile (+3 VP):** ผู้เล่นคนแรกที่สะสมสัญลักษณ์ทีมอเวนเจอร์ (`A`) บนการ์ดฮีโร่ครบ 3 สัญลักษณ์ จะได้รับแผ่นป้าย Avengers Assemble ไปครองทันที (+3 แต้ม) แต่หากมีผู้เล่นอื่นสะสมสัญลักษณ์ได้มากกว่า แผ่นป้ายจะถูกแย่งไปทันที!
- **การตัดสินเสมอ (Tie-Breaker):** หากมีผู้เล่นบรรลุเงื่อนไขมากกว่าหนึ่งคนเมื่อจบรอบ ผู้เล่นที่ใช้จำนวนการ์ดฮีโร่น้อยที่สุดในการชนะ จะเป็นผู้ชนะสูงสุด

---

## 🤖 Marvel AI Opponent Protocol Matrix

ระบบบอทปัญญาประดิษฐ์อัตโนมัติ ออกแบบอัลกอริทึมการคำนวณแยกตามสไตล์และบุคลิกของตัวละคร เพื่อให้การเล่นคนเดียวมีมิติและท้าทาย:

<p align="center">
  <img src="docs/images/marvel_ai_matrix.png" alt="Marvel AI Opponent Protocol Matrix" width="100%">
</p>

### 1. 🤖 Tony Stark AI (`stark`) — *Avengers Priority Focus*
- **กลยุทธ์:** ให้ความสำคัญสูงสุดกับการเกณฑ์การ์ดที่มีตราสัญลักษณ์ `Avengers (A)` เพื่อแย่งชิงและผูกขาดแผ่นป้ายโบนัส `+3 VP Avengers Assemble`
- **คำคมประจำระบบ:** *"Sometimes you gotta run before you can walk."*

### 2. ⚡ Ultron (`ultron`) — *High Point Rush*
- **กลยุทธ์:** คำนวณเส้นทางคณิตศาสตร์ที่สั้นที่สุดในการทำคะแนน มุ่งเป้าการ์ด Tier 2 และ Tier 3 ที่ให้ค่า Victory Points สูงสุดเพื่อจบเกมอย่างรวดเร็ว
- **คำคมประจำระบบ:** *"There are no strings on me."*

### 3. 👑 Thanos Bot (`thanos`) — *Infinity Gauntlet Dominance*
- **กลยุทธ์:** มุ่งเน้นการสะสมโบนัสการ์ดให้ครบทั้ง 6 สีของ Infinity Stones อย่างเป็นระบบเพื่อปลดล็อกการดีดนิ้ว (Gauntlet Snap) อย่างสมบูรณ์แบบ
- **คำคมประจำระบบ:** *"I am... inevitable."*

### 4. 💠 F.R.I.D.A.Y. (`friday`) — *Adaptive Balanced Matrix*
- **กลยุทธ์:** ทำหน้าที่เสมือนผู้ช่วยยุทธวิธีอัจฉริยะ ปรับสมดุลระหว่างการสะสมโทเค็น, การจองการ์ดตัดจังหวะฝ่ายตรงข้าม, และการเกณฑ์ตัวละครตามสถานการณ์ของโต๊ะ
- **คำคมประจำระบบ:** *"Boss, tactical telemetry is green."*

---

## 🃏 Card Tiers & Locations

ตัวเกมประกอบด้วยการ์ดฮีโร่ 3 ระดับ รวม 90 ใบ และการ์ดสถานที่ 10 แห่ง:

### 🟢 Tier 1 Cards (40 ใบ)
- **ระดับ:** กองกำลังแนวหน้าและพันธมิตร (Recruits & Street Heroes)
- **ตัวละครเด่น:** Falcon, Cloak, Dagger, Kraven, Agent Coulson, Elektra, Blade, Bullseye, Luke Cage, Moon Knight, Kamala Khan, Angel, Agatha Harkness...
- **ต้นทุน:** โทเค็น 3–5 ก้อน / ให้โบนัสสี 1 สี (0–1 VP)

### 🔵 Tier 2 Cards (30 ใบ)
- **ระดับ:** สมาชิกหลักทีมอเวนเจอร์และยอดฝีมือ (Avengers & Champions)
- **ตัวละครเด่น:** Black Widow, Hawkeye, Ant-Man, Vision, Scarlet Witch, Winter Soldier, War Machine, Drax, Spider-Woman, Quicksilver, Daredevil...
- **ต้นทุน:** โทเค็น 5–8 ก้อน / ให้โบนัสสีและคะแนน 1–3 VP (บางใบมีตรา `Avengers`)

### 🟣 Tier 3 Cards (20 ใบ)
- **ระดับ:** ฮีโร่ระดับคอสมิกและไททันพลังมหาศาล (Cosmic Powerhouses & Titans)
- **ตัวละครเด่น:** **Iron Man, Thanos, Captain America, Thor, Doctor Strange, Black Panther, Hulk, Captain Marvel, Storm, Jean Grey, Magneto, Galactus...**
- **ต้นทุน:** โทเค็น 7–12 ก้อน / ให้คะแนนสูงถึง 3–5 VP **และมอบ Time Stone (เขียว) ทันทีที่เกณฑ์สำเร็จ!**

### 🏛️ Locations (10 แห่ง)
- **สถานที่:** Avengers Tower, Wakanda, Asgard, Knowhere, Quantum Realm, Sanctum Sanctorum, S.H.I.E.L.D. Helicarrier, Triskelion, Stark Tower, Baxter Building
- **กฎ:** ผู้เล่นคนแรกที่มีโบนัสสีตามที่ระบุบนการ์ดสถานที่ครบถ้วน จะดึงดูดสถานที่นั้นเข้ามาเพิ่มคะแนน `+3 VP` ทันทีอัตโนมัติ

---

## 🚀 Quick Start

### ⚪ ตัวเลือกที่ 1: One-Click Launch (Windows)
ดับเบิลคลิกไฟล์ **`start-game.bat`** ในโฟลเดอร์หลัก ระบบจะทำการติดตั้งแพ็กเกจที่ขาดและเปิดเซิร์ฟเวอร์เกมพร้อมเบราว์เซอร์อัตโนมัติ

### ⚪ ตัวเลือกที่ 2: รันแบบ Concurrent (คำสั่งเดียว)
```bash
npm install
npm run dev
```
*(คำสั่งนี้จะสตาร์ททั้ง Backend Server และ Vite Client พร้อมกันอัตโนมัติ)*

### ⚪ ตัวเลือกที่ 3: รันแยก Terminal

#### 1. สตาร์ท Game Server (Terminal 1)
```bash
npm install
npm run dev:server
# รันบน http://localhost:3000
```

#### 2. สตาร์ท Vite Client (Terminal 2)
```bash
cd client
npm install
npm run dev
# รันบน http://localhost:5173
```

#### 3. เข้าเล่นเกม
เปิดเว็บเบราว์เซอร์ไปที่ **`http://localhost:5173`** เพื่อสร้างห้องเล่น หรือฝึกซ้อมกับบอท AI ได้ทันที!

---

## 🏗️ System Architecture & Socket.io Bus

ระบบขับเคลื่อนด้วยสถาปัตยกรรมแบบ Client-Server ผ่าน WebSocket Event-Driven:

```
[ Vite + React + Framer Motion Client ]
                 │ ▲
   Socket.io IPC │ │  Synchronized State Events
                 ▼ │
  [ Express + Socket.io Server (:3000) ]
        ├── RoomManager (Lobby & Rooms)
        ├── GameLogic Engine (Rules & Turn Execution)
        ├── BotLogic (Stark, Ultron, Thanos, Friday AI)
        └── WinConditions (Gauntlet & Location Verification)
```

### 📡 รายการ Socket.io Protocol Events สำคัญ:
- `create_room` / `join_room`: สร้างและเข้าร่วมห้องเล่นเกม
- `add_bot` / `remove_bot`: จัดการบอท AI ฝั่งเซิร์ฟเวอร์
- `start_game`: เริ่มแมตช์และแจกการ์ดสุ่ม
- `game_action`: รับแอ็กชันจากผู้เล่น (`take_tokens`, `buy_card`, `reserve_card`)
- `game_state_update`: บรอดแคสต์สถานะโต๊ะ อัญมณี และการ์ด ให้ผู้เล่นทุกคนแบบเรียลไทม์

---

## 📝 บันทึกจากผู้พัฒนา (Developer's Note)

> *"Marvel Splendor เป็นหนึ่งในบอร์ดเกมที่ผมชื่นชอบมากที่สุด การสร้างโปรเจกต์ดิจิทัลนี้ขึ้นมาเริ่มต้นจากความหลงใหลในตัวละครของ Marvel Comics และกลไกเกมวางแผนที่ลึกซึ้งของ Splendor*
>
> *ผมตั้งใจพัฒนาให้ระบบมีความลื่นไหลที่สุด ทั้งระบบเสียงเพลง เอฟเฟกต์การเกณฑ์ฮีโร่ และการใส่ AI Bots อย่าง Tony Stark, Ultron, Thanos และ F.R.I.D.A.Y. เพื่อให้ทุกคนสามารถเข้ามาฝึกซ้อมและสนุกได้ตลอดเวลาแม้จะเล่นคนเดียว*
>
> *เพื่อนๆ นักพัฒนาท่านใดที่ชื่นชอบ Marvel หรือบอร์ดเกม สามารถนำโค้ดไปศึกษา Fork ดัดแปลง หรือเปิด Pull Request เพื่อต่อยอดฟีเจอร์ใหม่ๆ ร่วมกันได้เต็มที่เลยครับ!"*
>
> — **พัฒนาด้วยใจโดย Nachapol Industries**

---

## 🤝 Attribution & Credits (ข้อตกลงการให้เครดิต)

หากท่านนำโปรเจกต์ **Marvel Splendor** หรือส่วนหนึ่งส่วนใดของโค้ดไปใช้งาน, พัฒนาต่อยอด, นำไปสตรีม หรือจัดแสดง:
- 🌟 **กรุณาให้เครดิตผู้สร้าง:** **Nachapol Industries**
- 🔗 **แนบลิงก์กลับมายัง Repository ต้นฉบับ:** [https://github.com/sanior09/marvel-splendor](https://github.com/sanior09/marvel-splendor)
- ⚖️ **สัญญาอนุญาต:** ภายใต้สัญญาอนุญาต **[MIT License](LICENSE)**

---

## 📜 License & Marvel Disclaimer

- **Source Code License:** This software is released under the [MIT License](LICENSE).
- **Marvel Intellectual Property Disclaimer:** Characters, locations, names, and related comic imagery are trademarks and copyright of **MARVEL Entertainment / Marvel Characters, Inc.** and Space Cowboys / Asmodee. This project is a non-commercial fan-made tribute created strictly for educational, personal, and research purposes.

---

<p align="center">
  <b>Developed & Architected with ❤️ by Nachapol Industries</b><br>
  <i>"I am Iron Man."</i>
</p>
