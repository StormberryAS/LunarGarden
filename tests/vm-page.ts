// Runs the page's two scripts, suncalc.js and then the compiled app.js, in a fresh node:vm context,
// one global scope as in a browser, with a stub of the few page parts app.js touches and a clock
// fixed at a given instant. No browser and no DOM library: app.js is a classic script that does all
// its work on DOMContentLoaded, so it cannot be imported; this runs it as the page does.

import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

/** A page element with only what app.js uses. */
class StubElement {
  textContent = '';
  readonly children = new Map<string, StubElement>();
  readonly listeners = new Map<string, () => void>();
  readonly id: string;
  constructor(id: string) { this.id = id; }
  querySelector(selector: string): StubElement | null { return this.children.get(selector) ?? null; }
  addEventListener(type: string, fn: () => void): void { this.listeners.set(type, fn); }
}

/** What the page shows and what the export button hands over, after the scripts have run. */
export interface PageRun {
  phaseName: string;
  illum: string;
  task: string;
  cards: { title: string; date: string; task: string }[];
  /** The .ics text of one press of the export button, and its file name. */
  ics: string;
  download: string;
}

/**
 * Loads suncalc.js and app.js from root (a directory URL), fires DOMContentLoaded at the instant
 * now, presses the export button once and returns what was shown and exported.
 */
export function runPage(root: URL, now: number): PageRun {
  const ids = ['current-phase-name', 'current-phase-illum', 'current-phase-desc', 'current-task-desc', 'export-ics-btn'];
  const els = new Map<string, StubElement>(ids.map((id) => [id, new StubElement(id)]));
  for (let i = 0; i < 4; i++) {
    const card = new StubElement(`card-${i}`);
    for (const c of ['.phase-title', '.phase-date', '.phase-task']) card.children.set(c, new StubElement(''));
    els.set(card.id, card);
  }
  const docListeners = new Map<string, () => void>();
  const blobs: string[] = [];
  let download = '';
  let clicks = 0;

  // The clock: new Date() and Date.now() give the fixed instant; every other use is the real Date.
  class FixedDate extends Date {
    constructor(value?: number | string | Date) {
      if (value === undefined) super(now); else super(value);
    }
    static override now(): number { return now; }
  }

  const sandbox = {
    Date: FixedDate,
    document: {
      getElementById: (id: string): StubElement | null => els.get(id) ?? null,
      addEventListener: (type: string, fn: () => void): void => { docListeners.set(type, fn); },
      createElement: (tag: string) => {
        if (tag !== 'a') throw new Error(`unexpected element ${tag}`);
        const a = { href: '', download: '', click: (): void => { clicks++; download = a.download; } };
        return a;
      },
      body: { appendChild: (): void => {}, removeChild: (): void => {} },
    },
    Blob: class {
      constructor(parts: string[]) { blobs.push(parts.join('')); }
    },
    URL: { createObjectURL: (): string => 'blob:stub', revokeObjectURL: (): void => {} },
  };
  const context = createContext(sandbox);
  runInContext('var window = globalThis;', context);
  for (const file of ['suncalc.js', 'app.js']) {
    runInContext(readFileSync(new URL(file, root), 'utf8'), context, { filename: file });
  }
  const ready = docListeners.get('DOMContentLoaded');
  if (!ready) throw new Error('app.js did not wait for DOMContentLoaded');
  ready();
  const press = els.get('export-ics-btn')?.listeners.get('click');
  if (!press) throw new Error('the export button has no click handler');
  press();
  if (clicks !== 1 || blobs.length !== 1) throw new Error(`one press gave ${clicks} downloads and ${blobs.length} files`);

  const text = (id: string): string => els.get(id)?.textContent ?? '';
  const part = (i: number, c: string): string => els.get(`card-${i}`)?.children.get(c)?.textContent ?? '';
  return {
    phaseName: text('current-phase-name'),
    illum: text('current-phase-illum'),
    task: text('current-task-desc'),
    cards: [0, 1, 2, 3].map((i) => ({ title: part(i, '.phase-title'), date: part(i, '.phase-date'), task: part(i, '.phase-task') })),
    ics: blobs[0] ?? '',
    download,
  };
}
