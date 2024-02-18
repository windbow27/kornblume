import { getStageImagePathByStage } from './images'

export interface INormalizedStage {
    stage: string,
    stageImagePath: string,
}

export function normalizeDisplayStage (unprocessedStage, stageName: string): INormalizedStage {
    const result = {
        stage: stageName,
        stageImagePath: getStageImagePathByStage(unprocessedStage.id)
    };
    return result;
}
