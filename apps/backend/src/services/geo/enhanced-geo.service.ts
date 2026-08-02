
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';

interface GeoPoint {
  lat: number;
  lng: number;
}

interface BranchWithDistance extends RestaurantBranchEntity {
  distance: number;
}

interface ETAPrediction {
  eta: number;
  distance: number;
  duration: number;
}

interface DriverLocationUpdate {
  driverId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

interface GeofenceAlert {
  driverId: string;
  branchId: string;
  event: 'entered' | 'exited';
  timestamp: Date;
  location: GeoPoint;
}

interface RouteOptimizationResult {
  orderedWaypoints: GeoPoint[];
  totalDistance: number;
  totalETA: number;
  instructions: Array<{
    step: number;
    instruction: string;
    distance: number;
    duration: number;
  }>;
}

interface TrafficCondition {
  segment: {
    start: GeoPoint;
    end: GeoPoint;
  };
  congestionLevel: 'low' | 'medium' | 'high' | 'severe';
  speedKmh: number;
  delayMinutes: number;
}

@Injectable()
export class EnhancedGeoService {
  private readonly logger = new Logger(EnhancedGeoService.name);
  private readonly EARTH_RADIUS_KM = 6371;
  private readonly AVERAGE_SPEED_KMH = 30;
  private readonly GEOFENCE_RADIUS_M = 100; // 100 meter geofence
  private readonly TRAFFIC_UPDATE_INTERVAL_MS = 30000; // 30 seconds

  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
    @InjectRepository(RestaurantBranchEntity)
    private readonly branchRepo: Repository<RestaurantBranchEntity>,
    @InjectRepository(DriverEntity)
    private readonly driverRepo: Repository<DriverEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  // Basic distance calculation (Haversine formula)
  calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) *
        Math.cos(this.toRadians(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS_KM * c;
  }

  // Predict ETA based on distance and speed with traffic conditions
  predictETA(
    distance: number, 
    speedKmh: number = this.AVERAGE_SPEED_KMH,
    trafficConditions: TrafficCondition[] = []
  ): ETAPrediction {
    // Adjust speed based on traffic conditions
    let adjustedSpeed = speedKmh;
    let totalDelay = 0;
    
    for (const condition of trafficConditions) {
      // Calculate what portion of our route this traffic condition affects
      // Simplified: if the condition is on our route, apply its effect
      totalDelay += condition.delayMinutes;
    }
    
    // Reduce speed based on traffic
    if (totalDelay > 0) {
      // Calculate what speed would give us the same time with delay
      const baseTimeHours = distance / speedKmh;
      const delayedTimeHours = baseTimeHours + (totalDelay / 60);
      adjustedSpeed = distance / delayedTimeHours;
    }
    
    const duration = (distance / adjustedSpeed) * 60; // Convert to minutes
    const buffer = duration * 0.2; // 20% buffer for uncertainty
    const eta = Math.ceil(duration + buffer);

    return {
      eta,
      distance,
      duration: Math.ceil(duration),
    };
  }

  // Find nearby branches using PostGIS
  async findNearbyBranches(
    customerLocation: GeoPoint,
    radiusInKm: number = 5,
    limit: number = 20,
  ): Promise<BranchWithDistance[]> {
    const radius = radiusInKm * 1000; // Convert to meters

return this.branchRepo
      .createQueryBuilder('branch')
      .leftJoinAndSelect('branch.restaurant', 'restaurant')
      .select([
        'branch',
        'restaurant',
        `ST_DistanceSphere(ST_MakePoint(CAST(SUBSTRING(branch.location FROM '\\(([^ ]+)') AS float), CAST(SUBSTRING(branch.location FROM ' ([^)]+)') AS float)), ST_MakePoint(:lng, :lat)) AS distance`,
      ])
      .where(
        `ST_DistanceSphere(ST_MakePoint(CAST(SUBSTRING(branch.location FROM '\\(([^ ]+)') AS float), CAST(SUBSTRING(branch.location FROM ' ([^)]+)') AS float)), ST_MakePoint(:lng, :lat)) <= :radius`,
        { lng: customerLocation.lng, lat: customerLocation.lat, radius },
      )
      .andWhere('branch.isOnline = :isOnline', { isOnline: true })
      .andWhere('restaurant.isActive = :isActive', { isActive: true })
      .orderBy('distance', 'ASC')
      .limit(limit)
      .getRawMany()
      .then((results) =>
        results.map((r) => ({
          ...r.branch,
          distance: r.distance / 1000,
          restaurant: r.restaurant,
        })),
      );
  }

  // Find nearest branch for a specific restaurant
  async findNearestBranchForOrder(
    restaurantId: string,
    customerLocation: GeoPoint,
  ): Promise<RestaurantBranchEntity | null> {
    const branches = await this.branchRepo.find({
      where: { restaurant: { id: restaurantId }, isOnline: true } as any,
    });

    if (!branches.length) return null;

    let nearest = branches[0];
    let minDistance = Infinity;

    for (const branch of branches) {
      if (branch.location) {
        const branchPoint = {
          lat: Number(branch.location.lat),
          lng: Number(branch.location.lng),
        };
        const distance = this.calculateDistance(customerLocation, branchPoint);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = branch;
        }
      }
    }

    return nearest;
  }

