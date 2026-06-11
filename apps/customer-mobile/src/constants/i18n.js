"use strict";
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
exports.LocaleProvider = void 0;
exports.useLocale = useLocale;
exports.formatLocalizedCurrency = formatLocalizedCurrency;
exports.formatLocalizedDate = formatLocalizedDate;
exports.formatLocalizedTime = formatLocalizedTime;
const react_1 = __importStar(require("react"));
const LocaleContext = (0, react_1.createContext)({
    locale: 'en-IN',
    setLocale: function setLocale() { },
});
const LocaleProvider = function LocaleProvider({ children }) {
    const [locale, setLocaleState] = (0, react_1.useState)('en-IN');
    const setLocale = (0, react_1.useCallback)(function setLocale(newLocale) {
        setLocaleState(newLocale);
    }, []);
    return react_1.default.createElement(LocaleContext.Provider, { value: { locale: locale, setLocale: setLocale } }, children);
};
exports.LocaleProvider = LocaleProvider;
function useLocale() {
    return (0, react_1.useContext)(LocaleContext);
}
function formatLocalizedCurrency(amount, locale) {
    const symbol = '₹';
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }
    catch {
        return symbol + Math.round(amount);
    }
}
function formatLocalizedDate(date, locale) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    try {
        return new Intl.DateTimeFormat(locale, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(dateObj);
    }
    catch {
        return dateObj.toLocaleDateString();
    }
}
function formatLocalizedTime(time, locale) {
    if (/^\d{2}:\d{2}$/.test(time)) {
        const parts = time.split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        try {
            const date = new Date();
            date.setHours(hours, minutes);
            return new Intl.DateTimeFormat(locale, {
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        }
        catch {
            return time;
        }
    }
    return time;
}
