import { useQuery } from "@tanstack/react-query";
import { bookingService } from "@/api/bookingService";
import type { Booking } from "@/types";
import { getImageUrl } from "@/api/client";
import { Gamepad2 } from "lucide-react";

const LibraryPage = () => {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["user-bookings"],
    queryFn: async () => {
      return await bookingService.getBookings();
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
        <Gamepad2 className="h-8 w-8 text-primary" /> My Library
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-card" />
          ))}
        </div>
      ) : bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="flex items-center gap-4 rounded-lg bg-card p-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {booking.game?.map((g) => (
                    <span key={g._id} className="font-display font-semibold">{g.name || (typeof g === 'string' ? g : 'Unknown Game')}</span>
                  ))}
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>${booking.price?.toFixed(2)}</span>
                  <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                  <span className={booking.paid ? "text-success" : "text-destructive"}>
                    {booking.paid ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <Gamepad2 className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg text-muted-foreground">No games in your library yet</p>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
