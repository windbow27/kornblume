interface IMaterialNeeds {
    Id: number,
    Material: string[],
    Quantity: number[],
    Type?: string
}

interface Frequency {
    Id: number,
    Type: string
}

interface IInsight extends Array<IMaterialNeeds>{}

interface IResonance extends Array<IMaterialNeeds>{}

interface IFrequency extends Array<IMaterialNeeds>{}

interface IEuphoria extends Array<IMaterialNeeds>{}

interface IMastery extends Array<IMaterialNeeds>{}

export interface IArcanist {
    Afflatus: string,
    Id: number,
    Insight: IInsight,
    IsReleased: boolean,
    Name: string,
    Rarity: number,
    Resonance: IResonance,
    Frequency: IFrequency,
    Euphoria: IEuphoria,
    Mastery: IMastery,
}

export interface IArcanists extends Array<IArcanist>{}

// for planner
export interface ISelectedArcanist {
    Id: number;
    isVisible: boolean;
    currentInsight: number;
    currentLevel: number;
    goalInsight: number;
    goalLevel: number;
    currentResonance: number;
    goalResonance: number;
    frequency: Frequency[];
    euphoria: number[];
    mastery: number;
}
