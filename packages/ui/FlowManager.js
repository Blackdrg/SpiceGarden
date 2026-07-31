"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowManager = void 0;
const react_1 = __importStar(require("react"));
const tokens_1 = require("./tokens");
const Button_1 = require("./Button");
const useFlow_1 = require("./useFlow");
const FlowManager = ({ flowId, steps, onComplete, onError, }) => {
    const [currentStepIndex, setCurrentStepIndex] = (0, react_1.useState)(0);
    const { state, error, next, back } = (0, useFlow_1.useFlow)({
        flowId,
        steps: steps.map(s => ({ ...s, completed: false })),
        onComplete: () => {
            setCurrentStepIndex(steps.length - 1);
            onComplete?.();
        },
        onError,
    });
    if (state === 'success') {
        return (react_1.default.createElement("div", { style: { textAlign: 'center', padding: tokens_1.DESIGN_TOKENS.spacing[10] } },
            react_1.default.createElement("div", { style: {
                    width: 80,
                    height: 80,
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.full,
                    backgroundColor: tokens_1.DESIGN_TOKENS.colors.successLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: `0 auto ${tokens_1.DESIGN_TOKENS.spacing[5]}px`,
                } },
                react_1.default.createElement("svg", { width: "40", height: "40", viewBox: "0 0 24 24", fill: "none", stroke: tokens_1.DESIGN_TOKENS.colors.success, strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" },
                    react_1.default.createElement("path", { d: "M5 13l4 4L19 7" }))),
            react_1.default.createElement("h2", { style: { margin: 0, marginBottom: tokens_1.DESIGN_TOKENS.spacing[3], ...tokens_1.DESIGN_TOKENS.typography.headingM, color: tokens_1.DESIGN_TOKENS.colors.textPrimary } }, "Flow Complete!"),
            react_1.default.createElement("p", { style: { margin: 0, ...tokens_1.DESIGN_TOKENS.typography.bodySmall, color: tokens_1.DESIGN_TOKENS.colors.textSecondary } }, "You have successfully completed all steps.")));
    }
    if (state === 'error') {
        return (react_1.default.createElement("div", { style: { padding: tokens_1.DESIGN_TOKENS.spacing[6], textAlign: 'center' } },
            react_1.default.createElement("div", { style: {
                    width: 80,
                    height: 80,
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.full,
                    backgroundColor: tokens_1.DESIGN_TOKENS.colors.dangerLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: `0 auto ${tokens_1.DESIGN_TOKENS.spacing[5]}px`,
                } },
                react_1.default.createElement("svg", { width: "40", height: "40", viewBox: "0 0 24 24", fill: "none", stroke: tokens_1.DESIGN_TOKENS.colors.danger, strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" },
                    react_1.default.createElement("circle", { cx: "12", cy: "12", r: "10" }),
                    react_1.default.createElement("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
                    react_1.default.createElement("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" }))),
            react_1.default.createElement("h2", { style: { margin: 0, marginBottom: tokens_1.DESIGN_TOKENS.spacing[3], ...tokens_1.DESIGN_TOKENS.typography.headingM, color: tokens_1.DESIGN_TOKENS.colors.danger } }, "Error"),
            react_1.default.createElement("p", { style: { margin: 0, ...tokens_1.DESIGN_TOKENS.typography.bodySmall, color: tokens_1.DESIGN_TOKENS.colors.textSecondary, marginBottom: tokens_1.DESIGN_TOKENS.spacing[5] } }, error),
            react_1.default.createElement(Button_1.Button, { label: "Retry", onClick: () => window.location.reload() })));
    }
    return (react_1.default.createElement("div", { style: { maxWidth: 600, margin: '0 auto', padding: tokens_1.DESIGN_TOKENS.spacing[6] } },
        react_1.default.createElement("div", { style: { display: 'flex', marginBottom: tokens_1.DESIGN_TOKENS.spacing[8], gap: tokens_1.DESIGN_TOKENS.spacing[2] } }, steps.map((step, idx) => (react_1.default.createElement("div", { key: step.id, style: {
                flex: 1,
                height: 4,
                background: idx <= currentStepIndex ? tokens_1.DESIGN_TOKENS.colors.primary : tokens_1.DESIGN_TOKENS.colors.border,
                borderRadius: tokens_1.DESIGN_TOKENS.radius.sm,
                transition: `background ${tokens_1.DESIGN_TOKENS.motion.standard}ms ${tokens_1.MOTION_EASING.easeInOut}`,
            } })))),
        react_1.default.createElement("div", { style: { marginBottom: tokens_1.DESIGN_TOKENS.spacing[8] } },
            react_1.default.createElement("h2", { style: { margin: 0, ...tokens_1.DESIGN_TOKENS.typography.headingM, color: tokens_1.DESIGN_TOKENS.colors.textPrimary } }, steps[currentStepIndex]?.label)),
        react_1.default.createElement("div", { style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing[4], justifyContent: 'space-between' } },
            react_1.default.createElement(Button_1.Button, { label: "Previous", variant: "secondary", onClick: back, disabled: currentStepIndex === 0 }),
            react_1.default.createElement(Button_1.Button, { label: currentStepIndex === steps.length - 1 ? 'Complete' : 'Next', onClick: () => {
                    next();
                    setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
                } }))));
};
exports.FlowManager = FlowManager;
