import { Clock, X, Sparkles } from "lucide-react";

interface SearchPanelProps {
  recommended: string[];
  recent: string[];
  onPick: (kw: string) => void;
  onRemoveRecent: (kw: string) => void;
  onClearRecent: () => void;
}

export default function SearchPanel({
  recommended,
  recent,
  onPick,
  onRemoveRecent,
  onClearRecent,
}: SearchPanelProps) {
  return (
    <div className="px-5 pb-6">
      {/* recommended */}
      <p className="text-[12px] font-medium text-muted">추천 검색어</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {recommended.map((kw) => (
          <button
            key={kw}
            type="button"
            onClick={() => onPick(kw)}
            className="px-3.5 h-9 rounded-full bg-cream text-brand border border-[#EDCFB8] text-[13px] font-medium cursor-pointer whitespace-nowrap"
          >
            {kw}
          </button>
        ))}
      </div>

      {/* recent */}
      <div className="mt-7 flex items-center justify-between">
        <p className="text-[12px] font-medium text-muted">최근 검색</p>
        {recent.length > 0 && (
          <button
            type="button"
            onClick={onClearRecent}
            className="text-[11px] text-muted cursor-pointer whitespace-nowrap"
          >
            전체 삭제
          </button>
        )}
      </div>
      <div className="mt-1 divide-y divide-[#F5F1EE]">
        {recent.length === 0 ? (
          <p className="py-8 text-center text-[12px] text-muted">
            최근 검색어가 없어요
          </p>
        ) : (
          recent.map((kw) => (
            <div
              key={kw}
              className="flex items-center justify-between h-11 cursor-pointer"
              onClick={() => onPick(kw)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") onPick(kw);
              }}
            >
              <span className="flex items-center gap-2.5 text-[13px] text-ink">
                <span className="flex items-center justify-center w-4 h-4">
                  <Clock size={15} color="#DDD4CE" strokeWidth={2} />
                </span>
                {kw}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveRecent(kw);
                }}
                className="flex items-center justify-center w-6 h-6 rounded-full cursor-pointer"
                aria-label={`${kw} 삭제`}
              >
                <span className="flex items-center justify-center w-3.5 h-3.5">
                  <X size={14} color="#DDD4CE" strokeWidth={2} />
                </span>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-7 flex items-start gap-2.5 p-4 rounded-2xl bg-cream">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white shrink-0">
          <Sparkles size={16} color="#A8623E" />
        </span>
        <p className="text-[12px] text-muted leading-relaxed">
          장소명 또는 드라마·영화 제목으로 검색하면 해당 콘텐츠가 촬영된 스팟을
          바로 찾을 수 있어요.
        </p>
      </div>
    </div>
  );
}