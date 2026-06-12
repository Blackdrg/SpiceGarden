import React from 'react';
interface DropdownOption {
    value: string;
    label: string;
    disabled?: boolean;
}
interface DropdownProps {
    options: DropdownOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
}
export declare const Dropdown: {
    ({ options, value, onChange, placeholder, label, error, disabled, }: DropdownProps): React.JSX.Element;
    displayName: string;
};
export {};
