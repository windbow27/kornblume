import { describe, expect, it } from "vitest";
import {
  isPortraitOptionDisabled,
  matchesPortrait,
} from "./portraitFilter";

describe("portrait filter", () => {
  it("matches any selected portrait count for equality", () => {
    expect(matchesPortrait(1, "=", [0, 2], null)).toBe(false);
    expect(matchesPortrait(2, "=", [0, 2], null)).toBe(true);
    expect(matchesPortrait(3, "=", [], null)).toBe(true);
  });

  it("matches portrait counts with comparison operators", () => {
    expect(matchesPortrait(2, "<", [], 3)).toBe(true);
    expect(matchesPortrait(3, "<", [], 3)).toBe(false);
    expect(matchesPortrait(4, ">", [], 3)).toBe(true);
    expect(matchesPortrait(3, ">", [], 3)).toBe(false);
  });

  it("disables impossible comparison thresholds", () => {
    expect(isPortraitOptionDisabled(0, "<")).toBe(true);
    expect(isPortraitOptionDisabled(1, "<")).toBe(false);
    expect(isPortraitOptionDisabled(5, ">")).toBe(true);
    expect(isPortraitOptionDisabled(4, ">")).toBe(false);
    expect(isPortraitOptionDisabled(0, "=")).toBe(false);
    expect(isPortraitOptionDisabled(5, "=")).toBe(false);
  });
});
