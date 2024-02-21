import { IArcanist } from '@/types';
import { usePlannerSettingsStore } from '@/stores/plannerSettingsStore';

const settingsStore = usePlannerSettingsStore()

export function formatArcanists (arcanists: IArcanist[]) {
    sortArcanists(arcanists);
    return filterUnreleasedArcanists(arcanists);
}

function sortArcanists (arcanists: IArcanist[]) {
    filterUnreleasedArcanists(arcanists)
    arcanists.sort((a: IArcanist, b: IArcanist) => {
        const rarityComparison = b.Rarity - a.Rarity

        if (rarityComparison !== 0) {
            return rarityComparison
        }

        // If rarity is the same, compare by name alphabetically
        return a.Name.localeCompare(b.Name)
    })
}

function filterUnreleasedArcanists (arcanists: IArcanist[]): IArcanist[] {
    return arcanists.filter((arcanist: IArcanist) =>
        (settingsStore.settings.showUnreleasedArcanists ? true : arcanist.IsReleased)
    );
}
