"use client"

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart"
import { Meal } from "@/types/meal"
import { Plus } from "lucide-react"

export function AddToCartButton({ meal }: { meal: Meal }) {
  const addToCart = useCartStore((state) => state.addToCart)

  return (
    <Button size="lg" onClick={() => addToCart(meal)}>
      Add to Cart
      <Plus className="ml-2 h-5 w-5" />
    </Button>
  )
}
