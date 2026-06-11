"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapsController = void 0;
const common_1 = require("@nestjs/common");
let MapsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('maps')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getETA_decorators;
    let _getSurgeETA_decorators;
    let _getRerouting_decorators;
    let _getHeatmap_decorators;
    let _getSurgeZones_decorators;
    let _checkSurgeZone_decorators;
    var MapsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getETA_decorators = [(0, common_1.Get)('eta')];
            _getSurgeETA_decorators = [(0, common_1.Get)('surge-eta')];
            _getRerouting_decorators = [(0, common_1.Post)('reroute')];
            _getHeatmap_decorators = [(0, common_1.Get)('heatmap')];
            _getSurgeZones_decorators = [(0, common_1.Get)('surge-zones')];
            _checkSurgeZone_decorators = [(0, common_1.Get)('check-surge-zone')];
            __esDecorate(this, null, _getETA_decorators, { kind: "method", name: "getETA", static: false, private: false, access: { has: obj => "getETA" in obj, get: obj => obj.getETA }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSurgeETA_decorators, { kind: "method", name: "getSurgeETA", static: false, private: false, access: { has: obj => "getSurgeETA" in obj, get: obj => obj.getSurgeETA }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getRerouting_decorators, { kind: "method", name: "getRerouting", static: false, private: false, access: { has: obj => "getRerouting" in obj, get: obj => obj.getRerouting }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getHeatmap_decorators, { kind: "method", name: "getHeatmap", static: false, private: false, access: { has: obj => "getHeatmap" in obj, get: obj => obj.getHeatmap }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSurgeZones_decorators, { kind: "method", name: "getSurgeZones", static: false, private: false, access: { has: obj => "getSurgeZones" in obj, get: obj => obj.getSurgeZones }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkSurgeZone_decorators, { kind: "method", name: "checkSurgeZone", static: false, private: false, access: { has: obj => "checkSurgeZone" in obj, get: obj => obj.checkSurgeZone }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MapsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        mapsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(mapsService) {
            this.mapsService = mapsService;
        }
        async getETA(originLat, originLng, destLat, destLng) {
            const origin = { lat: Number(originLat), lng: Number(originLng) };
            const destination = { lat: Number(destLat), lng: Number(destLng) };
            return this.mapsService.calculateETA(origin, destination);
        }
        async getSurgeETA(originLat, originLng, destLat, destLng) {
            const origin = { lat: Number(originLat), lng: Number(originLng) };
            const destination = { lat: Number(destLat), lng: Number(destLng) };
            return this.mapsService.calculateSurgeETA(origin, destination);
        }
        async getRerouting(body) {
            return this.mapsService.getReroutingOptions(body.origin, body.destination, body.waypoints);
        }
        async getHeatmap(north, south, east, west, zoom) {
            return this.mapsService.getHeatmapData({
                north: Number(north),
                south: Number(south),
                east: Number(east),
                west: Number(west),
            }, zoom ? Number(zoom) : 12);
        }
        async getSurgeZones() {
            return this.mapsService.getSurgeZones();
        }
        async checkSurgeZone(lat, lng) {
            return this.mapsService.isAddressInSurgeZone(Number(lat), Number(lng));
        }
    };
    return MapsController = _classThis;
})();
exports.MapsController = MapsController;
