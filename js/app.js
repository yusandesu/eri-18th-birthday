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
