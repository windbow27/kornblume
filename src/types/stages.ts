interface IStage {
    id: number,
    cost: number,
    count: number, // runs
    drops: {
        [materialKey: string]: number,
    }
}

export interface IStages {
    [key: string]: IStage
}
