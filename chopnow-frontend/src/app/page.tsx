import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/shared/hero-section";
import { FeaturedMeals } from "@/components/shared/featured-meals";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeaturedMeals />
      </main>
      <Footer />
    </div>
  );
}
