"use client"

import { useCartStore } from "@/store/cart"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore()
  const { data: session, status } = useSession()
  const router = useRouter()

  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace("/auth/signin?callbackUrl=/checkout");
    }
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session, status, router]);

  const total = items.reduce((acc, item) => acc + item.discounted_price * item.quantity, 0)

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPlacingOrder(true)
    setError(null)

    if (!session) {
      setError("You must be logged in to place an order.")
      setIsPlacingOrder(false)
      return
    }

    const vendorId = items[0]?.vendor_id;
    if (!vendorId) {
      setError("An error occurred. Your cart seems to be invalid.")
      setIsPlacingOrder(false)
      return;
    }

    const orderData = {
      vendor_id: vendorId,
      items: items.map(item => ({ meal_id: item.id, quantity: item.quantity })),
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(orderData),
    })

    if (!res.ok) {
      const errorData = await res.json()
      setError(errorData.message || 'Failed to place order')
      setIsPlacingOrder(false)
    } else {
      clearCart()
      router.replace("/profile") // Redirect to profile page to see the new order
    }
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (items.length === 0) {
    router.replace("/meals");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">
          Checkout
        </h1>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <form onSubmit={handlePlaceOrder}>
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input id="address" required value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </CardContent>
              </Card>
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Payment on delivery is the only available option for now.
                  </p>
                </CardContent>
              </Card>
              {error && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              <Button type="submit" size="lg" className="w-full mt-8" disabled={isPlacingOrder || items.length === 0}>
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
              </Button>
            </form>
          </div>
          <div className="md:col-span-1">
            <div className="border rounded-lg p-4 space-y-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₦{(item.discounted_price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
