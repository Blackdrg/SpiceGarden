import { ConfigService } from '@nestjs/config';
export interface GeoCoordinate {
    lat: number;
    lng: number;
}
export interface GeocodedAddress {
    formattedAddress: string;
    lat: number;
    lng: number;
    placeId: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    cached: boolean;
    provider: 'google' | 'mapbox' | 'local_cache' | 'offline_fallback';
}
export interface RouteStep {
    instruction: string;
    distanceMeters: number;
    durationSeconds: number;
}
export interface DetailedRoute {
    origin: GeoCoordinate;
    destination: GeoCoordinate;
    distanceMeters: number;
    durationMinutes: number;
    trafficDurationMinutes: number;
    encodedPolyline: string;
    steps: RouteStep[];
    provider: string;
}
export interface DriverLocationTelemetry {
    driverId: string;
    tenantId: string;
    coordinate: GeoCoordinate;
    headingDegrees?: number;
    speedKmh?: number;
    timestamp: number;
}
export interface MapsCostMetric {
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
    cacheHitRatioPercent: number;
    googleApiCalls: number;
    mapboxApiCalls: number;
    fallbackCalls: number;
    estimatedCostUSD: number;
}
export declare class ProductionMapsService {
    private configService;
    private readonly logger;
    private geocodeCache;
    private routeCache;
    private driverLiveLocations;
    private driverLocationHistory;
    private metrics;
    private circuitBreaker;
    constructor(configService: ConfigService);
    validateCoordinates(coord: GeoCoordinate): {
        isValid: boolean;
        normalized: GeoCoordinate;
        error?: string;
    };
    geocode(address: string): Promise<GeocodedAddress>;
    reverseGeocode(coord: GeoCoordinate): Promise<GeocodedAddress>;
    calculateDistance(a: GeoCoordinate, b: GeoCoordinate): {
        distanceMeters: number;
        haversineMeters: number;
        durationMinutes: number;
    };
    calculateRoute(origin: GeoCoordinate, destination: GeoCoordinate): Promise<DetailedRoute>;
    ingestDriverLocation(telemetry: DriverLocationTelemetry): Promise<{
        accepted: boolean;
        speedKmh: number;
        isOutlier: boolean;
    }>;
    getDriverLocation(driverId: string): DriverLocationTelemetry | null;
    getCostMetrics(): MapsCostMetric;
    private _updateHitRatio;
    private _callGoogleGeocode;
    private _callMapboxGeocode;
}
