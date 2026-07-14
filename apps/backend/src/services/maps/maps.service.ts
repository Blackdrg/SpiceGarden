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
    const surgeZones = await this.surgeZoneRepo.find({ where: { isActive: true } });

    const points: HeatmapPoint[] = [];
    for (const zone of surgeZones) {
      for (const coord of zone.polygon) {
        if (coord.lat >= bounds.south && coord.lat <= bounds.north && coord.lng >= bounds.west && coord.lng <= bounds.east) {
          points.push({
            lat: coord.lat,
            lng: coord.lng,
            weight: Number(zone.multiplier),
          });
        }
      }
    }

    return points;
  }

  async getSurgeZones(): Promise<SurgeZoneEntity[]> {
    return this.surgeZoneRepo.find({ where: { isActive: true } });
  }

  async isAddressInSurgeZone(lat: number, lng: number): Promise<{ inSurgeZone: boolean; multiplier?: number; zoneName?: string }> {
    const surgeZones = await this.surgeZoneRepo.find({ where: { isActive: true } });

    for (const zone of surgeZones) {
      if (this.isPointInPolygon({ lat, lng }, zone.polygon)) {
        return {
          inSurgeZone: true,
          multiplier: Number(zone.multiplier),
          zoneName: zone.name,
        };
      }
    }

    return { inSurgeZone: false };
  }

  private isPointInPolygon(point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;

      const intersect = ((yi > point.lng) !== (yj > point.lng)) &&
        (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
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
    const surgeZones = await this.surgeZoneRepo.find({ where: { isActive: true } });

    let maxMultiplier = 1.0;
    for (const zone of surgeZones) {
      if (this.isPointInPolygon(origin, zone.polygon) || this.isPointInPolygon(destination, zone.polygon)) {
        const multiplier = Number(zone.multiplier);
        if (multiplier > maxMultiplier) {
          maxMultiplier = multiplier;
        }
      }
    }

    return maxMultiplier;
  }
}