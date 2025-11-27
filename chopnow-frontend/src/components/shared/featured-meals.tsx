import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Meal } from "@/types/meal"
import { MealCard } from "./meal-card"

async function getFeaturedMeals(): Promise<Meal[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meals?limit=4`, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  })

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch featured meals')
  }

  return res.json()
}

export async function FeaturedMeals() {
  const meals = await getFeaturedMeals()

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
            Our Specialties
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Popular Dishes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover our most loved meals, prepared with the finest ingredients
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/meals">
            <Button variant="outline" size="lg">
              View Full Menu
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
