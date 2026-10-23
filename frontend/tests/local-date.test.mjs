// Run: npm test   (Node >= 22.18 / 24 strips TypeScript types natively)
//
// "Today" in the UI must be the user's local calendar day, not the UTC day.
// Fixed clock: 2026-10-23T17:30:00Z = 2026-10-24 01:30 in Asia/Shanghai.
// The suite pins process.env.TZ itself, so it gives the same result on any machine.
import { test, mock, before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { localDateKey } from "../src/lib/date.ts";

const originalTZ = process.env.TZ;
before(() => {
  process.env.TZ = "Asia/Shanghai";
});
after(() => {
  if (originalTZ === undefined) delete process.env.TZ;
  else process.env.TZ = originalTZ;
});
beforeEach(() => {
  mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-10-23T17:30:00Z") });
});
afterEach(() => {
  mock.timers.reset();
});

test("precondition: process runs in Asia/Shanghai at 01:30 on the 24th", () => {
  assert.equal(new Date().getDate(), 24);
  assert.equal(new Date().getHours(), 1);
});

test("localDateKey returns the local date, not the UTC date", () => {
  assert.equal(localDateKey(), "2026-10-24");
  assert.equal(new Date().toISOString().split("T")[0], "2026-10-23"); // the old, wrong value
});

test("localDateKey zero-pads month and day", () => {
  assert.equal(localDateKey(new Date(2026, 0, 5, 23, 59)), "2026-01-05");
  assert.equal(localDateKey(new Date(2026, 11, 31, 0, 1)), "2026-12-31");
});

// The pages are .tsx and cannot be imported by node:test, so check their source:
// every "today" must come from localDateKey(), never from toISOString().
const pages = [
  ["src/app/dashboard/page.tsx", 1],
  ["src/app/exam/page.tsx", 1],
  ["src/app/plan/page.tsx", 2],
];
for (const [rel, expected] of pages) {
  test(`${rel} derives "today" from localDateKey() (${expected} use)`, () => {
    const src = readFileSync(fileURLToPath(new URL(`../${rel}`, import.meta.url)), "utf8");
    const utc = src.match(/new Date\(\)\.toISOString\(\)[^\n]*/g) ?? [];
    assert.deepEqual(utc, [], `${rel} still computes "today" from the UTC date`);
    const uses = src.match(/localDateKey\(\)/g) ?? [];
    assert.equal(uses.length, expected, `${rel}: expected ${expected} localDateKey() call(s)`);
    assert.ok(/import \{ localDateKey \} from "@\/lib\/date";/.test(src), `${rel}: missing import of localDateKey`);
  });
}

test("exam page fills the default date after mount, not in the prerendered initial state", () => {
  const src = readFileSync(fileURLToPath(new URL("../src/app/exam/page.tsx", import.meta.url)), "utf8");
  assert.ok(!/useState\(\s*localDateKey\(\)\s*\)/.test(src), "useState(localDateKey()) bakes the build date into the static HTML");
  assert.ok(/useState\(""\)/.test(src) && /setExamDate\(\(d\) => d \|\| localDateKey\(\)\)/.test(src), "exam date must be set from localDateKey() inside an effect");
});
