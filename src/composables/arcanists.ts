import { IArcanist } from '@/types';

export function sortArcanists (arcanists: IArcanist[]) {
    arcanists.sort((a: IArcanist, b: IArcanist) => {
        const rarityComparison = b.Rarity - a.Rarity

        if (rarityComparison !== 0) {
            return rarityComparison
        }

        // If rarity is the same, compare by name alphabetically
        return a.Name.localeCompare(b.Name)
    })
}
