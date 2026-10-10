"use client";
import React from 'react';
import styles from './Button.module.css';
export const Button = ({ label, children, onClick, variant = 'primary', size = 'md', isLoading = false, disabled = false, style, ariaLabel, className, }) => {
    const baseClass = `${styles.button} ${styles[variant]} ${styles[size]}`;
    const mergedClassName = className ? `${baseClass} ${className}` : baseClass;
    return (React.createElement("button", { onClick: onClick, disabled: disabled || isLoading, "aria-label": ariaLabel || label, "aria-disabled": disabled || isLoading, className: mergedClassName, style: style }, isLoading ? 'Loading...' : (label || children)));
};
