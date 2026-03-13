import NewsSummary from "@/app/components/NewsSummary";
import FeaturedResources from "@/app/components/FeaturedResources";
import HomeHero from "@/components/HomeHero";

export default async function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HomeHero />
      <section id="news">
        <NewsSummary />
      </section>
      <FeaturedResources />
    </div>
  );
}
