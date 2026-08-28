# Eri's 18th Birthday Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a one-page birthday gift site for Eri: a message scene, a "Can we go on a date?" scene with a dodging No button, then a day/time/activity picker that emails the picks to the site owner.

**Architecture:** A single static `index.html` with six full-screen "scenes" toggled by a small vanilla-JS state machine (`js/app.js`). Pure, testable logic (calendar grid generation, dodge-position math, submission payload shaping) lives in `js/logic.js`, imported by both the browser app and Node tests. No build step, no frameworks — deployable as-is to GitHub Pages.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript (ES modules), Node's built-in test runner (`node --test`) for unit tests, Formspree for email delivery, GitHub Pages for hosting.

---

## File Structure

```
Eri Website/
  index.html
  css/style.css
  js/logic.js          # pure functions, unit tested
  js/app.js            # DOM wiring, imports logic.js
  assets/otters/hello.gif
  assets/otters/blush.gif
  assets/otters/peek.gif
  assets/otters/bye.gif
  tests/logic.test.js
  package.json
  README.md
```

---

### Task 1: Project scaffold and test harness

**Files:**
- Create: `package.json`
- Create: `js/logic.js` (empty export placeholder removed by Task 2)
- Create: `tests/logic.test.js` (empty, filled in Task 2)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "eri-birthday-site",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/"
  }
}
```

- [ ] **Step 2: Create empty `js/logic.js`**

```js
export {};
```

- [ ] **Step 3: Create a smoke-test file to confirm the harness runs**

```js
// tests/logic.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('test harness runs', () => {
  assert.equal(1 + 1, 2);
});
```

- [ ] **Step 4: Run the test harness**

Run: `npm test`
Expected: `# pass 1`, exit code 0

- [ ] **Step 5: Commit**

```bash
git add package.json js/logic.js tests/logic.test.js
git commit -m "chore: scaffold project and test harness"
```

---

### Task 2: Calendar logic (`getCalendarMonth`)

**Files:**
- Modify: `js/logic.js`
- Modify: `tests/logic.test.js`

- [ ] **Step 1: Write the failing tests**

Replace the smoke test in `tests/logic.test.js` with:

```js
// tests/logic.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCalendarMonth } from '../js/logic.js';

test('getCalendarMonth: grid covers every day of the month exactly once', () => {
  const { weeks } = getCalendarMonth(2026, 1, '2026-08-29'); // Feb 2026 (month is 0-indexed)
  const dayCells = weeks.flat().filter((c) => c.day !== null);
  assert.equal(dayCells.length, 28);
  assert.equal(dayCells[0].day, 1);
  assert.equal(dayCells[dayCells.length - 1].day, 28);
});

test('getCalendarMonth: weeks are always full rows of 7', () => {
  const { weeks } = getCalendarMonth(2026, 7, '2026-08-29'); // Aug 2026
  for (const week of weeks) {
    assert.equal(week.length, 7);
  }
});

test('getCalendarMonth: dates before today are disabled, today and after are not', () => {
  const { weeks } = getCalendarMonth(2026, 7, '2026-08-15'); // Aug 2026, "today" = Aug 15
  const cells = weeks.flat().filter((c) => c.day !== null);
  const day14 = cells.find((c) => c.day === 14);
  const day15 = cells.find((c) => c.day === 15);
  const day16 = cells.find((c) => c.day === 16);
  assert.equal(day14.disabled, true);
  assert.equal(day15.disabled, false);
  assert.equal(day16.disabled, false);
});

test('getCalendarMonth: each day cell has a correct ISO date string', () => {
  const { weeks } = getCalendarMonth(2026, 7, '2026-08-15'); // Aug 2026
  const day1 = weeks.flat().find((c) => c.day === 1);
  assert.equal(day1.iso, '2026-08-01');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `getCalendarMonth is not a function` (or similar import error)

- [ ] **Step 3: Implement `getCalendarMonth` in `js/logic.js`**

```js
// js/logic.js
export function getCalendarMonth(year, month, todayISO) {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startWeekday = firstOfMonth.getUTCDay(); // 0 = Sunday
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ iso: null, day: null, disabled: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ iso, day: d, disabled: iso < todayISO });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ iso: null, day: null, disabled: true });
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return { year, month, weeks };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: `# pass 4`, exit code 0

