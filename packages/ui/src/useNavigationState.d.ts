interface NavigationState {
    path: string;
    timestamp: number;
    params?: Record<string, string>;
}
export declare const useNavigationPersistence: () => {
    pushState: (path: string, params?: Record<string, string>) => void;
    goBack: () => string;
    clearHistory: () => void;
    canGoBack: boolean;
    history: NavigationState[];
};
export declare const useDeepLink: () => {
    getDeepLink: (path: string, params?: Record<string, string>) => string;
    parseDeepLink: (url?: string) => {
        path: string;
        params: Record<string, string>;
    };
};
export {};
