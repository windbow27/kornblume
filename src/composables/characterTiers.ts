import type {
  IArcanist,
  ICharacterTier,
  ICharacterTierRole,
} from "@/types";
import { normalizeName } from "@/utils/teamMatching";

export interface IResolvedCharacterTierEntry {
  character: ICharacterTier;
  arcanistId: number | null;
  owned: boolean;
}

export interface ICharacterTierGroup {
  tier: string;
  roles: {
    role: ICharacterTierRole;
    characters: IResolvedCharacterTierEntry[];
  }[];
}

const roleOrder: ICharacterTierRole[] = [
  "damage-dealer",
  "sub-carry",
  "support",
  "survival",
];

export function resolveCharacterTiers(
  characters: ICharacterTier[],
  arcanists: IArcanist[],
  isOwned: (id: number) => boolean,
  onlyOwned = false,
): ICharacterTierGroup[] {
  const arcanistsByName = new Map(
    arcanists.map((arcanist) => [normalizeName(arcanist.Name), arcanist]),
  );
  const tiers = new Map<string, IResolvedCharacterTierEntry[]>();

  for (const character of characters) {
    const arcanist = arcanistsByName.get(normalizeName(character.name));
    const owned = !!arcanist && isOwned(arcanist.Id);
    if (onlyOwned && !owned) {
      continue;
    }

    if (!tiers.has(character.tier)) {
      tiers.set(character.tier, []);
    }
    tiers.get(character.tier)!.push({
      character,
      arcanistId: arcanist?.Id ?? null,
      owned,
    });
  }

  return [...tiers.entries()].map(([tier, tierCharacters]) => ({
    tier,
    roles: roleOrder
      .map((role) => ({
        role,
        characters: tierCharacters.filter(
          (entry) => entry.character.role === role,
        ),
      }))
      .filter((group) => group.characters.length > 0),
  }));
}
