import React from 'react';
interface StepperProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    disabled?: boolean;
}
export declare const Stepper: {
    ({ value, onChange, min, max, step, label, disabled, }: StepperProps): React.JSX.Element;
    displayName: string;
};
export {};
