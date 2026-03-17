import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useGames } from "@/hooks/useGames";
import GameCard from "@/components/GameCard";
import heroBanner from "@/assets/hero-banner.jpg";
import { ArrowRight, Gamepad2, Star, TrendingUp } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const { data: games, isLoading } = useGames({ limit: 12, sort: "-createdAt" });
  const { data: topRated } = useGames({ limit: 4, sort: "-ratingsAverage" });

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBanner} alt="Hero" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-32">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <span className="font-display text-sm font-semibold uppercase tracking-widest text-primary">
                Nexus Store
              </span>
            </div>
            <h1 className="font-display text-5xl font-extrabold leading-tight md:text-6xl lg:text-7xl">
              Your Next
              <br />
              <span className="text-primary">Adventure</span> Awaits
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Discover, purchase, and play the best games from indie gems to AAA blockbusters. All in one place.
            </p>
            <div className="mt-8 flex gap-4">
              <Button variant="hero" onClick={() => navigate("/browse")}>
                Browse Games <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated */}
      {topRated && topRated.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-amber-400" />
              <h2 className="font-display text-2xl font-bold">Top Rated</h2>
            </div>
            <Button variant="ghost" onClick={() => navigate("/browse?sort=-ratingsAverage")}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {topRated.map((game) => (
              <GameCard key={game._id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* New Releases */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-success" />
            <h2 className="font-display text-2xl font-bold">New Releases</h2>
          </div>
          <Button variant="ghost" onClick={() => navigate("/browse?sort=-createdAt")}>
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-card" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
            {games?.map((game) => (
              <GameCard key={game._id} game={game} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
