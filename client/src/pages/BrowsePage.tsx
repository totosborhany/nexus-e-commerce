import { useSearchParams, useNavigate } from "react-router-dom";
import { useGames } from "@/hooks/useGames";
import GameCard from "@/components/GameCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";

const GENRES = ["RPG", "Action", "Adventure", "Strategy", "Simulation", "Sports", "Racing", "Puzzle", "Horror", "Indie"];

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get("genre") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "-createdAt");

  // Fetch all games without genre filter - we'll filter frontend-based
  const { data: allGames, isLoading } = useGames({
    search: search || undefined,
    sort,
    limit: 100, // Increased to get more games for filtering
  });

  // Frontend-based genre filtering
  const filteredGames = allGames?.filter(game => {
    if (!selectedGenre) return true;
    return Array.isArray(game.genre) && 
           game.genre.some(g => 
             g.toLowerCase().includes(selectedGenre.toLowerCase())
           );
  }) || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedGenre) params.set("genre", selectedGenre);
    if (sort) params.set("sort", sort);
    setSearchParams(params);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8">Browse Games</h1>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={!selectedGenre ? "default" : "outline"}
            size="sm"
            onClick={() => { setSelectedGenre(""); setSearchParams({}); }}
          >
            All
          </Button>
          {GENRES.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedGenre(genre);
                const p = new URLSearchParams(searchParams);
                p.set("genre", genre);
                setSearchParams(p);
              }}
            >
              {genre}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant={sort === "-createdAt" ? "secondary" : "ghost"} size="sm" onClick={() => setSort("-createdAt")}>
            Newest
          </Button>
          <Button variant={sort === "-ratingsAverage" ? "secondary" : "ghost"} size="sm" onClick={() => setSort("-ratingsAverage")}>
            Top Rated
          </Button>
          <Button variant={sort === "price" ? "secondary" : "ghost"} size="sm" onClick={() => setSort("price")}>
            Price: Low
          </Button>
          <Button variant={sort === "-price" ? "secondary" : "ghost"} size="sm" onClick={() => setSort("-price")}>
            Price: High
          </Button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-card" />
          ))}
        </div>
      ) : filteredGames && filteredGames.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game._id} game={game} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">No games found</p>
        </div>
      )}
    </div>
  );
};

export default BrowsePage;
