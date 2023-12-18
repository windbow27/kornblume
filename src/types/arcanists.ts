interface IMaterialNeeds {
    Id: number,
    Material: string[],
    Quantity: number[],
}

interface IInsight extends Array<IMaterialNeeds>{}

interface IResonance extends Array<IMaterialNeeds>{}

export interface IArcanist {
    Afflatus: string,
    Id: number,
    Insight: IInsight,
    IsReleased: boolean,
    Name: string,
    Rarity: number,
    Resonance: IResonance,
}

export interface IArcanists extends Array<IArcanist>{}

// for planner
export interface ISelectedArcanist {
    Id: number,
    isVisible: boolean,
    currentInsight: number,
    currentLevel: number,
    goalInsight: number,
    goalLevel: number,
    currentResonance: number,
    goalResonance: number
}
