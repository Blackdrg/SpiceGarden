interface RequestOptions extends RequestInit {
    token?: string;
}
interface ApiResponse<T> {
    data: T;
    refreshToken?: string;
}
export declare function api<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>;
export declare const authApi: {
    login: (email: string, password: string) => Promise<ApiResponse<{
        user?: unknown;
    }>>;
    register: (data: {
        fullName: string;
        email: string;
        phone: string;
        password: string;
    }) => Promise<ApiResponse<{
        user?: unknown;
    }>>;
    refreshToken: () => Promise<ApiResponse<{
        refresh_token: string;
    }>>;
};
export declare const restaurantsApi: {
    list: (lat?: number, lng?: number) => Promise<ApiResponse<unknown[]>>;
    get: (id: string) => Promise<ApiResponse<unknown>>;
    search: (query: string) => Promise<ApiResponse<unknown[]>>;
};
export declare const ordersApi: {
    list: () => Promise<ApiResponse<unknown[]>>;
    get: (id: string) => Promise<ApiResponse<unknown>>;
    create: (data: unknown) => Promise<ApiResponse<unknown>>;
    track: (id: string) => Promise<ApiResponse<unknown>>;
};
export declare const addressesApi: {
    list: () => Promise<ApiResponse<unknown[]>>;
    create: (data: unknown) => Promise<ApiResponse<unknown>>;
    setDefault: (id: string) => Promise<ApiResponse<unknown>>;
    remove: (id: string) => Promise<ApiResponse<unknown>>;
};
export declare const menuApi: {
    list: (restaurantId: string) => Promise<ApiResponse<unknown[]>>;
    categories: (restaurantId: string) => Promise<ApiResponse<unknown[]>>;
};
export interface LegalDocument {
    id: string;
    type: string;
    title: string;
    slug: string;
    currentVersion: number;
    currentVersionId?: string;
    lastUpdated: string;
    language: string;
    version?: string;
    effectiveDate?: string;
    summary?: string;
    sections?: {
        id: string;
        title: string;
        content: string;
        order: number;
    }[];
}
export interface ConsentRecord {
    id: string;
    region: string;
    consentVersion: string;
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    performance: boolean;
    functional: boolean;
    preference: boolean;
    createdAt: string;
}
export interface PrivacyDashboard {
    userId: string;
    consent: {
        version: string;
        analytics: boolean;
        marketing: boolean;
    } | null;
    activeRequests: number;
    exportsAvailable: number;
    dpdpOfficer: {
        name: string;
        email: string;
        phone: string;
    };
    consentManager: {
        name: string;
        email: string;
    } | null;
}
export declare const legalApi: {
    center: (language?: string) => Promise<ApiResponse<{
        categories: string[];
        documents: LegalDocument[];
    }>>;
    document: (type: string, language?: string) => Promise<ApiResponse<LegalDocument>>;
    versions: (type: string, language?: string) => Promise<ApiResponse<{
        document: string;
        currentVersion: number;
        versions: unknown[];
    }>>;
    requiredAcceptances: () => Promise<ApiResponse<{
        pending: {
            type: string;
            title: string;
            currentVersion: number;
        }[];
    }>>;
    accept: (documentId: string, versionId: string, method?: string) => Promise<ApiResponse<unknown>>;
    myAcceptances: () => Promise<ApiResponse<unknown[]>>;
    cookieRegistry: () => Promise<ApiResponse<unknown[]>>;
    recordConsent: (payload: {
        userId?: string;
        anonymousToken?: string;
        region: string;
        consentVersion: string;
        necessary: boolean;
        analytics: boolean;
        marketing: boolean;
        performance: boolean;
        functional: boolean;
        preference: boolean;
    }) => Promise<ApiResponse<{
        consentId: string;
        region: string;
        version: string;
    }>>;
    activeConsent: (token: string) => Promise<ApiResponse<ConsentRecord | null>>;
    withdrawConsent: (consentId: string, userId?: string) => Promise<ApiResponse<unknown>>;
    dashboard: (userId: string) => Promise<ApiResponse<PrivacyDashboard>>;
    createRequest: (payload: {
        userId: string;
        type: string;
        regulation: string;
        reason?: string;
        requestId?: string;
    }) => Promise<ApiResponse<unknown>>;
    listRequests: (query?: string) => Promise<ApiResponse<unknown[]>>;
    createExport: (payload: {
        userId: string;
        regulation: string;
        format: string;
        requestId?: string;
    }) => Promise<ApiResponse<unknown>>;
    listExports: (userId: string) => Promise<ApiResponse<unknown[]>>;
    downloadExport: (exportId: string) => string;
    dpdpInfo: () => Promise<ApiResponse<{
        officer: unknown;
        consentManager: unknown;
    }>>;
};
declare const _default: {
    auth: {
        login: (email: string, password: string) => Promise<ApiResponse<{
            user?: unknown;
        }>>;
        register: (data: {
            fullName: string;
            email: string;
            phone: string;
            password: string;
        }) => Promise<ApiResponse<{
            user?: unknown;
        }>>;
        refreshToken: () => Promise<ApiResponse<{
            refresh_token: string;
        }>>;
    };
    restaurants: {
        list: (lat?: number, lng?: number) => Promise<ApiResponse<unknown[]>>;
        get: (id: string) => Promise<ApiResponse<unknown>>;
        search: (query: string) => Promise<ApiResponse<unknown[]>>;
    };
    orders: {
        list: () => Promise<ApiResponse<unknown[]>>;
        get: (id: string) => Promise<ApiResponse<unknown>>;
        create: (data: unknown) => Promise<ApiResponse<unknown>>;
        track: (id: string) => Promise<ApiResponse<unknown>>;
    };
    menu: {
        list: (restaurantId: string) => Promise<ApiResponse<unknown[]>>;
        categories: (restaurantId: string) => Promise<ApiResponse<unknown[]>>;
    };
    addresses: {
        list: () => Promise<ApiResponse<unknown[]>>;
        create: (data: unknown) => Promise<ApiResponse<unknown>>;
        setDefault: (id: string) => Promise<ApiResponse<unknown>>;
        remove: (id: string) => Promise<ApiResponse<unknown>>;
    };
    legal: {
        center: (language?: string) => Promise<ApiResponse<{
            categories: string[];
            documents: LegalDocument[];
        }>>;
        document: (type: string, language?: string) => Promise<ApiResponse<LegalDocument>>;
        versions: (type: string, language?: string) => Promise<ApiResponse<{
            document: string;
            currentVersion: number;
            versions: unknown[];
        }>>;
        requiredAcceptances: () => Promise<ApiResponse<{
            pending: {
                type: string;
                title: string;
                currentVersion: number;
            }[];
        }>>;
        accept: (documentId: string, versionId: string, method?: string) => Promise<ApiResponse<unknown>>;
        myAcceptances: () => Promise<ApiResponse<unknown[]>>;
        cookieRegistry: () => Promise<ApiResponse<unknown[]>>;
        recordConsent: (payload: {
            userId?: string;
            anonymousToken?: string;
            region: string;
            consentVersion: string;
            necessary: boolean;
            analytics: boolean;
            marketing: boolean;
            performance: boolean;
            functional: boolean;
            preference: boolean;
        }) => Promise<ApiResponse<{
            consentId: string;
            region: string;
            version: string;
        }>>;
        activeConsent: (token: string) => Promise<ApiResponse<ConsentRecord | null>>;
        withdrawConsent: (consentId: string, userId?: string) => Promise<ApiResponse<unknown>>;
        dashboard: (userId: string) => Promise<ApiResponse<PrivacyDashboard>>;
        createRequest: (payload: {
            userId: string;
            type: string;
            regulation: string;
            reason?: string;
            requestId?: string;
        }) => Promise<ApiResponse<unknown>>;
        listRequests: (query?: string) => Promise<ApiResponse<unknown[]>>;
        createExport: (payload: {
            userId: string;
            regulation: string;
            format: string;
            requestId?: string;
        }) => Promise<ApiResponse<unknown>>;
        listExports: (userId: string) => Promise<ApiResponse<unknown[]>>;
        downloadExport: (exportId: string) => string;
        dpdpInfo: () => Promise<ApiResponse<{
            officer: unknown;
            consentManager: unknown;
        }>>;
    };
};
export default _default;
