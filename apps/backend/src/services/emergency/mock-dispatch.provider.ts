import { Injectable, Logger } from '@nestjs/common';
import { IEmergencyDispatchProvider, EmergencyDispatchResult } from './dispatch-provider.interface';

@Injectable()
export class MockDispatchProvider implements IEmergencyDispatchProvider {
  name = 'mock_dispatch_provider';
  private readonly logger = new Logger(MockDispatchProvider.name);

  async dispatch(data: {
    incidentId: string;
    incidentNumber: string;
    driverId: string;
    latitude: number;
    longitude: number;
    address: string;
    severity: string;
    notes?: Record<string, any>;
  }): Promise<EmergencyDispatchResult> {
    this.logger.log(`Mock dispatch for incident ${data.incidentNumber}: severity=${data.severity}, location=${data.latitude},${data.longitude}`);

    return {
      success: true,
      providerResponseId: `mock-${data.incidentId}-${Date.now()}`,
      message: `Mock emergency dispatch acknowledged for incident ${data.incidentNumber}`,
      metadata: {
        provider: this.name,
        timestamp: new Date().toISOString(),
        incidentId: data.incidentId,
        severity: data.severity,
      },
    };
  }
}
