import Link from "next/link";
import { Star } from "lucide-react";
import { Meal } from "@/types/meal";
import { AddToCartButton } from "./add-to-cart-button";
import { Button } from "../ui/button";

export function MealCard({ meal }: { meal: Meal }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md h-full flex flex-col">
      <Link href={`/meals/${meal.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}${meal.image_url}`}
            alt={meal.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <Link href={`/meals/${meal.id}`} className="block">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold leading-tight">{meal.name}</h3>
              {meal.average_rating && (
                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">
                    {meal.average_rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {meal.description}
            </p>
          </Link>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold">
            ₦{meal.discounted_price.toLocaleString()}
          </span>
          <AddToCartButton meal={meal} />
        </div>
      </div>
    </div>
  );
}
