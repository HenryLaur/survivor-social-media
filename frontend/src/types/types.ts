export enum ItemType {
  WATER = 'water',
  FOOD = 'food',
  MEDICATION = 'medication',
  AMMUNITION = 'ammunition',
}

export interface ILocation {
  latitude: number;
  longitude: number;
}

export interface IItem {
  id: number;
  name: ItemType;
  points: number;
  quantity: number;
}

export enum Gender {
  male = 'male',
  female = 'female',
  other = 'other',
}

export interface IInventory {
  water: number;
  food: number;
  medication: number;
  ammunition: number;
}

export interface ISurvivor {
  id: number;
  name: string;
  age: number;
  gender: string;
  latitude: number;
  longitude: number;
  inventory: IInventory;
  infected: boolean;
  reporters: number[];
}

export interface ITradeItem {
  survivor_id: number;
  items: IInventory;
}

export interface ITrade {
  trader1: ITradeItem;
  trader2: ITradeItem;
}
