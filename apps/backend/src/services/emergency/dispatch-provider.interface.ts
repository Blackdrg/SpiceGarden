export interface EmergencyDispatchResult {
  success: boolean;
  providerResponseId?: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface IEmergencyDispatchProvider {
  name: string;
  dispatch(data: {
    incidentId: string;
    incidentNumber: string;
    driverId: string;
    latitude: number;
    longitude: number;
    address: string;
    severity: string;
    notes?: Record<string, any>;
  }): Promise<EmergencyDispatchResult>;
}
