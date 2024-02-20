export interface IStage {
    id: number,
    name: string,
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
