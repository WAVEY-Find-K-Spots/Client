import { Signal, Wifi, BatteryFull } from "lucide-react";

interface StatusBarProps {
  variant?: "dark" | "light";
}

export default function StatusBar({ variant = "dark" }: StatusBarProps) {
  const color = variant === "light" ? "#FFFFFF" : "#2C1810";
  return (
    <div
      className="flex items-center justify-between px-6 pt-4 pb-1 w-full select-none"
      style={{ color }}
    >
      <span className="text-[13px] font-semibold tracking-tight">9:41</span>
      <div className="flex items-center gap-2">
        <Signal size={13} strokeWidth={2.2} />
        <Wifi size={13} strokeWidth={2.2} />
        <BatteryFull size={15} strokeWidth={2} />
      </div>
    </div>
  );
}