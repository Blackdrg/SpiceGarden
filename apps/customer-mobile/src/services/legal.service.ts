export interface AgreementResponse {
  id: string;
  type: string;
  title: string;
  content: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
}

export async function fetchCurrentAgreement(): Promise<AgreementResponse> {
  const API_BASE_URL = 'http://localhost:3001';
  const response = await fetch(`${API_BASE_URL}/agreements/current/driver/driver_agreement`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
