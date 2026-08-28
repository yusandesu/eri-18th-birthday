// js/app.js
import { getRandomDodgePosition, getCalendarMonth } from './logic.js';

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
