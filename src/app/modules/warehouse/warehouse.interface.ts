export interface IWarehouse {
    name: string;
    location: string;
    capacity: number;
    isDeleted?:boolean;
}