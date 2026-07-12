import React from 'react';
interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onSearch?: (value: string) => void;
    fullWidth?: boolean;
}
export declare const SearchInput: React.ForwardRefExoticComponent<SearchInputProps & React.RefAttributes<HTMLInputElement>>;
export {};
//# sourceMappingURL=SearchInput.d.ts.map