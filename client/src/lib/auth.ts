const API_URL = process.env.NEXT_PUBLIC_API_URL

export type AuthUser = {
    id: string
    name: string
    email: string
}

export const DEMO_CREDENTIALS = {
    email: "demo@movielantern.com",
    password: "demo1234",
}

type AuthResponse = { success: boolean; user?: AuthUser; message?: string }

async function authRequest(path: string, body?: Record<string, unknown>): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/api/auth/${path}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    })

    return res.json()
}

export function registerUser(name: string, email: string, password: string) {
    return authRequest("register", { name, email, password })
}

export function loginUser(email: string, password: string) {
    return authRequest("login", { email, password })
}

export function logoutUser() {
    return authRequest("logout")
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
    const res = await fetch(`${API_URL}/api/auth/me`, { credentials: "include" })
    if (!res.ok) return null
    const data: AuthResponse = await res.json()
    return data.user ?? null
}