- [ ] **Step 5: Commit**

```bash
git add js/logic.js tests/logic.test.js
git commit -m "feat: add calendar month grid generation logic"
```

---

### Task 3: Dodge-position logic (`getRandomDodgePosition`)

**Files:**
- Modify: `js/logic.js`
- Modify: `tests/logic.test.js`

- [ ] **Step 1: Add the failing tests**

Append to `tests/logic.test.js`:

```js
import { getRandomDodgePosition } from '../js/logic.js';

test('getRandomDodgePosition: rng=0 returns the top-left corner', () => {
  const pos = getRandomDodgePosition(400, 300, 100, 50, () => 0);
  assert.deepEqual(pos, { x: 0, y: 0 });
});

test('getRandomDodgePosition: rng=1 returns the bottom-right bound', () => {
  const pos = getRandomDodgePosition(400, 300, 100, 50, () => 1);
  assert.deepEqual(pos, { x: 300, y: 250 }); // containerW-btnW, containerH-btnH
});

test('getRandomDodgePosition: real Math.random stays in bounds over many calls', () => {
  for (let i = 0; i < 500; i++) {
    const pos = getRandomDodgePosition(400, 300, 100, 50);
    assert.ok(pos.x >= 0 && pos.x <= 300);
    assert.ok(pos.y >= 0 && pos.y <= 250);
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `getRandomDodgePosition is not a function`

- [ ] **Step 3: Implement `getRandomDodgePosition` in `js/logic.js`**

```js
export function getRandomDodgePosition(containerW, containerH, btnW, btnH, rng = Math.random) {
  const maxX = Math.max(containerW - btnW, 0);
  const maxY = Math.max(containerH - btnH, 0);
  return {
    x: Math.round(rng() * maxX),
    y: Math.round(rng() * maxY),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: `# pass 7`, exit code 0

- [ ] **Step 5: Commit**

```bash
git add js/logic.js tests/logic.test.js
git commit -m "feat: add dodge-position calculation logic"
```

---

### Task 4: Submission payload logic (`buildSubmissionPayload`)

**Files:**
- Modify: `js/logic.js`
- Modify: `tests/logic.test.js`

- [ ] **Step 1: Add the failing tests**

Append to `tests/logic.test.js`:

```js
import { buildSubmissionPayload } from '../js/logic.js';

test('buildSubmissionPayload: preset activity is used as-is', () => {
  const payload = buildSubmissionPayload({ day: '2026-09-01', time: 'Evening', activity: 'Dinner', otherText: '' });
  assert.deepEqual(payload, { date: '2026-09-01', time: 'Evening', activity: 'Dinner' });
});

test('buildSubmissionPayload: "Other" activity uses trimmed otherText', () => {
  const payload = buildSubmissionPayload({ day: '2026-09-01', time: 'Morning', activity: 'Other', otherText: '  Board games  ' });
  assert.deepEqual(payload, { date: '2026-09-01', time: 'Morning', activity: 'Board games' });
});

test('buildSubmissionPayload: "Other" with empty otherText yields empty activity', () => {
  const payload = buildSubmissionPayload({ day: '2026-09-01', time: 'Afternoon', activity: 'Other', otherText: '' });
  assert.deepEqual(payload, { date: '2026-09-01', time: 'Afternoon', activity: '' });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `buildSubmissionPayload is not a function`

- [ ] **Step 3: Implement `buildSubmissionPayload` in `js/logic.js`**

```js
export function buildSubmissionPayload({ day, time, activity, otherText }) {
  const finalActivity = activity === 'Other' ? (otherText || '').trim() : activity;
  return { date: day, time, activity: finalActivity };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: `# pass 10`, exit code 0

- [ ] **Step 5: Commit**

```bash
git add js/logic.js tests/logic.test.js
git commit -m "feat: add submission payload shaping logic"
```

---

### Task 5: Otter GIF assets

**Files:**
- Create: `assets/otters/hello.gif`
- Create: `assets/otters/blush.gif`
- Create: `assets/otters/peek.gif`
- Create: `assets/otters/bye.gif`
- Delete (after copy verified): the 4 original GIF files at the project root

- [ ] **Step 1: Copy and rename the existing GIFs into `assets/otters/`**

```bash
mkdir -p assets/otters
cp "Hello Cute Sticker - Hello Cute - Discover & Share GIFs.gif" assets/otters/hello.gif
cp "Daily Stickers of Cute Otter_ Animated.gif" assets/otters/blush.gif
cp "LINE 官方貼圖 - Daily Stickers of Cute Otter_ Animated Example with GIF Animation.gif" assets/otters/peek.gif
cp "otter-cute.gif" assets/otters/bye.gif
```

- [ ] **Step 2: Verify all four files copied correctly**

Run: `ls assets/otters/`
Expected: `hello.gif`, `blush.gif`, `peek.gif`, `bye.gif` all listed with non-zero size

- [ ] **Step 3: Remove the original files from the project root**

```bash
rm "Hello Cute Sticker - Hello Cute - Discover & Share GIFs.gif" "Daily Stickers of Cute Otter_ Animated.gif" "LINE 官方貼圖 - Daily Stickers of Cute Otter_ Animated Example with GIF Animation.gif" "otter-cute.gif"
```

- [ ] **Step 4: Commit**

```bash
git add -A assets/otters
git commit -m "chore: organize otter sticker GIFs into assets/otters"
```

---

### Task 6: HTML skeleton and base CSS theme

**Files:**
- Create: `index.html`
- Create: `css/style.css`

- [ ] **Step 1: Create `index.html` with all six scenes**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Happy 18th Birthday, Eri</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <section class="scene active" id="scene-message">
    <img class="otter otter-corner" src="assets/otters/hello.gif" alt="">
    <h1 class="script">Happy 18th Birthday, Eri</h1>
    <p class="message">
      <!-- PLACEHOLDER: replace with your own message -->
      Eighteen years of you, and every one of them has made my world better.
      Happy birthday. I love you.
    </p>
    <button class="btn" id="continue-btn">Continue</button>
  </section>

  <section class="scene" id="scene-question">
    <img class="otter otter-corner" src="assets/otters/blush.gif" alt="">
    <h2 class="script">Can we go on a date?</h2>
    <div class="question-buttons">
      <button class="btn" id="yes-btn">Yes</button>
      <button class="btn btn-secondary" id="no-btn">No</button>
    </div>
  </section>

  <section class="scene" id="scene-calendar">
    <h2 class="script">Pick a day</h2>
    <div class="calendar">
      <div class="calendar-header">
        <button class="btn btn-small" id="prev-month">&larr;</button>
        <span id="calendar-label"></span>
        <button class="btn btn-small" id="next-month">&rarr;</button>
      </div>
      <div class="calendar-grid" id="calendar-grid"></div>
    </div>
  </section>

  <section class="scene" id="scene-time">
    <h2 class="script">Pick a time</h2>
    <div class="option-buttons">
      <button class="btn time-btn" data-time="Morning">Morning</button>
      <button class="btn time-btn" data-time="Afternoon">Afternoon</button>
      <button class="btn time-btn" data-time="Evening">Evening</button>
    </div>
  </section>

  <section class="scene" id="scene-activity">
    <h2 class="script">What do you want to do?</h2>
    <div class="option-buttons">
      <button class="btn activity-btn" data-activity="Dinner">Dinner</button>
      <button class="btn activity-btn" data-activity="Movie">Movie</button>
      <button class="btn activity-btn" data-activity="Cafe / dessert">Cafe / dessert</button>
      <button class="btn activity-btn" data-activity="Outdoors">Outdoors</button>
      <button class="btn activity-btn" data-activity="Other">Other</button>
    </div>
    <input type="text" id="other-input" class="text-input" placeholder="What do you want to do?" hidden>
    <button class="btn" id="confirm-btn" disabled>Confirm</button>
  </section>

  <section class="scene" id="scene-confirmation">
    <img class="otter otter-center" id="peek-otter" src="assets/otters/peek.gif" alt="">
    <img class="otter otter-center" id="bye-otter" src="assets/otters/bye.gif" alt="" hidden>
    <h2 class="script">It's a date!</h2>
    <p id="confirmation-fallback" class="message" hidden></p>
  </section>

  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `css/style.css`**

```css
:root {
  --bg: #eaddc7;
  --heading: #8a6d3b;
  --body: #6b5637;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  font-family: Georgia, serif;
  color: var(--body);
}

.scene {
  display: none;
  min-height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.scene.active {
  display: flex;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

h1.script, h2.script {
  font-family: 'Great Vibes', cursive;
  color: var(--heading);
  font-size: clamp(2.5rem, 8vw, 4rem);
  margin: 0 0 16px;
}

.message {
  max-width: 480px;
  line-height: 1.6;
  font-size: 1.1rem;
}

.btn {
  font-family: Georgia, serif;
  background: var(--heading);
  color: var(--bg);
  border: none;
  padding: 12px 28px;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  margin: 8px;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--heading);
  color: var(--heading);
}

.btn-small {
  padding: 6px 14px;
}

.question-buttons {
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 60px;
}

#no-btn {
  position: absolute;
}

.option-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 480px;
}

.text-input {
  font-family: Georgia, serif;
  font-size: 1rem;
  padding: 10px 16px;
  border-radius: 20px;
  border: 2px solid var(--heading);
  margin: 12px 0;
  width: 100%;
  max-width: 300px;
}

.calendar {
  width: 100%;
  max-width: 340px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-cell {
  padding: 8px 0;
  border-radius: 8px;
  background: rgba(138, 109, 59, 0.1);
  cursor: pointer;
}

.calendar-cell.empty {
  background: none;
  cursor: default;
}

.calendar-cell.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.otter {
  width: 120px;
}

.otter-corner {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 90px;
}

.otter-center {
  width: 140px;
  margin-bottom: 8px;
}

@media (max-width: 480px) {
  .otter-corner {
    width: 60px;
    top: 8px;
    right: 8px;
  }
}
```

- [ ] **Step 3: Verify the page loads with only the message scene visible**

Run: `python -m http.server 8000` (from the project root), then open `http://localhost:8000/` in a browser.
Expected: Champagne-tan background, "Happy 18th Birthday, Eri" in script font, hello otter GIF in the corner, Continue button. No other scenes visible.

- [ ] **Step 4: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: add HTML skeleton for all scenes and base theme"
```

---

### Task 7: Scene wiring — message, question, and dodge

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: Implement scene-switching and the first two scenes' wiring**

```js
// js/app.js
import { getRandomDodgePosition } from './logic.js';

const state = { day: null, time: null, activity: null, otherText: '' };

function showScene(id) {
  document.querySelectorAll('.scene').forEach((el) => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.getElementById('continue-btn').addEventListener('click', () => {
  showScene('scene-question');
  setupDodge();
});

function setupDodge() {
  const scene = document.getElementById('scene-question');
  const noBtn = document.getElementById('no-btn');
  const yesBtn = document.getElementById('yes-btn');
  const container = scene.querySelector('.question-buttons');

  const rect = container.getBoundingClientRect();
  noBtn.style.left = `${yesBtn.offsetWidth + 20}px`;
  noBtn.style.top = '0px';

  function dodge() {
    const containerRect = container.getBoundingClientRect();
    const pos = getRandomDodgePosition(
      containerRect.width,
      containerRect.height,
      noBtn.offsetWidth,
      noBtn.offsetHeight
    );
    noBtn.style.left = `${pos.x}px`;
    noBtn.style.top = `${pos.y}px`;
  }

  scene.addEventListener('mousemove', (e) => {
    const btnRect = noBtn.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;
    const distance = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);
    if (distance < 80) dodge();
  });

  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dodge();
  });

  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    dodge();
  });

  document.getElementById('yes-btn').addEventListener('click', () => {
    showScene('scene-calendar');
    renderCalendar();
  }, { once: true });
}
```

- [ ] **Step 2: Manually verify in the browser**

With the local server still running, click Continue, then try to click No.
Expected: No button jumps to a new position on approach/click and is never actually clickable; Yes advances to the (currently blank) calendar scene.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: wire message and question scenes with dodging No button"
```

