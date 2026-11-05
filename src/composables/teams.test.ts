import { describe, it, expect } from "vitest";
import { resolveTeam } from "./teams";
import type { IArcanist, ITeam } from "@/types";

const arcanists = [
  { Id: 1, Name: "Tooth Fairy" },
  { Id: 2, Name: "Rhiannon" },
  { Id: 3, Name: "Aleph" },
] as unknown as IArcanist[];

const team: ITeam = {
  name: "T",
  tier: "S",
  damageType: "physical",
  slots: [
    [{ name: "Aleph", slug: "aleph" }],
    [
      { name: "Rhiannon", slug: "rhiannon" },
      { name: "Tooth  Fairy", slug: "tooth-fairy" },
    ],
    [{ name: "Unknown", slug: "unknown" }],
  ],
};

describe("resolveTeam", () => {
  it("counts a slot as owned if any alternative is owned", () => {
    const r = resolveTeam(team, arcanists, (id) => id === 1);
    expect(r.ownedCount).toBe(1);
    expect(r.total).toBe(3);
    expect(r.slots[1].owned).toBe(true);
    expect(r.slots[0].owned).toBe(false);
  });

  it("treats unmatched names as not owned", () => {
    const r = resolveTeam(team, arcanists, () => true);
    expect(r.slots[2].options[0].arcanistId).toBeNull();
    expect(r.ownedCount).toBe(2);
  });
});
