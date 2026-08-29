// js/app.js
import { getRandomDodgePosition, getCalendarMonth, buildSubmissionPayload } from './logic.js';

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

  const yesRect = yesBtn.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  noBtn.style.left = `${yesRect.right - containerRect.left + 20}px`;
  noBtn.style.top = `${yesRect.top - containerRect.top}px`;

  let dodgeCount = 0;
  const maxYesScale = 2.5;
  const yesScaleStep = 0.15;

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

    dodgeCount += 1;
    const scale = Math.min(1 + dodgeCount * yesScaleStep, maxYesScale);
    yesBtn.style.transform = `scale(${scale})`;
  }

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
  });
}

document.getElementById('back-to-question').addEventListener('click', () => {
  showScene('scene-question');
});

const today = new Date();
const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
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
      if (cell.disabled) {
        div.setAttribute('aria-disabled', 'true');
      } else {
        div.setAttribute('tabindex', '0');
        div.setAttribute('role', 'button');
        const selectDay = () => {
          state.day = cell.iso;
          showScene('scene-time');
        };
        div.addEventListener('click', selectDay);
        div.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            if (event.key === ' ') event.preventDefault();
            selectDay();
          }
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

document.querySelectorAll('.time-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.time = btn.dataset.time;
    showScene('scene-activity');
  });
});

document.getElementById('back-to-calendar').addEventListener('click', () => {
  showScene('scene-calendar');
});

const otherInput = document.getElementById('other-input');
const confirmBtn = document.getElementById('confirm-btn');

function updateConfirmEnabled() {
  const hasActivity = state.activity && (state.activity !== 'Other' || otherInput.value.trim().length > 0);
  confirmBtn.disabled = !hasActivity;
}

document.querySelectorAll('.activity-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.activity-btn').forEach((b) => {
      b.classList.remove('btn-secondary');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('btn-secondary');
    btn.setAttribute('aria-pressed', 'true');
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

document.getElementById('back-to-time').addEventListener('click', () => {
  showScene('scene-time');
});

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
