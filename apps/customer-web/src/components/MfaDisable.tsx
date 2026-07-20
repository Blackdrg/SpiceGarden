import React, { useState, useCallback } from 'react';
import { Button } from '@spicegarden/ui';
import { useMfaManagement } from '../hooks/useMfaManagement';

interface MfaDisableProps {
  /**
   * Callback function to execute after MFA is successfully disabled.
   * This can be used to update the parent component's state.
   */
  onMfaDisabled: () => void;
}

const MfaDisable: React.FC<MfaDisableProps> = ({ onMfaDisabled }) => {
  const { isLoading, error, message, disableMfa } = useMfaManagement(true);
  const [mfaCode, setMfaCode] = useState<string>('');

  const handleDisableMfa = useCallback(async () => {
    const success = await disableMfa(mfaCode);
    if (success) {
      setMfaCode('');
      onMfaDisabled();
    }
  }, [disableMfa, mfaCode, onMfaDisabled]);

  return (
    <div style={styles.container}>
      <h2>Disable Two-Factor Authentication</h2>
      <p style={styles.instructions}>
        To disable 2FA, please enter a valid code from your authenticator application.
      </p>

      {error && <p style={styles.errorText}>{error}</p>}
      {message && <p style={styles.messageText}>{message}</p>}

      <div style={styles.formGroup}>
        <label htmlFor="mfa-disable-code" style={styles.label}>Verification Code</label>
        <input
          id="mfa-disable-code"
          type="text"
          value={mfaCode}
          onChange={(e) => setMfaCode(e.target.value)}
          placeholder="6-digit code"
          maxLength={6}
          style={styles.codeInput}
          disabled={isLoading}
        />
      </div>

      <Button
        label={isLoading ? 'Disabling...' : 'Disable 2FA'}
        onClick={handleDisableMfa}
        disabled={isLoading}
        variant="destructive"
      />
    </div>
  );
};

// Basic styling for demonstration purposes.
const styles = {
  container: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', maxWidth: '400px', marginTop: '20px' },
  instructions: { color: '#666', marginBottom: '15px', fontSize: '14px' },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
  codeInput: { padding: '10px', fontSize: '16px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' },
  errorText: { color: 'red', marginBottom: '10px' },
  messageText: { color: 'green', marginBottom: '10px' },
};

export default MfaDisable;
