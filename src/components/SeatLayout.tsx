import React from 'react';
import { Seat } from '../types/index.js';
import { Armchair, Sparkles } from 'lucide-react';

interface SeatLayoutProps {
  seats: Seat[];
  selectedSeats: Seat[];
  onToggleSeat: (seat: Seat) => void;
  currentUserId?: string;
}

export const SeatLayout: React.FC<SeatLayoutProps> = ({
  seats,
  selectedSeats,
  onToggleSeat,
  currentUserId,
}) => {
  // Group seats by row
  const rowMap = new Map<string, Seat[]>();
  seats.forEach((seat) => {
    if (!rowMap.has(seat.row)) {
      rowMap.set(seat.row, []);
    }
    rowMap.get(seat.row)!.push(seat);
  });

  const sortedRows = Array.from(rowMap.keys()).sort();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 select-none">
      {/* Cinema Screen Curve */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-2xl h-8 relative overflow-hidden flex items-center justify-center">
          {/* Curved glowing screen banner */}
          <div className="w-[120%] h-14 border-t-4 border-red-500/80 rounded-t-[100%] shadow-[0_-12px_24px_rgba(239,68,68,0.25)] bg-gradient-to-b from-red-500/10 to-transparent"></div>
        </div>
        <p className="text-[11px] tracking-[0.25em] uppercase text-zinc-400 font-semibold mt-1">
          Cinema Screen • All Eyes This Way
        </p>
      </div>

      {/* Seating Grid */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[640px] space-y-3 flex flex-col items-center">
          {sortedRows.map((rowChar) => {
            const rowSeats = rowMap.get(rowChar)!.sort((a, b) => a.col - b.col);
            const tier = rowSeats[0]?.tier || 'Standard';

            return (
              <div key={rowChar} className="flex items-center gap-3">
                {/* Row label */}
                <span className="w-6 text-center text-xs font-bold text-zinc-400 font-mono">
                  {rowChar}
                </span>

                {/* Seat buttons */}
                <div className="flex items-center gap-2">
                  {rowSeats.map((seat, idx) => {
                    // Add aisle gap after column 6
                    const isAisle = idx === 5;
                    const isSelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
                    const isBooked = seat.status === 'booked';
                    const isHeldByOther = seat.status === 'held' && (!currentUserId || seat.userId !== currentUserId);

                    let seatClass = 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/60 cursor-pointer';

                    if (isBooked) {
                      seatClass = 'bg-[#18181f] text-zinc-600 border border-zinc-900 cursor-not-allowed opacity-50';
                    } else if (isHeldByOther) {
                      seatClass = 'bg-amber-950/40 text-amber-500/80 border border-amber-800/40 cursor-not-allowed';
                    } else if (isSelected) {
                      seatClass = 'bg-red-600 text-white font-bold border-red-500 ring-2 ring-red-400/80 shadow-lg shadow-red-950/80 scale-105';
                    } else if (seat.tier === 'VIP') {
                      seatClass = 'bg-zinc-800 text-amber-300 hover:bg-zinc-700 border border-amber-500/40';
                    } else if (seat.tier === 'Premium') {
                      seatClass = 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-600/80';
                    }

                    return (
                      <React.Fragment key={seat.seatNumber}>
                        <button
                          type="button"
                          disabled={isBooked || isHeldByOther}
                          onClick={() => onToggleSeat(seat)}
                          title={`${seat.seatNumber} • ${seat.tier} • $${seat.price}`}
                          className={`w-8 h-8 rounded-md flex flex-col items-center justify-center text-[10px] font-medium transition duration-150 ${seatClass}`}
                        >
                          <span>{seat.col}</span>
                        </button>

                        {isAisle && <div className="w-5" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Row label right */}
                <span className="w-6 text-center text-xs font-bold text-zinc-400 font-mono">
                  {rowChar}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Seat Tiers */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-zinc-800/80 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-[9px] text-zinc-300">
            1
          </div>
          <span className="text-zinc-300">Available</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-red-600 text-white font-bold flex items-center justify-center text-[9px] shadow-sm">
            ✓
          </div>
          <span className="text-zinc-300 font-medium">Selected</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-[9px] text-amber-400">
            ⏳
          </div>
          <span className="text-zinc-300">Held (In Progress)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#18181f] border border-zinc-900 flex items-center justify-center text-[9px] text-zinc-600 opacity-60">
            ✕
          </div>
          <span className="text-zinc-400">Booked</span>
        </div>
      </div>
    </div>
  );
};
