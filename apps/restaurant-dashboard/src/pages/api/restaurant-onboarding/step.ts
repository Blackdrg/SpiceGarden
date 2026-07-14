import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const restaurantId = req.body?.restaurantId;
  if (!restaurantId) {
    return res.status(400).json({ error: 'restaurantId is required in request body' });
  }

  try {
    const statusResponse = await fetch(`${BACKEND_URL}/restaurant-onboarding/status/${restaurantId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    let onboardingId: string;
    if (statusResponse.ok) {
      const status = await statusResponse.json();
      onboardingId = status.onboardingId || status.id;
    } else {
      const initResponse = await fetch(`${BACKEND_URL}/restaurant-onboarding/initialize/${restaurantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!initResponse.ok) {
        return res.status(502).json({ error: 'Failed to initialize onboarding on backend' });
      }
      const initData = await initResponse.json();
      onboardingId = initData.onboardingId || initData.id;
    }

    if (!onboardingId) {
      return res.status(500).json({ error: 'Could not determine onboarding ID' });
    }

    const stepResponse = await fetch(`${BACKEND_URL}/restaurant-onboarding/step/${onboardingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!stepResponse.ok) {
      const errorText = await stepResponse.text().catch(() => 'Unknown error');
      return res.status(stepResponse.status).json({ error: `Backend error: ${errorText}` });
    }

    const data = await stepResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({ error: 'Failed to connect to backend service' });
  }
}
