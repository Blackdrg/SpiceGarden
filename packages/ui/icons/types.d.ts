import type { SVGProps } from 'react';
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
    size?: number;
    color?: string;
    strokeWidth?: number;
}
