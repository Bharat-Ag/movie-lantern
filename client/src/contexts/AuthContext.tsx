"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import {
    DEMO_CREDENTIALS,
    fetchCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
    type AuthUser,
} from "@/lib/auth"

type AuthResult = { success: boolean; message?: string }

type AuthContextValue = {
    user: AuthUser | null
    loading: boolean
    login: (email: string, password: string) => Promise<AuthResult>
    register: (name: string, email: string, password: string) => Promise<AuthResult>
    loginAsDemo: () => Promise<AuthResult>
    logout: () => Promise<void>
    authDialogOpen: boolean
    authDialogMode: "login" | "register"
    authDialogMessage: string | null
    openAuthDialog: (options?: { mode?: "login" | "register"; message?: string }) => void
    closeAuthDialog: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [authDialogOpen, setAuthDialogOpen] = useState(false)
    const [authDialogMode, setAuthDialogMode] = useState<"login" | "register">("login")
    const [authDialogMessage, setAuthDialogMessage] = useState<string | null>(null)

    useEffect(() => {
        fetchCurrentUser()
            .then(setUser)
            .finally(() => setLoading(false))
    }, [])

    const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
        const result = await loginUser(email, password)
        if (result.success && result.user) {
            setUser(result.user)
            return { success: true }
        }
        return { success: false, message: result.message ?? "Invalid email or password" }
    }, [])

    const register = useCallback(async (name: string, email: string, password: string): Promise<AuthResult> => {
        const result = await registerUser(name, email, password)
        if (result.success && result.user) {
            setUser(result.user)
            return { success: true }
        }
        return { success: false, message: result.message ?? "Could not create account" }
    }, [])

    const loginAsDemo = useCallback(() => login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password), [login])

    const logout = useCallback(async () => {
        await logoutUser()
        setUser(null)
    }, [])

    const openAuthDialog = useCallback((options?: { mode?: "login" | "register"; message?: string }) => {
        setAuthDialogMode(options?.mode ?? "login")
        setAuthDialogMessage(options?.message ?? null)
        setAuthDialogOpen(true)
    }, [])

    const closeAuthDialog = useCallback(() => {
        setAuthDialogOpen(false)
        setAuthDialogMessage(null)
    }, [])

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            loading,
            login,
            register,
            loginAsDemo,
            logout,
            authDialogOpen,
            authDialogMode,
            authDialogMessage,
            openAuthDialog,
            closeAuthDialog,
        }),
        [user, loading, login, register, loginAsDemo, logout, authDialogOpen, authDialogMode, authDialogMessage, openAuthDialog, closeAuthDialog]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within an AuthProvider")
    return context
}
