import { useNavigate } from "react-router-dom";
import { useCart, useRemoveFromCart, useClearCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/api/client";
import { bookingService } from "@/api/bookingService";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const CartPage = () => {
  const { data: cart, isLoading } = useCart();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const [checkingOut, setCheckingOut] = useState(false);

  const games = cart || [];
  const total = games.reduce((sum, g) => sum + (g.price || 0), 0);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const session = await bookingService.createCheckoutSession();
      const url = session?.url;
      if (url) {
        // Stripe will redirect to success_url after payment, which is set to purchase-success on backend
        // Frontend will handle redirect via Stripe webhook or success page
        window.location.href = url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (err: any) {
      toast.error(err.message || err.response?.data?.message || "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-8"><div className="h-64 animate-pulse rounded-lg bg-card" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-primary" /> Shopping Cart
      </h1>

      {games.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg text-muted-foreground">Your cart is empty</p>
          <Button variant="default" className="mt-6" onClick={() => window.location.href = "/browse"}>
            Browse Games
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {games.map((game) => (
              <div key={game._id} className="flex items-center gap-4 rounded-lg bg-card p-4">
                <img src={getImageUrl(game.photo)} alt={game.name} className="h-20 w-20 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-display font-semibold">{game.name}</h3>
                  <p className="text-sm text-muted-foreground">{game.genre?.join(", ")}</p>
                </div>
                <span className="font-display text-lg font-bold text-success">${game.price?.toFixed(2)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCart.mutate(game._id, {
                    onSuccess: () => toast.success("Removed from cart"),
                  })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl bg-card p-6">
            <div className="flex items-center justify-between text-lg">
              <span className="text-muted-foreground">Total</span>
              <span className="font-display text-2xl font-bold text-success">${total.toFixed(2)}</span>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => {
                if (confirm("Clear entire cart?")) {
                  clearCart.mutate(undefined, { 
                    onSuccess: () => toast.success("Cart cleared"),
                    onError: (err: any) => toast.error(err.message || "Failed to clear cart")
                  });
                }
              }}>
                Clear Cart
              </Button>
              <Button variant="success" className="flex-1" onClick={handleCheckout} disabled={checkingOut}>
                {checkingOut ? "Redirecting..." : "Proceed to Checkout"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