  // Find available drivers near a restaurant
async findAvailableDrivers(
    restaurantLocation: GeoPoint,
    radiusInKm: number = 5,
    limit: number = 10,
  ): Promise<DriverEntity[]> {
    const radius = radiusInKm * 1000;

    return this.driverRepo
      .createQueryBuilder('driver')
      .select([
        'driver',
        `ST_DistanceSphere(ST_MakePoint(CAST(SUBSTRING(driver.currentLocation FROM '\\(([^ ]+)') AS float), CAST(SUBSTRING(driver.currentLocation FROM ' ([^)]+)') AS float)), ST_MakePoint(:lng, :lat)) AS distance`,
      ])
      .where('driver.isOnline = :isOnline', { isOnline: true })
      .andWhere('driver.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere(
        `ST_DistanceSphere(ST_MakePoint(CAST(SUBSTRING(driver.currentLocation FROM '\\(([^ ]+)') AS float), CAST(SUBSTRING(driver.currentLocation FROM ' ([^)]+)') AS float)), ST_MakePoint(:lng, :lat)) <= :radius`,
        { lng: restaurantLocation.lng, lat: restaurantLocation.lat, radius },
      )
      .orderBy('distance', 'ASC')
      .limit(limit)
      .getRawMany()
      .then((results) => results.map((r) => r.driver));
  }

  // Calculate delivery route and ETA with real traffic awareness
  async calculateDeliveryRoute(
    restaurantLocation: GeoPoint,
    customerLocation: GeoPoint,
    avoidCongestion: boolean = false
  ): Promise<ETAPrediction> {
    const trafficConditions = avoidCongestion ? [] : await this.getTrafficConditions(restaurantLocation, customerLocation);
    const distance = this.calculateDistance(restaurantLocation, customerLocation);
    return this.predictETA(distance, this.AVERAGE_SPEED_KMH, trafficConditions);
  }

  // Update driver location (real-time tracking)
async updateDriverLocation(
    driverId: string,
    locationUpdate: DriverLocationUpdate
  ): Promise<DriverEntity> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) {
      throw new NotFoundException(`Driver not found: ${driverId}`);
    }

    // Update driver location
    driver.currentLocation = {
      lat: locationUpdate.latitude,
      lng: locationUpdate.longitude,
    };
    driver.lastLocationUpdate = locationUpdate.timestamp;

    // Update speed if provided
    if (locationUpdate.speed !== undefined) {
      // Update average speed using exponential moving average
      const alpha = 0.3; // Smoothing factor
      driver.averageSpeed = 
        (alpha * locationUpdate.speed) + 
        ((1 - alpha) * (driver.averageSpeed || 0));
    }

    // Update total distance if we have previous location
    if (driver.currentLocation && locationUpdate.timestamp) {
      // In a real implementation, we would calculate the distance from the last known position
      // For simplicity, we'll just increment by a small amount if speed is available
      if (locationUpdate.speed && locationUpdate.timestamp) {
        // This is a simplification - in reality we'd need the time delta
        const timeDeltaHours = 1/60; // Assume 1 minute interval for calculation
        const distanceDelta = locationUpdate.speed * timeDeltaHours;
        driver.totalDistance += distanceDelta;
      }
    }

