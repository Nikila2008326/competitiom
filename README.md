# 🏆 School Competition Social Media Points Calculator & Live Leaderboard

An interactive, responsive web application for real-time tracking, calculating, and ranking school competition engagement across Instagram and WhatsApp.

---

## ⚡ Scoring Weights & Point Rules
- **Instagram Like**: `15 pts` each
- **Instagram Comment**: `10 pts` each
- **Instagram Share**: `10 pts` each
- **WhatsApp Vote**: `25 pts` each
*(Points multipliers can also be customized dynamically on the fly)*

---

## ✨ Key Features

1. **Multi-Table & Round Tabs Management**:
   - Create unlimited competition tables / rounds with the `+ New Table` button.
   - Choose between Blank Table, Copy Active Table, Preload 6 Sample Schools, or Preload All 71 Schools.
   - Switch between tables instantly using glassmorphic interactive tabs.
   - Rename tables (double-click tab or click Rename), duplicate tables, and delete tables.
   - Each table maintains its own schools, scores, live podium, and analytics chart.

2. **Live Leaderboard & Automatic Ranking**:
   - Dynamic real-time calculation of points and places (🥇 1st, 2nd, 3rd, and #4+).
   - Top 3 celebratory Podium with real-time stats breakdown (WhatsApp pts vs. Instagram pts).
   - Confetti celebration when a new school takes 1st place.

3. **Directory of 71 Sri Lankan Schools**:
   - Preloaded directory of 71 schools transcribed directly from competition sheets.
   - Glassmorphic Command Bar with auto-complete matching and `<mark>` highlighting.
   - 1-Click Quick Add pills for popular schools (Ananda, Royal, Visakha, Musaeus, D.S. Senanayake, Mahanama, etc.).
   - Bulk Multi-Select Checklist modal to add schools in batches.
   - 1-click **Add All 71** button.

3. **Official PDF Report Generation**:
   - Generates official, clean A4 PDF reports using `jsPDF` and `autoTable`.
   - Includes raw counts, calculated point marks, rank medals, grand totals, and official competition scoring rules box.

4. **Firebase Cloud Firestore Persistence**:
   - Save calculation rounds with timestamps and custom session titles.
   - Load, restore, or delete past competition history with 1 click.
   - Safe local storage backup fallback if Firebase rules are not yet published.

5. **Security Passcode Gate**:
   - 7-digit security access gate (`2008326`) protecting the calculator.
   - "Remember this device for 3 days" option for convenient access.
   - Lock/Logout button in the header.

6. **Mobile & Desktop Responsive Design**:
   - Dark glassmorphism UI with smooth gradients and micro-animations.
   - Fully optimized for mobile screens, tablets, and desktop displays.

---

## 🚀 Getting Started

### Local Setup
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## 🔐 Access Passcode
Default access passcode: `2008326`
