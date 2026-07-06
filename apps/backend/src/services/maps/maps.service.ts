import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurgeZoneEntity } from '../../db/entities/surge-zone.entity';

export interface ETAResponse {
  duration: number; // minutes
  distance: number; // meters
  surgeMultiplier: number;
}

export interface RerouteResponse {
  routes: Array<{
    coordinates: { lat: number; lng: number }[];
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

@Injectable()
export class MapsService {
  constructor(
    @InjectRepository(SurgeZoneEntity)
    private surgeZoneRepo: Repository<SurgeZoneEntity>,
  ) {}

  async calculateETA(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<ETAResponse> {
    const surge = await this.calculateSurgeMultiplier(origin, destination);
    const distance = this.calculateDistance(origin, destination);
    const duration = Math.round(distance / 80); // ~80 m/s average speed

    return {
      duration,
      distance,
      surgeMultiplier: surge,
    };
  }

  async calculateSurgeETA(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<ETAResponse> {
    const surge = await this.calculateSurgeMultiplier(origin, destination);
    const distance = this.calculateDistance(origin, destination);
    const duration = Math.round(distance / 70); // ~70 m/s in traffic

    return {
      duration,
      distance,
      surgeMultiplier: surge,
    };
  }

  async getReroutingOptions(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints?: { lat: number; lng: number }[]
  ): Promise<RerouteResponse> {
    return {
      routes: [
        {
          coordinates: [origin, destination],
          duration: Math.round(this.calculateDistance(origin, destination) / 80),
          distance: this.calculateDistance(origin, destination),
          trafficImpact: 0.2,
        },
      ],
    };
  }

  async getHeatmapData(bounds: { north: number; south: number; east: number; west: number }, zoom: number): Promise<HeatmapPoint[]> {
    return [];
  }

  async getSurgeZones(): Promise<SurgeZoneEntity[]> {
    return this.surgeZoneRepo.find({ where: { isActive: true } });
  }

  async isAddressInSurgeZone(lat: number, lng: number): Promise<{ inSurgeZone: boolean; multiplier?: number; zoneName?: string }> {
    return { inSurgeZone: false };
  }

  private calculateDistance(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
    const R = 6371e3; // Earth radius in meters
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;

    const haversine = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    return R * c;
  }

  private async calculateSurgeMultiplier(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<number> {
    return 1.0;
  }
}