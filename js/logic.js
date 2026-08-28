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

export function getRandomDodgePosition(containerW, containerH, btnW, btnH, rng = Math.random) {
  const maxX = Math.max(containerW - btnW, 0);
  const maxY = Math.max(containerH - btnH, 0);
  return {
    x: Math.round(rng() * maxX),
    y: Math.round(rng() * maxY),
  };
}

export function buildSubmissionPayload({ day, time, activity, otherText }) {
  const finalActivity = activity === 'Other' ? (otherText || '').trim() : activity;
  return { date: day, time, activity: finalActivity };
}
