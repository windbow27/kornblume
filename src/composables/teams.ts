import type { IArcanist, ITeam } from '@/types';
import { normalizeName } from '@/utils/teamMatching';

export interface IResolvedOption {
  name: string;
  arcanistId: number | null;
  owned: boolean;
}

export interface IResolvedSlot {
  options: IResolvedOption[];
  owned: boolean;
}

export interface IResolvedTeam {
  team: ITeam;
  slots: IResolvedSlot[];
  ownedCount: number;
  total: number;
}

export function resolveTeam(
  team: ITeam,
  arcanists: IArcanist[],
  isOwned: (id: number) => boolean
): IResolvedTeam {
  const byName = new Map(arcanists.map((a) => [normalizeName(a.Name), a.Id]));
  const slots = team.slots.map((slot) => {
    const options = slot.map((c) => {
      const arcanistId = byName.get(normalizeName(c.name)) ?? null;
      return { name: c.name, arcanistId, owned: arcanistId !== null && isOwned(arcanistId) };
    });
    return { options, owned: options.some((o) => o.owned) };
  });
  return {
    team,
    slots,
    ownedCount: slots.filter((s) => s.owned).length,
    total: slots.length
  };
}
