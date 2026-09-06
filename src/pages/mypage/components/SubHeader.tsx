import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface SubHeaderProps {
  title: string;
  onBack: () => void;
  right?: ReactNode;
}

export default function SubHeader({ title, onBack, right }: SubHeaderProps) {
  return (
    <div className="px-5 pt-1 flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로가기"
        className="flex items-center justify-center w-9 h-9 rounded-2xl bg-cream cursor-pointer whitespace-nowrap"
      >
        <span className="flex items-center justify-center w-4 h-4">
          <ChevronLeft size={20} color="#2C1810" strokeWidth={2} />
        </span>
      </button>
      <span className="text-[18px] font-semibold text-ink">{title}</span>
      <div className="min-w-9 flex justify-end">{right}</div>
    </div>
  );
}
