type AdSlotProps = {
  placement?: "leaderboard" | "inline" | "sidebar";
  className?: string;
};

/**
 * Visual placeholder only.
 * Intentionally does not load advertising scripts or set cookies.
 * Replace with the provider's approved integration only after approval
 * and after consent management has been configured.
 */
export default function AdSlot({ placement = "leaderboard", className = "" }: AdSlotProps) {
  const sizing = {
    leaderboard: "min-h-[92px]",
    inline: "min-h-[120px]",
    sidebar: "min-h-[250px]",
  }[placement];

  return (
    <div
      className={`relative flex ${sizing} items-center justify-center border border-dashed border-white/10 bg-white/[0.015] px-4 py-5 ${className}`}
      aria-label="Advertising placement reserved"
    >
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-600">Advertisement</p>
        <p className="mt-1 text-xs text-stone-700">Ad space reserved</p>
      </div>
    </div>
  );
}
