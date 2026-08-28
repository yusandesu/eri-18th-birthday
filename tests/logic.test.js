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