// Save updated driver
    const updatedDriver = await this.driverRepo.save(driver);
    
    this.logger.log(`Updated location for driver ${driverId}`);
    
    return updatedDriver;
  }

  // Check if driver has entered/exited geofence around a branch
  async checkGeofence(
    driverId: string,
    branchId: string
  ): Promise<GeofenceAlert | null> {
    const [driver, branch] = await Promise.all([
      this.driverRepo.findOne({ where: { id: driverId } }),
      this.branchRepo.findOne({ where: { id: branchId } })
    ]);

    if (!driver || !branch) {
      return null;
    }

    if (!driver.currentLocation || !branch.location) {
      return null;
    }

    const distance = this.calculateDistance(
      { lat: driver.currentLocation.lat, lng: driver.currentLocation.lng },
      { lat: branch.location.lat, lng: branch.location.lng }
    );

    const isWithinGeofence = distance <= (this.GEOFENCE_RADIUS_M / 1000); // Convert to km

    // In a real implementation, we would store the previous state to detect enter/exit events
    // For simplicity, we'll return the current state
    if (isWithinGeofence) {
      return {
        driverId,
        branchId,
        event: 'entered', // Simplified - would need to check previous state
        timestamp: new Date(),
        location: {
          lat: driver.currentLocation.lat,
          lng: driver.currentLocation.lng
        }
      };
    } else {
      return {
        driverId,
        branchId,
        event: 'exited', // Simplified - would need to check previous state
        timestamp: new Date(),
        location: {
          lat: driver.currentLocation.lat,
          lng: driver.currentLocation.lng
        }
      };
    }
  }

  // Optimize route for multiple waypoints (using Google Maps API or similar in production)
  async optimizeRoute(
    waypoints: GeoPoint[]
  ): Promise<RouteOptimizationResult> {
    if (waypoints.length < 2) {
      throw new BadRequestException('At least 2 waypoints required for route optimization');
    }

    // In production, you'd use a service like Google Maps Directions API or OSRM
    // For this implementation, we'll use a simple nearest neighbor algorithm
    
    // Simple nearest neighbor algorithm for demonstration
    const unvisited = [...waypoints];
    const orderedWaypoints: GeoPoint[] = [];
    
    // Start from the first waypoint
    let currentPoint = unvisited.shift()!;
    orderedWaypoints.push(currentPoint);

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;

      // Find nearest unvisited waypoint
      for (let i = 0; i < unvisited.length; i++) {
        const distance = this.calculateDistance(currentPoint, unvisited[i]);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      // Add nearest waypoint to route
      currentPoint = unvisited.splice(nearestIndex, 1)[0]!;
      orderedWaypoints.push(currentPoint);
    }

    // Calculate total distance and ETA with traffic considerations
    let totalDistance = 0;
    const instructions = [];

    for (let i = 0; i < orderedWaypoints.length - 1; i++) {
      const distance = this.calculateDistance(orderedWaypoints[i], orderedWaypoints[i + 1]);
      totalDistance += distance;
      
      // Simulate traffic condition for this leg
      const trafficConditions: TrafficCondition[] = [{
        segment: {
          start: orderedWaypoints[i],
          end: orderedWaypoints[i + 1]
        },
        congestionLevel: 'low', // Assume low traffic for simplicity
        speedKmh: 35,
        delayMinutes: 2
      }];
      
const etaLeg = this.predictETA(distance, 30, trafficConditions);
      
      instructions.push({
        step: i + 1,
        instruction: `Proceed to waypoint ${i + 1}`,
        distance,
        duration: etaLeg.duration
      });
    }

    const totalETA = this.predictETA(totalDistance).eta;

    return {
      orderedWaypoints,
      totalDistance,
      totalETA,
      instructions
    };
  }

  // Calculate distance between multiple points (for route optimization)
  calculateRouteDistance(points: GeoPoint[]): number {
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      totalDistance += this.calculateDistance(points[i], points[i + 1]);
    }
    return totalDistance;
  }

  // Get current traffic conditions for a route using Google Maps Traffic API
  async getTrafficConditions(
    start: GeoPoint,
    end: GeoPoint
  ): Promise<TrafficCondition[]> {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY', '');
    if (!apiKey) {
      this.logger.warn('Google Maps API key not configured; traffic data unavailable');
      return [];
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&departure_time=now&traffic_model=best_guess&key=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) {
        this.logger.error(`Google Maps Traffic API error: ${response.status}`);
        return [];
      }

      const data = (await response.json()) as any;
      const route = data.routes?.[0];
      if (!route?.legs?.[0]) {
        return [];
      }

      const leg = route.legs[0];
      const durationInTraffic = leg.duration_in_traffic?.value ?? leg.duration?.value ?? 0;
      const durationWithoutTraffic = leg.duration?.value ?? 0;
      const delaySeconds = durationInTraffic - durationWithoutTraffic;
      const delayMinutes = Math.ceil(delaySeconds / 60);
      const distanceKm = (leg.distance?.value ?? 0) / 1000;
      const speedKmh = delayMinutes > 0 ? (distanceKm / (durationInTraffic / 3600)) : 30;

      const congestionLevel: 'low' | 'medium' | 'high' | 'severe' =
        delayMinutes > 15 ? 'severe' : delayMinutes > 8 ? 'high' : delayMinutes > 3 ? 'medium' : 'low';

      return [{
        segment: { start, end },
        congestionLevel,
        speedKmh: Math.round(speedKmh),
        delayMinutes,
      }];
    } catch (error) {
      this.logger.error('Google Maps Traffic API request failed:', error);
      return [];
    }
  }

  // Calculate ETA with real-time traffic updates
  async calculateETAWithLiveTraffic(
    start: GeoPoint,
    end: GeoPoint,
    vehicleSpeedKmh: number = this.AVERAGE_SPEED_KMH
  ): Promise<ETAPrediction & { trafficConditions: TrafficCondition[] }> {
    const trafficConditions = await this.getTrafficConditions(start, end);
    const distance = this.calculateDistance(start, end);
    const etaPrediction = this.predictETA(distance, vehicleSpeedKmh, trafficConditions);
    
    return {
      ...etaPrediction,
      trafficConditions
    };
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

