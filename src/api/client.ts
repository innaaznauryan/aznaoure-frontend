const BASE_URL = import.meta.env.VITE_API_URL;
const ACCESS_TOKEN_KEY = "aznaoure_token";
const REFRESH_TOKEN_KEY = "aznaoure_refresh_token";

let refreshPromise: Promise<string | null> | null = null;

export class ApiError extends Error {
    code: string;
    constructor(code: string) {
        super(code);
        this.code = code;
    }
}

function requestHeaders(options: RequestInit, token: string | null): Headers {
    const headers = new Headers({ "Content-Type": "application/json" });
    new Headers(options.headers).forEach((value, key) => headers.set(key, value));
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
}

async function refreshAccessToken(): Promise<string | null> {
    if (refreshPromise) return refreshPromise;

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    refreshPromise = (async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (!response.ok) return null;

            const data = await response.json();
            if (typeof data.access_token !== "string") return null;

            localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
            window.dispatchEvent(new CustomEvent("aznaoure:auth-token", { detail: data.access_token }));
            if (typeof data.refresh_token === "string") {
                localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
            }
            return data.access_token;
        } catch {
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

function expireSession() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.dispatchEvent(new CustomEvent("aznaoure:auth-token", { detail: null }));
    if (!window.location.pathname.startsWith("/signin")) {
        window.location.href = "/signin?sessionExpired=1";
    }
}

export async function apiFetch(url: string, options: RequestInit = {}) {
    const tokenUsed = localStorage.getItem(ACCESS_TOKEN_KEY);
    const response = await fetch(url, {
        ...options,
        headers: requestHeaders(options, tokenUsed),
    });
    if (response.status !== 401) return response;

    const currentToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshedToken = currentToken !== tokenUsed
        ? currentToken
        : await refreshAccessToken();

    if (refreshedToken) {
        const retryResponse = await fetch(url, {
            ...options,
            headers: requestHeaders(options, refreshedToken),
        });
        if (retryResponse.status !== 401) return retryResponse;
        expireSession();
        return retryResponse;
    }

    expireSession();
    return response;
}

export function getMediaUrl(path: string): string {
    return `${BASE_URL}/media/${path}`;
}

export { BASE_URL };