import Script from "next/script";

type AdSlotProps = {
  placement?: "leaderboard" | "inline" | "sidebar";
  className?: string;
};

export default function AdSlot({ placement = "leaderboard", className = "" }: AdSlotProps) {
  const sizing = {
    leaderboard: "min-h-[92px]",
    inline: "min-h-[120px]",
    sidebar: "min-h-[250px]",
  }[placement];

  return (
    <div
      className={`relative flex ${sizing} items-center justify-center border border-dashed border-white/10 bg-white/[0.015] px-4 py-5 ${className}`}
      aria-label="Advertisement"
    >
      {placement === "leaderboard" ? (
        <>
          <Script
            id="aflab-native-ad-script"
            src="https://pl32026036.profitableratecpmnetwork.com/cdc603160e67c3f4c5b87ee3e3a29530/invoke.js"
            strategy="afterInteractive"
            data-cfasync="false"
          />
          <div
            id="container-cdc603160e67c3f4c5b87ee3e3a29530"
            className="w-full"
          />
        </>
      ) : (
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-600">Advertisement</p>
          <p className="mt-1 text-xs text-stone-700">Ad space reserved</p>
        </div>
      )}
    </div>
  );
}
