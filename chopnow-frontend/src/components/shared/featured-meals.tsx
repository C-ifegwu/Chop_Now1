import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const meals = [
  {
    id: 1,
    name: "Jollof Rice & Chicken",
    description: "Nigerian jollof rice with grilled chicken and plantain",
    price: 3500,
    rating: 4.8,
    image: "/images/meals/jollof-chicken.jpg",
    isPopular: true,
  },
  {
    id: 2,
    name: "Pounded Yam & Egusi",
    description: "Smooth pounded yam with egusi soup and assorted meat",
    price: 4000,
    rating: 4.9,
    image: "/images/meals/pounded-yam-egusi.jpg",
    isPopular: true,
  },
  {
    id: 3,
    name: "Fried Rice & Dodo",
    description: "Special fried rice with fried plantain and chicken",
    price: 3800,
    rating: 4.7,
    image: "/images/meals/fried-rice-dodo.jpg",
    isPopular: false,
  },
  {
    id: 4,
    name: "Amala & Ewedu",
    description: "Soft amala with ewedu soup and assorted meat",
    price: 3200,
    rating: 4.6,
    image: "/images/meals/amala-ewedu.jpg",
    isPopular: true,
  },
]

export function FeaturedMeals() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container">
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
            <div
              key={meal.id}
              className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
            >
              {meal.isPopular && (
                <div className="absolute left-4 top-4 z-10 rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white">
                  Popular
                </div>
              )}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{meal.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">
                      {meal.rating}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {meal.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold">
                    ₦{meal.price.toLocaleString()}
                  </span>
                  <Button size="sm">Add to Cart</Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg">
            View Full Menu
          </Button>
        </div>
      </div>
    </section>
  )
}
