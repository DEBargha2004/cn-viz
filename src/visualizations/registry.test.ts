import { test, expect } from "vitest";
import { vizRegistry } from "./registry";

test("every registered viz has a well-formed vizMeta", () => {
  for (const [key, entry] of Object.entries(vizRegistry)) {
    expect(entry.meta.key).toBe(key);
    expect(entry.meta.title).toBeTruthy();
    expect(["svg", "canvas", "html"]).toContain(entry.meta.renderer);
    for (const param of entry.meta.params ?? []) {
      expect(param.key).toBeTruthy();
      if (param.type === "number") {
        expect(param.min).toBeLessThanOrEqual(param.max);
      }
    }
  }
});

test("no duplicate vizKeys across files", () => {
  const keys = Object.keys(vizRegistry);
  expect(new Set(keys).size).toBe(keys.length);
});
