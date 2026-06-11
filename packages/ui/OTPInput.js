"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPInput = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const tokens_1 = require("./tokens");
const OTPInput = ({ length = 4, value = '', onChange, onComplete, error, disabled = false, }) => {
    const [otp, setOtp] = (0, react_1.useState)(value.split('').slice(0, length).concat(Array(length).fill('')).slice(0, length));
    const inputRefs = (0, react_1.useRef)(Array(length).fill(null));
    (0, react_1.useEffect)(() => {
        setOtp(value.split('').slice(0, length).concat(Array(length).fill('')).slice(0, length));
    }, [value, length]);
    const handleChange = (index, digit) => {
        if (!/^\d*$/.test(digit))
            return;
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        const newValue = newOtp.join('');
        onChange?.(newValue);
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
        if (newValue.length === length && onComplete) {
            onComplete(newValue);
        }
    };
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };
    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').replace(/\D/g, '');
        if (paste.length <= length) {
            const newOtp = paste.split('').concat(Array(length).fill('')).slice(0, length);
            setOtp(newOtp);
            onChange?.(paste);
            if (paste.length === length && onComplete) {
                onComplete(paste);
            }
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: tokens_1.DESIGN_TOKENS.spacing.sm, justifyContent: 'center' }, children: [otp.map((digit, index) => ((0, jsx_runtime_1.jsx)("input", { ref: (el) => { inputRefs.current[index] = el; }, type: "text", inputMode: "numeric", maxLength: 1, value: digit, onChange: (e) => handleChange(index, e.target.value), onKeyDown: (e) => handleKeyDown(index, e), onPaste: handlePaste, disabled: disabled, "aria-label": `OTP digit ${index + 1}`, "aria-invalid": !!error, style: {
                    width: 48,
                    height: 48,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 600,
                    borderRadius: tokens_1.DESIGN_TOKENS.radius.md,
                    border: `2px solid ${error ? tokens_1.DESIGN_TOKENS.colors.danger : tokens_1.DESIGN_TOKENS.colors.border}`,
                    backgroundColor: tokens_1.DESIGN_TOKENS.colors.surface,
                    color: tokens_1.DESIGN_TOKENS.colors.textPrimary,
                    outline: 'none',
                    transition: `border-color ${tokens_1.DESIGN_TOKENS.motion.micro}ms`,
                    fontFamily: tokens_1.DESIGN_TOKENS.typography.fontFamily,
                } }, index))), error && ((0, jsx_runtime_1.jsx)("span", { role: "alert", style: {
                    ...tokens_1.DESIGN_TOKENS.typography.smallLabel,
                    color: tokens_1.DESIGN_TOKENS.colors.danger,
                    marginTop: tokens_1.DESIGN_TOKENS.spacing.xs,
                }, children: error }))] }));
};
exports.OTPInput = OTPInput;
exports.OTPInput.displayName = 'OTPInput';