---

### Task 8: Calendar scene wiring

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Add calendar rendering, using `getCalendarMonth` from `js/logic.js`**

Replace the existing `import { getRandomDodgePosition } from './logic.js';` line at the top of `js/app.js` with the line below, then append the rest of this block to the end of the file:

```js
import { getRandomDodgePosition, getCalendarMonth } from './logic.js';

const today = new Date();
const todayISO = today.toISOString().slice(0, 10);
let calYear = today.getFullYear();
let calMonth = today.getMonth();

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function renderCalendar() {
  const { weeks } = getCalendarMonth(calYear, calMonth, todayISO);
  document.getElementById('calendar-label').textContent = `${MONTH_NAMES[calMonth]} ${calYear}`;

  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';
  weeks.flat().forEach((cell) => {
    const div = document.createElement('div');
    if (cell.day === null) {
      div.className = 'calendar-cell empty';
    } else {
      div.className = 'calendar-cell' + (cell.disabled ? ' disabled' : '');
      div.textContent = cell.day;
      if (!cell.disabled) {
        div.addEventListener('click', () => {
          state.day = cell.iso;
          showScene('scene-time');
        });
      }
    }
    grid.appendChild(div);
  });
}

document.getElementById('prev-month').addEventListener('click', () => {
  calMonth -= 1;
  if (calMonth < 0) { calMonth = 11; calYear -= 1; }
  renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
  calMonth += 1;
  if (calMonth > 11) { calMonth = 0; calYear += 1; }
  renderCalendar();
});
```

