"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"

export function AuthDialog() {
    const { authDialogOpen, authDialogMode, authDialogMessage, closeAuthDialog, login, register, loginAsDemo } =
        useAuth()

    const [mode, setMode] = useState(authDialogMode)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (authDialogOpen) {
            setMode(authDialogMode)
            setError(null)
        }
    }, [authDialogOpen, authDialogMode])

    const resetForm = () => {
        setName("")
        setEmail("")
        setPassword("")
        setError(null)
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setSubmitting(true)
        setError(null)

        const result =
            mode === "login" ? await login(email, password) : await register(name, email, password)

        setSubmitting(false)

        if (result.success) {
            resetForm()
            closeAuthDialog()
        } else {
            setError(result.message ?? "Something went wrong")
        }
    }

    const handleDemoLogin = async () => {
        setSubmitting(true)
        setError(null)
        const result = await loginAsDemo()
        setSubmitting(false)

        if (result.success) {
            resetForm()
            closeAuthDialog()
        } else {
            setError(result.message ?? "Could not sign in with demo account")
        }
    }

    return (
        <Dialog
            open={authDialogOpen}
            onOpenChange={(next) => {
                if (!next) {
                    resetForm()
                    closeAuthDialog()
                }
            }}
        >
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{mode === "login" ? "Log In" : "Create Account"}</DialogTitle>
                </DialogHeader>

                {authDialogMessage && (
                    <p className="mt-2 rounded-md border border-brand-text/30 bg-brand-text/10 px-3 py-2 text-sm text-brand-text">
                        {authDialogMessage}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    {mode === "register" && (
                        <div>
                            <label className="text-sm text-foreground/70">Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-brand/60"
                            />
                        </div>
                    )}
                    <div>
                        <label className="text-sm text-foreground/70">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-brand/60"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-foreground/70">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-brand/60"
                        />
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-md bg-brand px-5 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-brand/85 disabled:pointer-events-none disabled:opacity-60"
                    >
                        {submitting ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={submitting}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-5 py-2.5 font-semibold transition-colors hover:border-brand/60 disabled:pointer-events-none disabled:opacity-60"
                >
                    <Sparkles className="size-4" />
                    Continue with demo account
                </button>

                <p className="mt-4 text-center text-sm text-foreground/60">
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        onClick={() => {
                            setMode(mode === "login" ? "register" : "login")
                            setError(null)
                        }}
                        className="font-semibold text-brand-text hover:text-foreground"
                    >
                        {mode === "login" ? "Sign up" : "Log in"}
                    </button>
                </p>
            </DialogContent>
        </Dialog>
    )
}
