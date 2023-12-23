export interface IItem {
    Category: string,
    Description:string,
    Id:number,
    IsReleased:boolean,
    Name:string,
    Rarity:number,
    Source:string,
    Usage:string,
}

export interface IItems extends Array<IItem>{}

export interface IMaterialUnit {
    Material: string,
    Quantity: number
}
