import { IArcanist, ISelectedArcanist } from '@/types';
import { usePlannerSettingsStore } from '@/stores/plannerSettingsStore';

const settingsStore = usePlannerSettingsStore();

export function formatArcanists(arcanists: IArcanist[]) {
    sortArcanists(arcanists);
    return filterUnreleasedArcanists(arcanists);
}

export function formatNoSpoilerArcanists(arcanists: IArcanist[]) {
    sortArcanists(arcanists);
    return hideUnreleasedArcanists(arcanists);
}

function sortArcanists(arcanists: IArcanist[]) {
    filterUnreleasedArcanists(arcanists);
    arcanists.sort((a: IArcanist, b: IArcanist) => {
        const rarityComparison = b.Rarity - a.Rarity;

        if (rarityComparison !== 0) {
            return rarityComparison;
        }

        // If rarity is the same, compare by name alphabetically
        return a.Name.localeCompare(b.Name);
    });
}

export function sortSelectedArcanists(
    selectedArcanists: ISelectedArcanist[],
    arcanists: IArcanist[]
) {
    selectedArcanists.sort((a: ISelectedArcanist, b: ISelectedArcanist) => {
        const aArcanist = arcanists.find((arcanist: IArcanist) => arcanist.Id === a.Id);
        const bArcanist = arcanists.find((arcanist: IArcanist) => arcanist.Id === b.Id);

        if (aArcanist && bArcanist) {
            const rarityComparison = bArcanist.Rarity - aArcanist.Rarity;

            if (rarityComparison !== 0) {
                return rarityComparison;
            }

            // If rarity is the same, compare by name alphabetically
            return aArcanist.Name.localeCompare(bArcanist.Name);
        }

        return 0;
    });
}

function filterUnreleasedArcanists(arcanists: IArcanist[]): IArcanist[] {
    return arcanists.filter((arcanist: IArcanist) =>
        settingsStore.settings.showUnreleasedArcanists ? true : arcanist.IsReleased
    );
}

function hideUnreleasedArcanists(arcanists: IArcanist[]): IArcanist[] {
    return arcanists.filter((arcanist: IArcanist) => arcanist.IsReleased);
}
