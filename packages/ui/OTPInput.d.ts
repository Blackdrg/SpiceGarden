import React from 'react';
interface OTPInputProps {
    length?: 4 | 6;
    value?: string;
    onChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    error?: string;
    disabled?: boolean;
}
export declare const OTPInput: {
    ({ length, value, onChange, onComplete, error, disabled, }: OTPInputProps): React.JSX.Element;
    displayName: string;
};
export {};
