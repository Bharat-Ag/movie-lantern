const API_URL = process.env.NEXT_PUBLIC_API_URL

export type CreateOrderResponse = {
    success: boolean
    order: { id: string; amount: number; currency: string }
    keyId: string
}

export async function createRazorpayOrder(amount: number, receipt?: string): Promise<CreateOrderResponse> {
    const res = await fetch(`${API_URL}/api/payments/order`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, receipt }),
    })

    if (!res.ok) throw new Error("Failed to create order")
    return res.json()
}

export async function verifyRazorpayPayment(payload: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
}): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_URL}/api/payments/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })

    return res.json()
}
