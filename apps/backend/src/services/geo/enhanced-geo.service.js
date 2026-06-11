"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedGeoService = void 0;
const common_1 = require("@nestjs/common");
let EnhancedGeoService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EnhancedGeoService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EnhancedGeoService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        restaurantRepo;
        branchRepo;
        driverRepo;
        orderRepo;
        dataSource;
        logger = new common_1.Logger(EnhancedGeoService.name);
        EARTH_RADIUS_KM = 6371;
        AVERAGE_SPEED_KMH = 30;
        GEOFENCE_RADIUS_M = 100; // 100 meter geofence
        TRAFFIC_UPDATE_INTERVAL_MS = 30000; // 30 seconds
        constructor(restaurantRepo, branchRepo, driverRepo, orderRepo, dataSource) {
            this.restaurantRepo = restaurantRepo;
            this.branchRepo = branchRepo;
            this.driverRepo = driverRepo;
            this.orderRepo = orderRepo;
            this.dataSource = dataSource;
        }
        // Basic distance calculation (Haversine formula)
        calculateDistance(point1, point2) {
            const dLat = this.toRadians(point2.lat - point1.lat);
            const dLng = this.toRadians(point2.lng - point1.lng);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRadians(point1.lat)) *
                    Math.cos(this.toRadians(point2.lat)) *
                    Math.sin(dLng / 2) *
                    Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return this.EARTH_RADIUS_KM * c;
        }
        // Predict ETA based on distance and speed with traffic conditions
        predictETA(distance, speedKmh = this.AVERAGE_SPEED_KMH, trafficConditions = []) {
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
        async findNearbyBranches(customerLocation, radiusInKm = 5, limit = 20) {
            const radius = radiusInKm * 1000; // Convert to meters
            return this.branchRepo
                .createQueryBuilder('branch')
                .leftJoinAndSelect('branch.restaurant', 'restaurant')
                .select([
                'branch',
                'restaurant',
                `ST_DistanceSphere(branch.location, ST_MakePoint(:lng, :lat)) AS distance`,
            ])
                .where(`ST_DistanceSphere(branch.location, ST_MakePoint(:lng, :lat)) <= :radius`, { lng: customerLocation.lng, lat: customerLocation.lat, radius })
                .andWhere('branch.isOnline = :isOnline', { isOnline: true })
                .andWhere('restaurant.isActive = :isActive', { isActive: true })
                .orderBy('distance', 'ASC')
                .limit(limit)
                .getRawMany()
                .then((results) => results.map((r) => ({
                ...r.branch,
                distance: r.distance / 1000,
                restaurant: r.restaurant,
            })));
        }
        // Find nearest branch for a specific restaurant
        async findNearestBranchForOrder(restaurantId, customerLocation) {
            const branches = await this.branchRepo.find({
                where: { restaurant: { id: restaurantId }, isOnline: true },
            });
            if (!branches.length)
                return null;
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
        async findAvailableDrivers(restaurantLocation, radiusInKm = 5, limit = 10) {
            const radius = radiusInKm * 1000;
            return this.driverRepo
                .createQueryBuilder('driver')
                .select([
                'driver',
                `ST_DistanceSphere(driver.currentLocation, ST_MakePoint(:lng, :lat)) AS distance`,
            ])
                .where('driver.isOnline = :isOnline', { isOnline: true })
                .andWhere('driver.isAvailable = :isAvailable', { isAvailable: true })
                .andWhere(`ST_DistanceSphere(driver.currentLocation, ST_MakePoint(:lng, :lat)) <= :radius`, { lng: restaurantLocation.lng, lat: restaurantLocation.lat, radius })
                .orderBy('distance', 'ASC')
                .limit(limit)
                .getRawMany()
                .then((results) => results.map((r) => r.driver));
        }
        // Calculate delivery route and ETA with traffic awareness
        async calculateDeliveryRoute(restaurantLocation, customerLocation, avoidCongestion = false) {
            // In a real implementation, we would fetch traffic data from a service like Google Maps
            // For now, we'll simulate some traffic conditions
            const trafficConditions = avoidCongestion ? [] : [
                {
                    segment: {
                        start: { lat: restaurantLocation.lat, lng: restaurantLocation.lng },
                        end: customerLocation
                    },
                    congestionLevel: 'medium',
                    speedKmh: 20,
                    delayMinutes: 5
                }
            ];
            const distance = this.calculateDistance(restaurantLocation, customerLocation);
            return this.predictETA(distance, this.AVERAGE_SPEED_KMH, trafficConditions);
        }
        // Update driver location (real-time tracking)
        async updateDriverLocation(driverId, locationUpdate) {
            const driver = await this.driverRepo.findOne({ where: { id: driverId } });
            if (!driver) {
                throw new Error(`Driver not found: ${driverId}`);
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
                    const timeDeltaHours = 1 / 60; // Assume 1 minute interval for calculation
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
        async checkGeofence(driverId, branchId) {
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
            const distance = this.calculateDistance({ lat: driver.currentLocation.lat, lng: driver.currentLocation.lng }, { lat: branch.location.lat, lng: branch.location.lng });
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
            }
            else {
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
        async optimizeRoute(waypoints) {
            if (waypoints.length < 2) {
                throw new Error('At least 2 waypoints required for route optimization');
            }
            // In production, you'd use a service like Google Maps Directions API or OSRM
            // For this implementation, we'll use a simple nearest neighbor algorithm
            // Simple nearest neighbor algorithm for demonstration
            const unvisited = [...waypoints];
            const orderedWaypoints = [];
            // Start from the first waypoint
            let currentPoint = unvisited.shift();
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
                currentPoint = unvisited.splice(nearestIndex, 1)[0];
                orderedWaypoints.push(currentPoint);
            }
            // Calculate total distance and ETA with traffic considerations
            let totalDistance = 0;
            const instructions = [];
            for (let i = 0; i < orderedWaypoints.length - 1; i++) {
                const distance = this.calculateDistance(orderedWaypoints[i], orderedWaypoints[i + 1]);
                totalDistance += distance;
                // Simulate traffic condition for this leg
                const trafficConditions = [{
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
        calculateRouteDistance(points) {
            let totalDistance = 0;
            for (let i = 0; i < points.length - 1; i++) {
                totalDistance += this.calculateDistance(points[i], points[i + 1]);
            }
            return totalDistance;
        }
        // Get current traffic conditions for a route (would integrate with traffic API in production)
        async getTrafficConditions(start, end) {
            // In production, this would call a traffic API like Google Maps Traffic API
            // For now, we'll return simulated data
            const distance = this.calculateDistance(start, end);
            // Simulate traffic based on distance (longer routes = more likely to have traffic)
            if (distance > 10) { // More than 10km
                return [{
                        segment: { start, end },
                        congestionLevel: 'medium',
                        speedKmh: 25,
                        delayMinutes: Math.ceil(distance / 5) // 5 minutes per 10km
                    }];
            }
            else if (distance > 5) { // More than 5km
                return [{
                        segment: { start, end },
                        congestionLevel: 'low',
                        speedKmh: 30,
                        delayMinutes: Math.ceil(distance / 10) // 2 minutes per 10km
                    }];
            }
            return []; // No significant traffic
        }
        // Calculate ETA with real-time traffic updates
        async calculateETAWithLiveTraffic(start, end, vehicleSpeedKmh = this.AVERAGE_SPEED_KMH) {
            const trafficConditions = await this.getTrafficConditions(start, end);
            const distance = this.calculateDistance(start, end);
            const etaPrediction = this.predictETA(distance, vehicleSpeedKmh, trafficConditions);
            return {
                ...etaPrediction,
                trafficConditions
            };
        }
        toRadians(degrees) {
            return degrees * (Math.PI / 180);
        }
    };
    return EnhancedGeoService = _classThis;
})();
exports.EnhancedGeoService = EnhancedGeoService;
