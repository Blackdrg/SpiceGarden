"use client";

import React from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';

interface LottieSuccessAnimationProps {
  width?: number | string;
  height?: number | string;
  speed?: number;
  loop?: boolean;
  style?: React.CSSProperties;
}

const LottieSuccessAnimation: React.FC<LottieSuccessAnimationProps> = ({
  width = 200,
  height = 200,
  speed = 1,
  loop = false,
  style,
}) => {
  return (
    <div style={{
      width: width as number | string,
      height: height as number | string,
      ...style,
      animation: `sg-check-pop ${0.5 / speed}s ${MOTION_EASING.easeOutSoft} forwards`,
    }}>
      <svg
        viewBox="0 0 100 100"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={DESIGN_TOKENS.colors.success} />
            <stop offset="100%" stopColor={DESIGN_TOKENS.colors.successDark} />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#successGrad)"
          strokeWidth="4"
          opacity="0.2"
          style={{ animation: 'sg-circle-draw 0.5s ease-out forwards' }}
        />
        <path
          d="M 30 50 L 45 65 L 70 35"
          stroke={DESIGN_TOKENS.colors.success}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ animation: 'sg-check-draw 0.4s 0.3s ease-out forwards', strokeDasharray: 50, strokeDashoffset: 50 }}
        />
      </svg>
      <style>{`
        @keyframes sg-check-pop {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes sg-circle-draw {
          from { stroke-dashoffset: 251; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes sg-check-draw {
          from { stroke-dashoffset: 50; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default LottieSuccessAnimation;
