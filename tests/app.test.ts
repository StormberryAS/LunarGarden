// The page logic, run as the page runs it (tests/vm-page.ts): suncalc.js, then the compiled app.js,
// with the clock fixed at 5 November 2026 12:00 in Oslo. The expected values are what the
// JavaScript before the move to TypeScript (commit 36ae0e2) showed and exported at that instant.

process.env.TZ = 'Europe/Oslo';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runPage } from './vm-page.ts';

const NOW = Date.parse('2026-11-05T11:00:00Z');

const NAMES = [
  'New Moon (Waxing Crescent)',
  'First Quarter (Waxing Gibbous)',
  'Full Moon (Waning Gibbous)',
  'Last Quarter (Waning Crescent)',
];
const ADVICE = [
  'Plant above-ground leafy annuals (Lettuce, Spinach, Cabbage). High sap flow encourages leafy growth.',
  'Plant above-ground fruiting annuals (Tomatoes, Beans, Peppers). Strong moonlight promotes sturdy development.',
  'Plant root crops and perennials (Carrots, Onions, Trees). Sap flows downward, encouraging root growth.',
  'Resting period. Optimal for pruning, weeding, pest control, and harvesting.',
];
const SHORT = ['Plant leafy greens', 'Plant fruiting crops', 'Plant root crops', 'Prune, weed & harvest'];

/** The next four quarters from the fixed instant: quarter, first day, and the day 7 days on. */
const FORECAST: [number, string, string][] = [
  [0, '2026-11-09', '2026-11-16'],
  [1, '2026-11-17', '2026-11-24'],
  [2, '2026-11-25', '2026-12-02'],
  [3, '2026-12-01', '2026-12-08'],
];

const at = (i: number, list: string[]): string => {
  const v = list[i];
  if (v === undefined) throw new Error(`no entry ${i}`);
  return v;
};
/** The card's date text for a day at noon in Oslo, in the locale of this run (as the page does). */
const shown = (day: string): string => new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const page = runPage(new URL('../', import.meta.url), NOW);

test('today: the last quarter, 87.7% of the cycle, and its task', () => {
  assert.equal(page.phaseName, at(3, NAMES));
  assert.equal(page.illum, '87.7% Cycle');
  assert.equal(page.task, at(3, ADVICE));
});

test('the timeline: the next four quarters, each shown from its first day for 7 days', () => {
  assert.deepEqual(page.cards, FORECAST.map(([q, start, end]) => ({
    title: at(q, NAMES),
    date: `${shown(start)} \u2014 ${shown(end)}`,
    task: at(q, ADVICE),
  })));
});

test('the export: one .ics file with the four quarters as all-day events', () => {
  assert.equal(page.download, 'Lunar_Planting_Forecast.ics');
  const events = FORECAST.map(([q, start, end]) => {
    const s = start.replaceAll('-', '');
    return [
      'BEGIN:VEVENT',
      `UID:${s}-stormberry-lunargarden`,
      'DTSTAMP:20261105T110000Z',
      `DTSTART;VALUE=DATE:${s}`,
      `DTEND;VALUE=DATE:${end.replaceAll('-', '')}`,
      `SUMMARY:Lunar Planting: ${at(q, SHORT)}`,
      `DESCRIPTION:${at(q, NAMES)}. ${at(q, ADVICE)} (Computed entirely offline via locally hosted SunCalc astronomical algorithms by Stormberry AS)`,
      'END:VEVENT',
    ].join('\r\n');
  });
  assert.equal(page.ics, `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Stormberry//LunarGarden//EN\r\n${events.join('\r\n')}\r\nEND:VCALENDAR`);
});
