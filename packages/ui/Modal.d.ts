import React from 'react';
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    showCloseButton?: boolean;
}
export declare const Modal: ({ isOpen, onClose, title, children, size, showCloseButton, }: ModalProps) => React.JSX.Element | null;
interface BottomSheetProps extends ModalProps {
    snapPoints?: string[];
}
export declare const BottomSheet: ({ isOpen, onClose, title, children, showCloseButton, }: BottomSheetProps) => React.JSX.Element | null;
export {};
