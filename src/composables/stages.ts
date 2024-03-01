import { getStageImagePathByStage } from './images'
import { IMaterialUnit, IStage } from '@/types'

export interface INormalizedStage {
    stage: string,
    stageImagePath: string,
}

export function normalizeDisplayStage (unprocessedStage: IStage, stageName: string): INormalizedStage {
    const result = {
        stage: stageName,
        stageImagePath: getStageImagePathByStage(unprocessedStage.id)
    };
    return result;
}

// export function normalizeDrops (unprocessedStage: IStage): IMaterialUnit[] {
//     if (!unprocessedStage.drops) {
//         return [];
//     }

//     return Object.entries(unprocessedStage.drops).map(([Material, Quantity]) => {
//         const materialUnit: IMaterialUnit = {
//             Material,
//             Quantity: Quantity as number
//         };

//         return materialUnit;
//     });
// }

export function normalizeDrops (unprocessedStage: IStage): IMaterialUnit[] {
    if (!unprocessedStage.drops) {
        return [];
    }

    return Object.entries(unprocessedStage.drops).map(([Material, Quantity]) => {
        const materialUnit: IMaterialUnit = {
            Material,
            Quantity: (Quantity / unprocessedStage.count) as number
        };

        return materialUnit;
    });
}
