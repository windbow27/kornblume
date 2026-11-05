import { describe, expect, it } from "vitest";
import type { IArcanist, ICharacterTier } from "@/types";
import { resolveCharacterTiers } from "./characterTiers";

const arcanists = [
  { Id: 1, Name: "Tooth Fairy" },
  { Id: 2, Name: "Beryl" },
] as IArcanist[];

const characters: ICharacterTier[] = [
  {
    name: "Tooth  Fairy",
    slug: "tooth-fairy",
    tier: "S+",
    role: "support",
    tags: "HEAL",
  },
  {
    name: "Beryl",
    slug: "beryl",
    tier: "S+",
    role: "damage-dealer",
    tags: "GLOW",
  },
  {
    name: "Unknown",
    slug: "unknown",
    tier: "A",
    role: "survival",
    tags: "",
  },
];

describe("resolveCharacterTiers", () => {
  it("groups characters by tier and role in display order", () => {
    const groups = resolveCharacterTiers(characters, arcanists, () => false);

    expect(groups.map((group) => group.tier)).toEqual(["S+", "A"]);
    expect(groups[0].roles.map((group) => group.role)).toEqual([
      "damage-dealer",
      "support",
    ]);
    expect(groups[0].roles[1].characters[0]).toMatchObject({
      arcanistId: 1,
      owned: false,
      character: { name: "Tooth  Fairy" },
    });
  });

  it("filters to owned characters and omits empty tiers", () => {
    const groups = resolveCharacterTiers(
      characters,
      arcanists,
      (id) => id === 2,
      true,
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].tier).toBe("S+");
    expect(groups[0].roles).toHaveLength(1);
    expect(groups[0].roles[0].role).toBe("damage-dealer");
    expect(groups[0].roles[0].characters[0]).toMatchObject({
      arcanistId: 2,
      owned: true,
    });
  });

  it("marks unmatched characters unowned and keeps them unless filtered", () => {
    const groups = resolveCharacterTiers(characters, arcanists, () => true);
    const unmatched = groups[1].roles[0].characters[0];

    expect(unmatched).toMatchObject({ arcanistId: null, owned: false });
    expect(
      resolveCharacterTiers(characters, arcanists, () => true, true),
    ).toHaveLength(1);
  });
});
