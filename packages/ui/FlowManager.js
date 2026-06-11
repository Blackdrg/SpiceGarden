"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowManager = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const index_1 = require("./index");
const useFlow_1 = require("./useFlow");
const lucide_react_1 = require("lucide-react");
const FlowManager = ({ flowId, steps, onComplete, onError }) => {
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
        return ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center', padding: index_1.DESIGN_TOKENS.spacing.xl }, children: [(0, jsx_runtime_1.jsxs)("h2", { style: { display: 'inline-flex', alignItems: 'center', gap: 8 }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { size: 24, color: index_1.DESIGN_TOKENS.colors.success }), " Flow Complete!"] }), (0, jsx_runtime_1.jsx)("p", { children: "You have successfully completed all steps." })] }));
    }
    if (state === 'error') {
        return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: index_1.DESIGN_TOKENS.spacing.lg }, children: [(0, jsx_runtime_1.jsxs)("h2", { style: { color: index_1.DESIGN_TOKENS.colors.danger, display: 'inline-flex', alignItems: 'center', gap: 8 }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { size: 24 }), " Error"] }), (0, jsx_runtime_1.jsx)("p", { children: error }), (0, jsx_runtime_1.jsx)(index_1.Button, { label: "Retry", onClick: () => window.location.reload() })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { style: { maxWidth: 600, margin: '0 auto', padding: index_1.DESIGN_TOKENS.spacing.lg }, children: [(0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', marginBottom: index_1.DESIGN_TOKENS.spacing.xl, gap: index_1.DESIGN_TOKENS.spacing.sm }, children: steps.map((step, idx) => ((0, jsx_runtime_1.jsx)("div", { style: {
                        flex: 1,
                        height: 4,
                        background: idx <= currentStepIndex ? index_1.DESIGN_TOKENS.colors.primary : index_1.DESIGN_TOKENS.colors.border,
                        borderRadius: index_1.DESIGN_TOKENS.radius.sm,
                    } }, step.id))) }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: index_1.DESIGN_TOKENS.spacing.xl }, children: (0, jsx_runtime_1.jsx)("h2", { children: steps[currentStepIndex]?.label }) }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: index_1.DESIGN_TOKENS.spacing.md, justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)(index_1.Button, { label: "Previous", variant: "secondary", onClick: back, disabled: currentStepIndex === 0 }), (0, jsx_runtime_1.jsx)(index_1.Button, { label: currentStepIndex === steps.length - 1 ? 'Complete' : 'Next', onClick: () => {
                            next();
                            setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
                        } })] })] }));
};
exports.FlowManager = FlowManager;