- [ ] **Step 2: Manually verify in the browser**

Click through to the calendar scene. Try prev/next month navigation, click a future day.
Expected: calendar shows the correct month/year label, past days in the current month are visually disabled and unclickable, clicking a valid day advances to the (currently blank) time scene.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: wire calendar day-picker scene"
```

---

### Task 9: Time and activity scene wiring

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Add time-of-day and activity wiring**

Append this block to the end of `js/app.js`:

```js
document.querySelectorAll('.time-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.time = btn.dataset.time;
    showScene('scene-activity');
  });
});

const otherInput = document.getElementById('other-input');
const confirmBtn = document.getElementById('confirm-btn');

function updateConfirmEnabled() {
  const hasActivity = state.activity && (state.activity !== 'Other' || otherInput.value.trim().length > 0);
  confirmBtn.disabled = !hasActivity;
}

document.querySelectorAll('.activity-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.activity-btn').forEach((b) => b.classList.remove('btn-secondary'));
    btn.classList.add('btn-secondary');
    state.activity = btn.dataset.activity;
    otherInput.hidden = state.activity !== 'Other';
    if (state.activity === 'Other') otherInput.focus();
    updateConfirmEnabled();
  });
});

otherInput.addEventListener('input', () => {
  state.otherText = otherInput.value;
  updateConfirmEnabled();
});
```

- [ ] **Step 2: Manually verify in the browser**

Click through to the time scene, pick a time, then pick each activity option including Other.
Expected: picking a time advances to the activity scene; picking "Other" reveals the text box and highlights the selected button; Confirm stays disabled until a non-Other activity is picked, or until text is typed for Other.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: wire time and activity picker scenes"
```

