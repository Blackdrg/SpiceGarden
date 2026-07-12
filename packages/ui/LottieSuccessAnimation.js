"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const tokens_1 = require("./tokens");
const LottieSuccessAnimation = ({ width = 200, height = 200, speed = 1, loop = false, style, }) => {
    return (react_1.default.createElement("div", { style: {
            width: width,
            height: height,
            ...style,
            animation: `sg-check-pop ${0.5 / speed}s ${tokens_1.MOTION_EASING.easeOutSoft} forwards`,
        } },
        react_1.default.createElement("svg", { viewBox: "0 0 100 100", style: { width: '100%', height: '100%' } },
            react_1.default.createElement("defs", null,
                react_1.default.createElement("linearGradient", { id: "successGrad", x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
                    react_1.default.createElement("stop", { offset: "0%", stopColor: tokens_1.DESIGN_TOKENS.colors.success }),
                    react_1.default.createElement("stop", { offset: "100%", stopColor: tokens_1.DESIGN_TOKENS.colors.successDark }))),
            react_1.default.createElement("circle", { cx: "50", cy: "50", r: "40", fill: "none", stroke: "url(#successGrad)", strokeWidth: "4", opacity: "0.2", style: { animation: 'sg-circle-draw 0.5s ease-out forwards' } }),
            react_1.default.createElement("path", { d: "M 30 50 L 45 65 L 70 35", stroke: tokens_1.DESIGN_TOKENS.colors.success, strokeWidth: "6", fill: "none", strokeLinecap: "round", strokeLinejoin: "round", style: { animation: 'sg-check-draw 0.4s 0.3s ease-out forwards', strokeDasharray: 50, strokeDashoffset: 50 } })),
        react_1.default.createElement("style", null, `
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
      `)));
};
exports.default = LottieSuccessAnimation;
