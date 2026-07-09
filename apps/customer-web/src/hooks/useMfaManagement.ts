import { useState, useCallback } from 'react';
import { api } from '@spicegarden/shared/api';

/**
 * A custom hook to manage the state and logic for Multi-Factor Authentication.
 * @param {boolean} initialMfaStatus - The initial MFA status of the user.
 */
export function useMfaManagement(initialMfaStatus = false) {
    const [isMfaEnabled, setIsMfaEnabled] = useState(initialMfaStatus);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const clearMessages = () => {
        setError('');
        setMessage('');
    };

    const generateQrCode = useCallback(async () => {
        setIsLoading(true);
        clearMessages();
        try {
            const { data } = await api<{ qrCodeDataUrl: string }>('/mfa/setup', { method: 'POST' });
            setQrCodeDataUrl(data.qrCodeDataUrl);
            setMessage('Scan the QR code with your authenticator app and enter the code below.');
        } catch (err: any) {
            setError(err.message || 'Failed to generate QR code.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const enableMfa = useCallback(async (code: string): Promise<boolean> => {
        if (!code || code.length !== 6) {
            setError('Please enter the 6-digit code from your authenticator app.');
            return false;
        }
        setIsLoading(true);
        clearMessages();
        try {
            const { data } = await api<{ enabled: boolean }>('/mfa/enable', {
                method: 'POST',
                body: JSON.stringify({ code }),
            });

            if (data.enabled) {
                setIsMfaEnabled(true);
                setMessage('Multi-Factor Authentication has been successfully enabled!');
                setQrCodeDataUrl(null);
                return true;
            }

            setError('Invalid MFA code. Please try again.');
            return false;
        } catch (err: any) {
            setError(err.message || 'Failed to enable MFA. Please check your code.');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const disableMfa = useCallback(async (code: string): Promise<boolean> => {
        if (!code || code.length !== 6) {
            setError('Please enter a valid 6-digit code from your authenticator app.');
            return false;
        }
        setIsLoading(true);
        clearMessages();
        try {
            const { data } = await api<{ disabled: boolean }>('/mfa/disable', {
                method: 'POST',
                body: JSON.stringify({ code }),
            });

            if (data.disabled) {
                setIsMfaEnabled(false);
                setMessage('Multi-Factor Authentication has been successfully disabled.');
                return true;
            }
            setError('An unknown error occurred. Please try again.');
            return false;
        } catch (err: any) {
            setError(err.message || 'Invalid MFA code. Please try again.');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isMfaEnabled,
        qrCodeDataUrl,
        isLoading,
        error,
        message,
        generateQrCode,
        enableMfa,
        disableMfa,
        setIsMfaEnabled,
    };
}