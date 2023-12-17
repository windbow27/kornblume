interface IStock {
    Material: string,
    Quantity: number
}

interface IShop {
    [shopVersion: string]: IStock[],
}

export interface IShops extends Array<IShop>{}
