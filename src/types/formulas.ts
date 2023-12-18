interface IFormula {
    Id: number,
    Name: string,
    Rarity: number,
    Material: string[],
    Quantity: number[],
}

export interface IFormulas extends Array<IFormula>{}
