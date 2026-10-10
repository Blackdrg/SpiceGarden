import React from 'react';
import { BarChart3, Users, ShieldAlert, Headphones, Store, Clock, Package, AlertCircle, CheckCircle, Gift, FileText, Volume2, VolumeX } from 'lucide-react';
import { IconProps } from '../types';
import { DESIGN_TOKENS } from '../../tokens';

export const DashboardIcon = ({ 
  size = 24, 
  color, 
  strokeWidth = 2, 
  className,
  ...props 
}: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  
  return (
    <BarChart3 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth} 
      className={className}
      aria-hidden={props['aria-label'] ? undefined : true}
      {...props} 
    />
  );
};

export const UsersIcon = ({ 
  size = 24, 
  color, 
  strokeWidth = 2, 
  className,
  ...props 
}: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  
  return (
    <Users 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth} 
      className={className}
      aria-hidden={props['aria-label'] ? undefined : true}
      {...props} 
    />
  );
};

export const ShieldIcon = ({ 
  size = 24, 
  color, 
  strokeWidth = 2, 
  className, 
  ...props 
}: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  
  return (
    <ShieldAlert 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth} 
      className={className} 
      aria-hidden={props['aria-label'] ? undefined : true} 
      {...props} 
    />
  );
};

export const HeadphonesIcon = ({ 
  size = 24, 
  color, 
  strokeWidth = 2, 
  className, 
  ...props 
}: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  return (
    <Headphones 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth} 
      className={className} 
      aria-hidden={props['aria-label'] ? undefined : true} 
      {...props} 
    />
  );
};

export const StoreIcon = ({ 
  size = 24, 
  color, 
  strokeWidth = 2, 
  className, 
  ...props 
}: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  return (
    <Store 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth} 
      className={className} 
      aria-hidden={props['aria-label'] ? undefined : true} 
      {...props} 
    />
  );
};

export const ClockIcon = ({ 
  size = 24, 
  color, 
  strokeWidth = 2, 
  className, 
  ...props 
}: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  return (
    <Clock 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth} 
      className={className} 
      aria-hidden={props['aria-label'] ? undefined : true} 
      {...props} 
    />
  );
};

export const PackageIcon = ({ 
  size = 24, 
  color, 
  strokeWidth = 2, 
  className, 
  ...props 
}: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  return (
    <Package 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth} 
      className={className} 
      aria-hidden={props['aria-label'] ? undefined : true} 
      {...props} 
    />
  );
};

export const AlertCircleIcon = ({ 
  size = 24, 
  color, 
  strokeWidth = 2, 
  className, 
  ...props 
}: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  return (
    <AlertCircle 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth} 
      className={className} 
      aria-hidden={props['aria-label'] ? undefined : true} 
      {...props} 
    />
  );
};

export const CheckCircleIcon = ({ 
  size = 24, 
  color, 
  strokeWidth = 2, 
  className, 
  ...props 
}: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  return (
    <CheckCircle 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth} 
      className={className} 
      aria-hidden={props['aria-label'] ? undefined : true} 
      {...props} 
    />
  );
};

export const GiftIcon = ({ 
  size = 24, 
  color, 
  strokeWidth = 2, 
  className, 
  ...props 
}: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  return (
    <Gift 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth} 
      className={className} 
      aria-hidden={props['aria-label'] ? undefined : true} 
      {...props} 
    />
  );
};

export const FileTextIcon = ({ 
  size = 24, 
  color, 
  strokeWidth = 2, 
  className, 
  ...props 
}: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  return (
    <FileText 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth} 
      className={className} 
      aria-hidden={props['aria-label'] ? undefined : true} 
      {...props} 
    />
  );
};

export const VolumeIcon = ({ 
  size = 24, 
  color, 
  strokeWidth = 2, 
  className, 
  ...props 
}: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  return (
    <Volume2 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth} 
      className={className} 
      aria-hidden={props['aria-label'] ? undefined : true} 
      {...props} 
    />
  );
};

export const VolumeMuteIcon = ({ 
  size = 24, 
  color, 
  strokeWidth = 2, 
  className, 
  ...props 
}: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  return (
    <VolumeX 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth} 
      className={className} 
      aria-hidden={props['aria-label'] ? undefined : true} 
      {...props} 
    />
  );
};