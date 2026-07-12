import React from 'react';
interface StepperProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}
export declare const Stepper: {
    ({ value, onChange, min, max, step, label, disabled, size, }: StepperProps): React.JSX.Element;
    displayName: string;
};
export {};
//# sourceMappingURL=Stepper.d.ts.map