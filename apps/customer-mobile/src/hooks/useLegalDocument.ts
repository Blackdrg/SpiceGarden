import { useState, useEffect, useRef, useCallback } from 'react';
import Animated, { useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { Easing } from 'react-native';
import { API_BASE_URL } from '../constants/api';
import { DESIGN_TOKENS } from '@spicegarden/ui';

interface AgreementResponse {
  id: string;
  type: string;
  title: string;
  content: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
}

interface UseLegalDocumentResult {
  agreement: AgreementResponse | null;
  loading: boolean;
  error: string | null;
  fadeAnim: SharedValue<number>;
  retry: () => void;
}

const fetchDriverAgreement = async (
  signal: AbortSignal
): Promise<AgreementResponse | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/agreements/current/driver/driver_agreement`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        signal,
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as AgreementResponse;
  } catch {
    return null;
  }
};

export const useLegalDocument = (): UseLegalDocumentResult => {
  const [agreement, setAgreement] = useState<AgreementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useSharedValue(0);
  const mountedRef = useRef(true);

  const loadAgreement = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const data = await fetchDriverAgreement(controller.signal);
    if (!mountedRef.current) {
      controller.abort();
      return;
    }
    if (data) {
      setAgreement(data);
    } else {
      setError('Failed to load legal document');
    }
    setLoading(false);
    fadeAnim.value = withTiming(1, {
      duration: DESIGN_TOKENS.motion.page,
      easing: Easing.out(Easing.quad),
    });
  }, [fadeAnim]);

  useEffect(() => {
    loadAgreement();
    return () => {
      mountedRef.current = false;
    };
  }, [loadAgreement]);

  return {
    agreement,
    loading,
    error,
    fadeAnim,
    retry: loadAgreement,
  };
};