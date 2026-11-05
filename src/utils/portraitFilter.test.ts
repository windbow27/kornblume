import { describe, expect, it } from "vitest";
import {
  isPortraitOptionDisabled,
  matchesPortrait,
  PortraitFilterOperations,
} from "./portraitFilter";

describe("portrait filter", () => {
  it("matches any selected portrait count for equality", () => {
    expect(matchesPortrait(1, PortraitFilterOperations.Equals, [0, 2], null)).toBe(false);
    expect(matchesPortrait(2, PortraitFilterOperations.Equals, [0, 2], null)).toBe(true);
    expect(matchesPortrait(3, PortraitFilterOperations.Equals, [], null)).toBe(true);
  });

  it("matches portrait counts with comparison operators", () => {
    expect(matchesPortrait(2, PortraitFilterOperations.LessThan, [], 3)).toBe(true);
    expect(matchesPortrait(3, PortraitFilterOperations.LessThan, [], 3)).toBe(false);
    expect(matchesPortrait(4, PortraitFilterOperations.GreaterThan, [], 3)).toBe(true);
    expect(matchesPortrait(3, PortraitFilterOperations.GreaterThan, [], 3)).toBe(false);
  });

  it("disables impossible comparison thresholds", () => {
    expect(isPortraitOptionDisabled(0, PortraitFilterOperations.LessThan)).toBe(true);
    expect(isPortraitOptionDisabled(1, PortraitFilterOperations.LessThan)).toBe(false);
    expect(isPortraitOptionDisabled(5, PortraitFilterOperations.GreaterThan)).toBe(true);
    expect(isPortraitOptionDisabled(4, PortraitFilterOperations.GreaterThan)).toBe(false);
    expect(isPortraitOptionDisabled(0, PortraitFilterOperations.Equals)).toBe(false);
    expect(isPortraitOptionDisabled(5, PortraitFilterOperations.Equals)).toBe(false);
  });
});
