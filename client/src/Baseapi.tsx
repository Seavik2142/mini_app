import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";

const normalizeApiBaseUrl = (value?: string) => {
    const trimmed = value?.trim();
    if (!trimmed) return undefined;
    if (/^REPLACE/i.test(trimmed) || /^https?:\/\/example/i.test(trimmed)) {
        return undefined;
    }
    return trimmed.replace(/\/$/, "");
};

export const getApiBaseUrl = () => {
    const fromEnv = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
    if (fromEnv) return fromEnv;

    if (typeof window !== "undefined") {
        const hostname = window.location.hostname.toLowerCase();
        if (hostname === "localhost" || hostname === "127.0.0.1") {
            return "http://localhost:3000";
        }
        if (hostname === "mgdigitalkeys.store" || hostname === "www.mgdigitalkeys.store" || hostname === "admin.mgdigitalkeys.store") {
            return "https://mini-app-mzu6.onrender.com";
        }
    }

    return "https://mini-app-mzu6.onrender.com";
};

const BaseApi = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: getApiBaseUrl(),
        credentials: "include"
    }),
    endpoints: () => ({}),
    tagTypes: ["user"]
});

export default BaseApi;