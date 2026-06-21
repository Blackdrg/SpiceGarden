export class GrpcTransportUnavailableError extends Error {
  constructor(message = 'SpiceGarden gRPC transport is quarantined; use REST/WebSocket APIs for production flows.') {
    super(message);
    this.name = 'GrpcTransportUnavailableError';
  }
}

export function createGrpcTransport(): never {
  throw new GrpcTransportUnavailableError();
}

export const grpcTransportStatus = {
  status: 'quarantined',
  supported: false,
  recommendedPath: 'REST/WebSocket APIs',
} as const;
