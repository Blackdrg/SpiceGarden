"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractiveForm = exports.WithHelperText = exports.WithError = exports.Password = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Input_1 = require("./Input");
exports.default = {
    title: 'UI/Input',
    component: Input_1.Input,
    argTypes: {
        type: {
            control: 'select',
            options: ['text', 'email', 'password', 'number', 'tel'],
        },
    },
};
exports.Default = {
    args: {
        label: 'Email Address',
        placeholder: 'Enter your email',
        type: 'email',
    },
};
exports.Password = {
    args: {
        label: 'Password',
        placeholder: 'Enter your password',
        type: 'password',
    },
};
exports.WithError = {
    args: {
        label: 'Email',
        placeholder: 'Enter your email',
        error: 'Please enter a valid email address',
    },
};
exports.WithHelperText = {
    args: {
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        helperText: 'Used for delivery updates',
        type: 'tel',
    },
};
const InteractiveForm = () => {
    const [email, setEmail] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const validateEmail = (value) => {
        if (!value) {
            setError('Email is required');
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setError('Please enter a valid email');
        }
        else {
            setError('');
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { maxWidth: 400 }, children: [(0, jsx_runtime_1.jsx)(Input_1.Input, { label: "Email Address", type: "email", placeholder: "Enter your email", value: email, error: error, onChange: (e) => {
                    setEmail(e.target.value);
                    if (error)
                        validateEmail(e.target.value);
                } }), (0, jsx_runtime_1.jsx)(Input_1.Input, { label: "Password", type: "password", placeholder: "Enter your password" })] }));
};
exports.InteractiveForm = InteractiveForm;
