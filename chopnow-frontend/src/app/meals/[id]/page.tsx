import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Meal } from "@/types/meal";
import { Review } from "@/types/review";
import { Star } from "lucide-react";
import { AddToCartButton } from "@/components/shared/add-to-cart-button";

async function getMeal(id: string): Promise<Meal> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meals/${id}`, {
    next: { revalidate: 60 }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch meal');
  }

  return res.json();
}

async function getReviews(id: string): Promise<Review[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/meal/${id}`, {
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch reviews');
  }

  return res.json();
}

export default async function MealDetailsPage({ params }: { params: { id: string } }) {
  const meal = await getMeal(params.id);
  const reviews = await getReviews(params.id);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${meal.image_url}`}
              alt={meal.name}
              className="rounded-xl w-full"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              {meal.name}
            </h1>
            <div className="flex items-center space-x-2 mb-4">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="text-lg font-medium">
                {meal.average_rating ? meal.average_rating.toFixed(1) : 'No reviews yet'}
              </span>
              <span className="text-muted-foreground">({meal.review_count} reviews)</span>
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              {meal.description}
            </p>
            <p className="text-2xl font-bold mb-4">
              ₦{meal.discounted_price.toLocaleString()}
            </p>
            <div className="flex items-center gap-4">
              {/* TODO: Add quantity selector */}
              <AddToCartButton meal={meal} />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="ml-4 font-semibold">{review.consumer_name}</p>
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
              </div>
            ))}
            {reviews.length === 0 && <p>No reviews yet.</p>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}