export interface IStage {
    id: number,
    category: string,
    cost: number,
    count: number, // runs
    drops: {
        [materialKey: string]: number,
    }
}

export interface IStages {
    [key: string]: IStage
}
