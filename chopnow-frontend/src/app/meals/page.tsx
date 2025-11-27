import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Meal } from "@/types/meal";
import { MealCard } from "@/components/shared/meal-card";

async function getMeals(): Promise<Meal[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meals`, {
    cache: 'no-store' // No caching for now, as the list can change often
  });

  if (!res.ok) {
    throw new Error('Failed to fetch meals');
  }

  return res.json();
}

export default async function MealsPage() {
  const meals = await getMeals();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">
          All Meals
        </h1>
        {/* TODO: Add search and filter bar here */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}