---

### Task 10: Confirmation scene, otter sequence, and Formspree submission

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Add submission handling and the confirmation scene's otter sequence**

Replace the import line at the top of `js/app.js` with the line below (adds `buildSubmissionPayload`), then append the rest of this block to the end of the file:

```js
import { getRandomDodgePosition, getCalendarMonth, buildSubmissionPayload } from './logic.js';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/REPLACE_ME';

confirmBtn.addEventListener('click', async () => {
  const payload = buildSubmissionPayload(state);
  showScene('scene-confirmation');
  playOtterSequence();

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Formspree submission failed');
  } catch (err) {
    const fallback = document.getElementById('confirmation-fallback');
    fallback.hidden = false;
    fallback.textContent = `(Couldn't send automatically — tell him: ${payload.date}, ${payload.time}, ${payload.activity})`;
  }
});

function playOtterSequence() {
  const peek = document.getElementById('peek-otter');
  const bye = document.getElementById('bye-otter');
  peek.hidden = false;
  bye.hidden = true;
  setTimeout(() => {
    peek.hidden = true;
    bye.hidden = false;
  }, 2500);
}
```

- [ ] **Step 2: Manually verify in the browser**

Complete the full flow through to Confirm.
Expected: confirmation scene shows "It's a date!", the peek otter appears first, then swaps to the bye otter after ~2.5s. With `FORMSPREE_ENDPOINT` still set to the placeholder, the fetch will fail and the fallback text should appear showing the picked date/time/activity.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: wire confirmation scene with otter sequence and Formspree submission"
```

