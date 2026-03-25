import { useQuery } from "@tanstack/react-query";
import { bookingService } from "@/api/bookingService";
import type { Booking } from "@/types";
import { Gamepad2 } from "lucide-react";

const LibraryPage = () => {
  const {
    data: bookings = [], // ✅ default prevents undefined errors
    isLoading,
    isError,
    error,
  } = useQuery<Booking[]>({
    queryKey: ["user-bookings"],
    queryFn: async () => {
      try {
        const res = await bookingService.getBookings();
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        return [];
      }
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
        <Gamepad2 className="h-8 w-8 text-primary" /> My Library
      </h1>

      {/* 🔄 Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-card" />
          ))}
        </div>
      )}

      {/* ❌ Error */}
      {isError && (
        <div className="py-20 text-center">
          <p className="text-destructive">Failed to load your library</p>
          {error && <p className="text-sm text-muted-foreground mt-2">{String(error)}</p>}
        </div>
      )}

      {/* ✅ Data */}
      {!isLoading && !isError && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="flex items-center gap-4 rounded-lg bg-card p-4"
            >
              <div className="flex-1">
                {/* 🎮 Games */}
                <div className="flex flex-wrap gap-2">
                  {(booking.games ?? []).map((g: any, index: number) => (
                    <span key={g?._id || index} className="font-display font-semibold text-sm">
                      {typeof g === "string" ? g : g?.name || "Unknown Game"}
                    </span>
                  ))}
                </div>

                {/* 📊 Info */}
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    ${typeof booking.price === "number"
                      ? booking.price.toFixed(2)
                      : "0.00"}
                  </span>

                  <span>
                    {booking.createdAt
                      ? new Date(booking.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>

                  <span
                    className={
                      booking.paid ? "text-green-500" : "text-red-500"
                    }
                  >
                    {booking.paid ? "✓ Paid" : "⏳ Pending"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📭 Empty */}
      {!isLoading && !isError && bookings.length === 0 && (
        <div className="py-20 text-center">
          <Gamepad2 className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg text-muted-foreground">
            No games in your library yet
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Start shopping to add games to your library</p>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;