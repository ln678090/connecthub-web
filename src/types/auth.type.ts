export interface AuthResponse {
    accessToken: string;
    tokenType: string;
}

export interface ApiResp<T> {
    message: string;
    data: T;
    timestamp: string;
}

export interface User {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    roles: string;
}
