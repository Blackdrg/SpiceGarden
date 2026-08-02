import { DriverEntity } from '../db/entities/driver.entity';
import { RestaurantBranchEntity } from '../db/entities/restaurant-branch.entity';
import { OrderEntity } from '../db/entities/order.entity';

export interface RankedDriver {
  driverId: string;
  distanceKm: number;
  rating: number;
  etaMinutes: number;
  fraudScore: number;
  score: number;
}

export function rankDrivers(
  drivers: DriverEntity[],
  order: OrderEntity | null,
  branch: RestaurantBranchEntity | null,
  originLat: number,
  originLng: number,
  maxDistanceKm: number = 10,
  requireLocation: boolean = true
): RankedDriver[] {
  const maxDispatchRadiusKm = 10;
  const idealSpeed = 30;

  return drivers
    .map((driver) => {
      const loc = driver.currentLocation as { lat: number; lng: number } | null | undefined;
      if (requireLocation && (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number')) {
        return null;
      }

      let distanceKm = 0;
      if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
        distanceKm = haversineKm({ lat: originLat, lng: originLng }, { lat: loc.lat, lng: loc.lng });
        if (distanceKm > maxDistanceKm) return null;
      }

      const speed = Number(driver.averageSpeed) || 40;
      const etaMinutes = Math.max(Math.round((distanceKm / speed) * 60), 1);

      const ratingScore = ((Number(driver.rating) || 0) / 5) * 0.3;
      const fraudScore = ((100 - (Number(driver.fraudScore) || 0)) / 100) * 0.2;
      const experienceScore = Math.min((Number(driver.totalDeliveries) || 0) / 1000, 1) * 0.2;
      const speedScore = Math.max(0, 1 - Math.abs(((Number(driver.averageSpeed) || 40) - idealSpeed)) / 50) * 0.15;
      const proximityScore = Math.max(0, 1 - distanceKm / maxDistanceKm) * 0.15;

      const score = ratingScore + fraudScore + experienceScore + speedScore + proximityScore;

      return {
        driverId: driver.id,
        distanceKm: Math.round(distanceKm * 100) / 100,
        rating: Number(driver.rating),
        etaMinutes,
        fraudScore: Number(driver.fraudScore) || 0,
        score: Math.round(score * 1000) / 1000,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
      if (a.fraudScore !== b.fraudScore) return a.fraudScore - b.fraudScore;
      if (a.rating !== b.rating) return b.rating - a.rating;
      return a.etaMinutes - b.etaMinutes;
    });
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
