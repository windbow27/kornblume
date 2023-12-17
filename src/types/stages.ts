interface IStage {
    id: number,
    runs: number,
    count: number, // runs
    drops: {
        [materialKey: string]: number,
    }
}

export interface IStages {
    [key: string]: IStage
}
