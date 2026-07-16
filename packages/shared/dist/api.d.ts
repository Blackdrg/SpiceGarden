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
};
export default _default;
