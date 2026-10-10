import { Repository } from 'typeorm';
import { SurgeZoneEntity } from '../../db/entities/surge-zone.entity';
export interface ETAResponse {
    duration: number;
    distance: number;
    surgeMultiplier: number;
}
export interface RerouteResponse {
    routes: Array<{
        coordinates: {
            lat: number;
            lng: number;
        }[];
        duration: number;
        distance: number;
        trafficImpact: number;
    }>;
}
export interface HeatmapPoint {
    lat: number;
    lng: number;
    weight: number;
}
export declare class MapsService {
    private surgeZoneRepo;
    constructor(surgeZoneRepo: Repository<SurgeZoneEntity>);
    calculateETA(origin: {
        lat: number;
        lng: number;
    }, destination: {
        lat: number;
        lng: number;
    }): Promise<ETAResponse>;
    calculateSurgeETA(origin: {
        lat: number;
        lng: number;
    }, destination: {
        lat: number;
        lng: number;
    }): Promise<ETAResponse>;
    getReroutingOptions(origin: {
        lat: number;
        lng: number;
    }, destination: {
        lat: number;
        lng: number;
    }, waypoints?: {
        lat: number;
        lng: number;
    }[]): Promise<RerouteResponse>;
    getHeatmapData(bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
    }, zoom: number): Promise<HeatmapPoint[]>;
    getSurgeZones(): Promise<SurgeZoneEntity[]>;
    isAddressInSurgeZone(lat: number, lng: number): Promise<{
        inSurgeZone: boolean;
        multiplier?: number;
        zoneName?: string;
    }>;
    private calculateDistance;
    private calculateSurgeMultiplier;
}
