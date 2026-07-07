import { DataSource } from 'typeorm';
export declare class BusinessSeederService {
    private dataSource;
    constructor(dataSource: DataSource);
    seedAll(): Promise<void>;
    private seedRestaurants;
    private seedDrivers;
}
