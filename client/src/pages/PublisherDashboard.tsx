import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gameService } from "@/api/gameService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getImageUrl } from "@/api/client";
import type { Game } from "@/types";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PublisherDashboard = () => {
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const { data: games, isLoading } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      return await gameService.getGames() as Game[];
    },
  });

  const deleteGame = useMutation({
    mutationFn: async (id: string) => {
      await gameService.deleteGame(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["games"] });
      toast.success("Game deleted");
    },
    onError: (err: any) => toast.error(err.message || "Failed"),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" /> Publisher Dashboard
        </h1>
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setEditingGame(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Game</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGame ? "Edit Game" : "Create New Game"}</DialogTitle>
            </DialogHeader>
            <GameForm
              game={editingGame}
              onSuccess={() => {
                setIsOpen(false);
                setEditingGame(null);
                qc.invalidateQueries({ queryKey: ["games"] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-card" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {games?.map((game) => (
            <div key={game._id} className="flex items-center gap-4 rounded-lg bg-card p-4">
              <img src={getImageUrl(game.photo)} alt={game.name} className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-display font-semibold">{game.name}</h3>
                <p className="text-sm text-muted-foreground">{game.genre?.join(", ")} · ${game.price?.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => { setEditingGame(game); setIsOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Delete this game?")) deleteGame.mutate(game._id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface GameFormProps {
  game: Game | null;
  onSuccess: () => void;
}

const GENRE_OPTIONS = ["Action", "RPG", "Strategy", "Puzzle", "Adventure", "Simulation", "Sports", "Horror", "FPS", "MMO"];
const CATEGORY_OPTIONS = ["AAA", "Indie", "Early Access", "Free to Play"];

const GameForm = ({ game, onSuccess }: GameFormProps) => {
  const [name, setName] = useState(game?.name || "");
  const [description, setDescription] = useState(game?.description || "");
  const [price, setPrice] = useState(game?.price?.toString() || "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(game?.genre || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(game?.category || []);
  const [requirements, setRequirements] = useState(game?.requirements || "");
  const [videos, setVideos] = useState<string[]>(game?.videos || []);
  const [videoInput, setVideoInput] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      
      // Append genres as array
      selectedGenres.forEach(g => formData.append("genre", g));
      // Append categories as array
      selectedCategories.forEach(c => formData.append("category", c));
      
      if (requirements) formData.append("requirements", requirements);
      
      // Append videos
      videos.forEach(v => formData.append("videos", v));
      
      if (photo) formData.append("photo", photo);
      if (images) {
        Array.from(images).forEach((img) => formData.append("images", img));
      }

      if (game) {
        await gameService.updateGame(game._id, formData);
        toast.success("Game updated!");
      } else {
        await gameService.createGame(formData);
        toast.success("Game created!");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>Description</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-border bg-secondary p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          rows={4}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Price</Label>
          <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
      </div>

      <div>
        <Label className="mb-3 block">Genres</Label>
        <div className="grid grid-cols-2 gap-2">
          {GENRE_OPTIONS.map((g) => (
            <label key={g} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGenres.includes(g)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedGenres([...selectedGenres, g]);
                  } else {
                    setSelectedGenres(selectedGenres.filter((x) => x !== g));
                  }
                }}
                className="rounded border-border"
              />
              <span className="text-sm">{g}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-3 block">Category</Label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORY_OPTIONS.map((c) => (
            <label key={c} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(c)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCategories([...selectedCategories, c]);
                  } else {
                    setSelectedCategories(selectedCategories.filter((x) => x !== c));
                  }
                }}
                className="rounded border-border"
              />
              <span className="text-sm">{c}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>YouTube Video Links</Label>
        <div className="flex gap-2 mb-2">
          <Input
            type="url"
            value={videoInput}
            onChange={(e) => setVideoInput(e.target.value)}
            placeholder="https://youtube.com/..."
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (videoInput.trim()) {
                setVideos([...videos, videoInput]);
                setVideoInput("");
              }
            }}
          >
            Add
          </Button>
        </div>
        {videos.length > 0 && (
          <div className="space-y-2">
            {videos.map((v, i) => (
              <div key={i} className="flex items-center justify-between bg-secondary p-2 rounded text-sm">
                <span className="truncate">{v}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setVideos(videos.filter((_, idx) => idx !== i))}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <Label>System Requirements</Label>
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          className="w-full rounded-lg border border-border bg-secondary p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          rows={2}
        />
      </div>
      <div>
        <Label>Cover Image</Label>
        <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} className="text-sm text-muted-foreground" />
      </div>
      <div>
        <Label>Screenshots (max 5)</Label>
        <input type="file" accept="image/*" multiple onChange={(e) => setImages(e.target.files)} className="text-sm text-muted-foreground" />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : game ? "Update Game" : "Create Game"}
      </Button>
    </form>
  );
};

export default PublisherDashboard;
