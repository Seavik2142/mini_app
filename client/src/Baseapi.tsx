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
    if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        return "http://localhost:3000";
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