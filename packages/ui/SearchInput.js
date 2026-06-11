"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchInput = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const tokens_1 = require("./tokens");
exports.SearchInput = (0, react_1.forwardRef)(({ placeholder = 'Search...', value, onChange, onSearch, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && onSearch) {
            onSearch(e.target.value);
        }
        onKeyDown?.(e);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', width: '100%' }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                    position: 'absolute',
                    left: tokens_1.DESIGN_TOKENS.spacing.md,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: tokens_1.DESIGN_TOKENS.colors.textSecondary,
                    fontSize: 16,
                    pointerEvents: 'none',
                }, children: "\uD83D\uDD0D" }), (0, jsx_runtime_1.jsx)("input", { ref: ref, type: "search", placeholder: placeholder, value: value, onChange: onChange, onKeyDown: handleKeyDown, "aria-label": "Search", style: {
                    width: '100%',
                    padding: `${tokens_1.DESIGN_TOKENS.spacing.md}px`,
                    paddingLeft: `${tokens_1.DESIGN_TOKENS.spacing.xl}px`,
                    paddingRight: `${tokens_1.DESIGN_TOKENS.spacing.xl}px`,
                    borderRadius: `${tokens_1.DESIGN_TOKENS.radius.input}px`,
                    border: `1px solid ${tokens_1.DESIGN_TOKENS.colors.border}`,
                    backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
                    ...tokens_1.DESIGN_TOKENS.typography.body,
                    outline: 'none',
                    transition: `border-color ${tokens_1.DESIGN_TOKENS.motion.micro}ms`,
                    fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                } })] }));
});
exports.SearchInput.displayName = 'SearchInput';