---

### Task 11: README and deployment instructions

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# Eri's 18th Birthday Site

## Before sharing the link

1. **Write your message.** Open `index.html`, find the `<p class="message">` inside `scene-message`, and replace the placeholder text with your own.
2. **Set up Formspree** (so her picks get emailed to you):
   - Sign up free at https://formspree.io using yu.hatta3274@outlook.com.
   - Create a new form, verify the email when Formspree sends the confirmation.
   - Copy the form endpoint (looks like `https://formspree.io/f/abcdwxyz`).
   - Open `js/app.js` and replace `FORMSPREE_ENDPOINT`'s placeholder value with your real endpoint.
3. **Test locally** before deploying:
   ```bash
   python -m http.server 8000
   ```
   Open `http://localhost:8000/` and click through the whole flow, including a real Confirm submission — check that the email arrives.

## Deploying to GitHub Pages

1. Create a new GitHub repository and push this project to it:
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. On GitHub, go to the repo's **Settings → Pages**.
3. Under "Build and deployment", set **Source** to "Deploy from a branch", branch `main`, folder `/ (root)`.
4. Save. GitHub will give you a URL like `https://<username>.github.io/<repo>/` within a minute or two — that's the link to send Eri.

## Local development

- No build step. Just serve the folder with any static server (`python -m http.server`, VS Code Live Server, etc.) — opening `index.html` directly via `file://` won't work because ES modules require HTTP.
- Run unit tests with `npm test`.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add setup and deployment instructions"
```

---

### Task 12: Full manual verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the automated test suite one final time**

Run: `npm test`
Expected: all tests pass (10 tests from Tasks 2–4), exit code 0

- [ ] **Step 2: Desktop click-through**

With the local server running, open the site at a normal desktop browser width and go through all six scenes: message → question (confirm No dodges on mouse approach, Yes advances) → calendar (past dates disabled, month nav works) → time → activity (including Other) → confirmation (otter sequence plays).

- [ ] **Step 3: Mobile-width click-through**

Resize the browser to a phone width (e.g., 375px) or use browser devtools device emulation. Repeat the same click-through, confirming the No button dodges on tap and all buttons/calendar cells are usable at that width.

- [ ] **Step 4: Real end-to-end submission test**

With a real `FORMSPREE_ENDPOINT` configured (per Task 11, Step 1), complete the flow once for real and confirm the email arrives at yu.hatta3274@outlook.com with the correct date/time/activity.

- [ ] **Step 5: Final commit if any fixes were needed during verification**

```bash
git add -A
git commit -m "fix: address issues found in manual verification pass"
```

(Skip this step if no fixes were needed.)
