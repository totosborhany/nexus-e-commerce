import { useParams, useNavigate } from "react-router-dom";
import { useGame, useGames } from "@/hooks/useGames";
import { useReviews, useCreateReview, useDeleteReview } from "@/hooks/useReviews";
import { useAddToCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/api/client";
import { userService } from "@/api/userService";
import GameCard from "@/components/GameCard";
import { Star, ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const GameDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { data: game, isLoading } = useGame(id!);
  const { data: reviews } = useReviews(id!);
  const { data: relatedGames } = useGames({ limit: 4 });
  const addToCart = useAddToCart();
  const createReview = useCreateReview(id!);
  const deleteReview = useDeleteReview(id!);

  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [liking, setLiking] = useState(false);

  const isLiked = user?.likes?.includes(id!) || false;

  const handleLike = async () => {
    if (!user) { toast.error("Please login first"); return; }
    setLiking(true);
    try {
      if (isLiked) {
        await userService.unlikeGame(id!);
        // Update user likes locally to prevent duplicate requests
        const updatedLikes = user.likes?.filter(likeId => likeId !== id!) || [];
        updateUser({ ...user, likes: updatedLikes });
        toast.success("Removed from wishlist");
      } else {
        await userService.likeGame(id!);
        // Update user likes locally to prevent duplicate requests
        const updatedLikes = [...(user.likes || []), id!];
        updateUser({ ...user, likes: updatedLikes });
        toast.success("Added to wishlist!");
      }
    } catch (err: any) {
      toast.error(err.message || err.response?.data?.message || "Failed");
    } finally {
      setLiking(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) { toast.error("Please login first"); return; }
    addToCart.mutate(id!, {
      onSuccess: () => toast.success("Added to cart!"),
      onError: (err: any) => toast.error(err.message || err.response?.data?.message || "Failed"),
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || reviewText.length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }
    createReview.mutate({ text: reviewText, rating: reviewRating }, {
      onSuccess: () => { toast.success("Review posted!"); setReviewText(""); setReviewRating(5); },
      onError: (err: any) => toast.error(err.message || err.response?.data?.message || "Failed to post review"),
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="h-96 animate-pulse rounded-lg bg-card" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-muted-foreground">Game not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/browse")}>
          Back to Browse
        </Button>
      </div>
    );
  }

  const allImages = [game.photo, ...(Array.isArray(game.images) ? game.images : [])];
  const publisher = typeof game.publisher === "object" ? game.publisher : null;
  const trailers = Array.isArray(game.videos) ? game.videos : [];
  const descriptionPhotos = Array.isArray(game.desPhotos) ? game.desPhotos : [];

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <div className="animate-fade-in">
      {/* Top bar */}
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:flex lg:gap-8">
        {/* Left: Media */}
        <div className="flex-1 lg:max-w-3xl">
          <div className="overflow-hidden rounded-xl">
            <img
              src={getImageUrl(allImages[selectedImage])}
              alt={game.name}
              className="aspect-video w-full object-cover"
            />
          </div>
          {allImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={getImageUrl(img)} alt="" className="h-16 w-24 object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* YouTube Trailers */}
          {trailers.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold mb-4">Trailers & Videos</h2>
              <div className="space-y-4">
                {trailers.map((trailer, idx) => {
                  const embedUrl = getYouTubeEmbedUrl(trailer);
                  return embedUrl ? (
                    <div key={idx} className="aspect-video overflow-hidden rounded-lg">
                      <iframe
                        src={embedUrl}
                        title={`Game Trailer ${idx + 1}`}
                        className="w-full h-full border-0"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Description */}
          {/* <div className="mt-8">
            <h2 className="font-display text-xl font-bold mb-4">About This Game</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{game.description || "No description available"}</p>
          </div> */}
          {/* Description */}
<div className="mt-8">
  <h2 className="font-display text-xl font-bold mb-4">About This Game</h2>

  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
    {game.description || "No description available"}
  </p>

  {/* Description Photos */}

  {descriptionPhotos.length > 0 && (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {descriptionPhotos.map((img, i) => (
        <div key={i} className="overflow-hidden rounded-lg">
          <img
            src={getImageUrl(img)}
            alt={`Description ${i}`}
            className="w-full object-cover hover:scale-105 transition-transform"
          />
        </div>
      ))}
    </div>
  )}
</div>

          {game.requirements && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold mb-4">System Requirements</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{game.requirements}</p>
            </div>
          )}


          {/* Reviews */}
          <div className="mt-12">
            <h2 className="font-display text-xl font-bold mb-6">
              Reviews ({game.reviewCount || 0})
            </h2>

            {user && (
              <form onSubmit={handleSubmitReview} className="mb-8 rounded-lg bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rating:</span>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setReviewRating(s)}>
                      <Star className={`h-5 w-5 ${s <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review (min 10 characters)..."
                  className="w-full rounded-lg border border-border bg-secondary p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
                <Button type="submit" size="sm" className="mt-2" disabled={createReview.isPending}>
                  Post Review
                </Button>
              </form>
            )}

            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => {
                  if (!review || !review._id) return null;
                  const reviewer = typeof review.user === "object" && review.user ? review.user : null;
                  const rating = Number(review.rating) || 0;
                  const reviewText = review.text || "";
                  const createdDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Unknown date";
                  
                  return (
                    <div key={review._id} className="rounded-lg bg-card p-4">
                      <div className="flex items-center justify-between">
                        <img
                          src={getImageUrl(reviewer?.photo)}
                          alt={reviewer?.name || "User"}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <span className="font-medium">{reviewer?.name || "Anonymous"}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(rating, 5) }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{reviewText}</p>
                      <span className="mt-2 block text-xs text-muted-foreground">{createdDate}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No reviews yet. Be the first!</p>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="mt-8 lg:mt-0 lg:w-80">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-xl bg-card p-6">
              <h1 className="font-display text-2xl font-bold">{game.name || "Unknown Game"}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.isArray(game.genre) && game.genre.map((g) => (
                  <span key={g} className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">{g}</span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="font-medium">{game.ratingsAverage ? game.ratingsAverage.toFixed(1) : "N/A"}</span>
                <span className="text-sm text-muted-foreground">({game.reviewCount || 0} reviews)</span>
              </div>

              <div className="mt-6">
                <span className="font-display text-3xl font-bold text-success">${game.price ? game.price.toFixed(2) : "0.00"}</span>
              </div>

              <div className="mt-6 space-y-3">
                <Button variant="success" className="w-full" onClick={handleAddToCart} disabled={addToCart.isPending}>
                  <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
                <Button variant="outline" className="w-full" onClick={handleLike} disabled={liking}>
                  <Heart className={`mr-2 h-5 w-5 ${isLiked ? "fill-destructive text-destructive" : ""}`} />
                  {isLiked ? "Wishlisted" : "Add to Wishlist"}
                </Button>
              </div>
            </div>

            {publisher && (
              <div className="rounded-xl bg-card p-6">
                <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wide">Publisher</h3>
                <p className="mt-2 font-medium">{publisher.name}</p>
                {publisher.email && <p className="text-sm text-muted-foreground">{publisher.email}</p>}
              </div>
            )}

            <div className="rounded-xl bg-card p-6">
              <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wide">Details</h3>
              <div className="mt-3 space-y-2 text-sm">
                {Array.isArray(game.category) && game.category.map((c) => (
                  <div key={c} className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span>{c}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Released</span>
                  <span>{game.createdAt ? new Date(game.createdAt).toLocaleDateString() : "Unknown"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Games */}
      {relatedGames && relatedGames.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="font-display text-2xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {Array.isArray(relatedGames) && relatedGames.filter((g) => g && g._id !== id).slice(0, 4).map((g) => (
              <GameCard key={g._id} game={g} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default GameDetailPage;
