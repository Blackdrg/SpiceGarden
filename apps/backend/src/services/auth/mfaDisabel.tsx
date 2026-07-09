import React, { useState, useCallback } from 'react';
import { Button } from '@spicegarden/ui';
import { api } from '@spicegarden/shared/api';

interface MfaDisableProps {
  /**
   * Callback function to execute after MFA is successfully disabled.
   * This can be used to update the parent component's state.
   */
  onMfaDisabled: () => void;
}

const MfaDisable: React.FC<MfaDisableProps> = ({ onMfaDisabled }) => {
  const [mfaCode, setMfaCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleDisableMfa = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    if (!mfaCode || mfaCode.length !== 6) {
      setError('Please enter a valid 6-digit code from your authenticator app.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await api<{ disabled: boolean }>('/mfa/disable', {
        method: 'POST',
        body: JSON.stringify({ code: mfaCode }),
      });

      if (result.data.disabled) {
        setMessage('Multi-Factor Authentication has been successfully disabled.');
        setMfaCode('');
        // Notify the parent component to update the UI
        if (onMfaDisabled) {
          onMfaDisabled();
        }
      } else {
        // This path is unlikely if the backend throws an error on failure, but included for completeness.
        setError('An unknown error occurred. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid MFA code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [mfaCode, onMfaDisabled]);

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
        variant="danger"
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

```

This self-contained component can now be imported and used in your application's user settings page, providing a complete and secure flow for users to manage their MFA preferences.

<!--
[PROMPT_SUGGESTION]How can I add recovery codes to the MFA flow?[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]Integrate the MfaDisable component into the user profile page.[/PROMPT_SUGGESTION]
