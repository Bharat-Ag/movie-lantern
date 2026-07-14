export type RazorpaySuccessResponse = {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
}

export type RazorpayOptions = {
    key: string
    amount: number
    currency: string
    name: string
    description?: string
    order_id: string
    prefill?: Record<string, string>
    theme?: { color?: string }
    handler: (response: RazorpaySuccessResponse) => void
    modal?: { ondismiss?: () => void }
}

type RazorpayInstance = {
    open: () => void
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance
    }
}

let scriptPromise: Promise<void> | null = null

export function loadRazorpayScript(): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve()
    if (window.Razorpay) return Promise.resolve()
    if (scriptPromise) return scriptPromise

    scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => resolve()
        script.onerror = () => {
            scriptPromise = null
            reject(new Error("Failed to load Razorpay checkout script"))
        }
        document.body.appendChild(script)
    })

    return scriptPromise
}
