import React from 'react';
interface DropdownOption {
    value: string;
    label: string;
    disabled?: boolean;
    icon?: React.ReactNode;
}
interface DropdownProps {
    options: DropdownOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    fullWidth?: boolean;
}
export declare const Dropdown: {
    ({ options, value, onChange, placeholder, label, error, disabled, fullWidth, }: DropdownProps): React.JSX.Element;
    displayName: string;
};
export {};
//# sourceMappingURL=Dropdown.d.ts.map