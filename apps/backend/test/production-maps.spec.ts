import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProductionMapsService } from '../src/services/maps/production-maps.service';

describe('ProductionMapsService', () => {
  let service: ProductionMapsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionMapsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GOOGLE_MAPS_API_KEY') return 'test_google_key';
              if (key === 'MAPBOX_ACCESS_TOKEN') return 'test_mapbox_token';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ProductionMapsService>(ProductionMapsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate and clamp coordinates properly', () => {
    const valid = service.validateCoordinates({ lat: 40.7128, lng: -74.0060 });
    expect(valid.isValid).toBe(true);
    expect(valid.normalized.lat).toBe(40.7128);

    const invalid = service.validateCoordinates({ lat: 120.5, lng: -200.0 });
    expect(invalid.isValid).toBe(false);
    expect(invalid.normalized.lat).toBe(90); // clamped
    expect(invalid.normalized.lng).toBe(-180); // clamped
  });

  it('should calculate distance and road network duration with Haversine precision', () => {
    const nyTimesSquare = { lat: 40.7580, lng: -73.9855 };
    const nyEmpireState = { lat: 40.7484, lng: -73.9857 };

    const result = service.calculateDistance(nyTimesSquare, nyEmpireState);
    expect(result.haversineMeters).toBeGreaterThan(900);
    expect(result.haversineMeters).toBeLessThan(1300);
    expect(result.distanceMeters).toBeGreaterThan(result.haversineMeters);
    expect(result.durationMinutes).toBeGreaterThan(0);
  });

  it('should calculate route turn-by-turn steps and encoded polyline', async () => {
    const origin = { lat: 40.7580, lng: -73.9855 };
    const destination = { lat: 40.7484, lng: -73.9857 };

    const route = await service.calculateRoute(origin, destination);
    expect(route).toBeDefined();
    expect(route.steps.length).toBeGreaterThan(0);
    expect(route.encodedPolyline).toBeDefined();
    expect(route.trafficDurationMinutes).toBeGreaterThan(0);
  });

  it('should ingest high-volume driver locations and filter speed outliers', async () => {
    const driverId = 'driver_test_001';
    const t0 = Date.now();

    // First location
    const res1 = await service.ingestDriverLocation({
      driverId,
      tenantId: 'tenant-001',
      coordinate: { lat: 40.7580, lng: -73.9855 },
      timestamp: t0
    });
    expect(res1.accepted).toBe(true);
    expect(res1.isOutlier).toBe(false);

    // Realistic second location 5 seconds later (100 meters away ~72 km/h)
    const res2 = await service.ingestDriverLocation({
      driverId,
      tenantId: 'tenant-001',
      coordinate: { lat: 40.7588, lng: -73.9855 },
      timestamp: t0 + 5000
    });
    expect(res2.accepted).toBe(true);

    // Anomalous teleportation (100 km away in 1 second ~ 360,000 km/h)
    const res3 = await service.ingestDriverLocation({
      driverId,
      tenantId: 'tenant-001',
      coordinate: { lat: 41.7580, lng: -73.9855 },
      timestamp: t0 + 6000
    });
    expect(res3.accepted).toBe(false);
    expect(res3.isOutlier).toBe(true);
  });

  it('should track maps API cost metrics and cache hit ratio', async () => {
    // 1st geocode (cache miss)
    await service.geocode('123 Main St, New York, NY');
    // 2nd geocode (cache hit)
    await service.geocode('123 Main St, New York, NY');

    const metrics = service.getCostMetrics();
    expect(metrics.totalRequests).toBeGreaterThanOrEqual(2);
    expect(metrics.cacheHits).toBeGreaterThanOrEqual(1);
    expect(metrics.cacheHitRatioPercent).toBeGreaterThan(0);
  });
});
