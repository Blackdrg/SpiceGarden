import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurgeZoneEntity } from '../../db/entities/surge-zone.entity';
import { ConfigService } from '@nestjs/config';

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
  private readonly logger = new Logger(MapsService.name);

constructor(
    @InjectRepository(SurgeZoneEntity)
    private surgeZoneRepo: Repository<SurgeZoneEntity>,
    private configService: ConfigService,
  ) {}

  private async googleMapsRequest<T>(endpoint: string, params: Record<string, string>): Promise<T | null> {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY', '');
    if (!apiKey) {
      this.logger.warn('Google Maps API key not configured; falling back to local ETA');
      return null;
    }

    try {
      const url = new URL(`https://maps.googleapis.com/maps/api/${endpoint}/json`);
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
      const response = await fetch(url.toString());
      if (!response.ok) return null;
      const data = (await response.json()) as T;
      return data;
    } catch (error) {
      this.logger.error(`Google Maps API error: ${endpoint}`, error);
      return null;
    }
  }

  async calculateETA(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<ETAResponse> {
    const [surge, directions] = await Promise.all([
      this.calculateSurgeMultiplier(origin, destination),
      this.googleMapsRequest<{ routes?: Array<{ legs?: Array<{ distance?: { value: number }; duration?: { value: number } }> }> }>('directions', {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        key: this.configService.get<string>('GOOGLE_MAPS_API_KEY', ''),
      }),
    ]);

    if (directions?.routes?.[0]?.legs?.[0]) {
      const leg = directions.routes[0].legs[0];
      return {
        duration: Math.round((leg.duration?.value ?? 0) / 60),
        distance: leg.distance?.value ?? this.calculateDistance(origin, destination),
        surgeMultiplier: surge,
      };
    }

    const distance = this.calculateDistance(origin, destination);
    const duration = Math.round(distance / 80);

    return {
      duration,
      distance,
      surgeMultiplier: surge,
    };
  }

  async calculateSurgeETA(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<ETAResponse> {
    const [surge, directions] = await Promise.all([
      this.calculateSurgeMultiplier(origin, destination),
      this.googleMapsRequest<{ routes?: Array<{ legs?: Array<{ distance?: { value: number }; duration_in_traffic?: { value: number }; duration?: { value: number } }> }> }>('directions', {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        departure_time: 'now',
        traffic_model: 'best_guess',
        key: this.configService.get<string>('GOOGLE_MAPS_API_KEY', ''),
      }),
    ]);

    if (directions?.routes?.[0]?.legs?.[0]) {
      const leg = directions.routes[0].legs[0];
      return {
        duration: Math.round((leg.duration_in_traffic?.value ?? leg.duration?.value ?? 0) / 60),
        distance: leg.distance?.value ?? this.calculateDistance(origin, destination),
        surgeMultiplier: surge,
      };
    }

    const distance = this.calculateDistance(origin, destination);
    const duration = Math.round(distance / 70);

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
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY', '');
    const waypointStr = waypoints?.map(w => `${w.lat},${w.lng}`).join('|') || '';

    const directions = await this.googleMapsRequest<{ routes?: Array<{ legs?: Array<{ distance?: { value: number }; duration?: { value: number } }>; overview_polyline?: { points: string } }> }>('directions', {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      waypoints: waypointStr,
      key: apiKey,
    });

    if (directions?.routes?.[0]) {
      const route = directions.routes[0];
      const leg = route.legs?.[0];
      return {
        routes: [{
          coordinates: [origin, destination],
          duration: Math.round((leg?.duration?.value ?? 0) / 60),
          distance: leg?.distance?.value ?? this.calculateDistance(origin, destination),
          trafficImpact: 0.2,
        }],
      };
    }

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