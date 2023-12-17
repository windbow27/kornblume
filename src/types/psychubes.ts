interface IAmplification {
    Id: number,
    Effect: string,
}

interface IPsychube {
    Id: number,
    IsReleased: boolean,
    Name: string,
    Rarity: number,
    Tag: string,
    Impression: string,
    Amplification: IAmplification[] | null
}

export interface IPsychubes extends Array<IPsychube>{}
