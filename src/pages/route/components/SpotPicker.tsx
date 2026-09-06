import { useState } from "react";
import { spots, spotGradientMap } from "@/mocks/spots";
import { Check, Plus } from "lucide-react";

interface SpotPickerProps {
  existingIds: string[];
  onAdd: (ids: string[]) => void;
  onClose: () => void;
}

export default function SpotPicker({ existingIds, onAdd, onClose }: SpotPickerProps) {
  const candidates = spots.filter((s) => !existingIds.includes(s.id));
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );

  const confirm = () => {
    if (selected.length === 0) return;
    onAdd(selected);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-ink/45" onClick={onClose} />
      <div className="relative bg-white rounded-t-[26px] flex flex-col max-h-[78%] min-h-0">
        {/* handle + title */}
        <div className="flex flex-col items-center pt-3 pb-3 shrink-0">
          <span className="w-10 h-1 rounded-full bg-line" />
          <div className="w-full flex items-center justify-between px-5 mt-3">
            <h3 className="text-[16px] font-bold text-ink">스팟 추가</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="text-[13px] font-medium text-muted cursor-pointer"
            >
              취소
            </button>
          </div>
        </div>

        {/* list */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 pb-2">
          {candidates.length === 0 ? (
            <p className="text-center text-[13px] text-muted py-10">
              추가할 수 있는 스팟이 없어요
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {candidates.map((s) => {
                const checked = selected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggle(s.id)}
                    className={`flex items-center gap-3 rounded-[16px] p-2.5 text-left cursor-pointer border ${
                      checked
                        ? "border-brand bg-cream/50"
                        : "border-line bg-white"
                    }`}
                  >
                    <span
                      className="w-12 h-12 rounded-xl shrink-0 overflow-hidden"
                      style={{ background: spotGradientMap[s.type] ?? "#A8623E" }}
                    >
                      <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[14px] font-semibold text-ink">
                        {s.name}
                      </span>
                      <span className="block text-[11px] text-muted mt-0.5">
                        {s.typeLabel} · {s.loc}
                      </span>
                    </span>
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${
                        checked ? "bg-brand" : "bg-cream"
                      }`}
                    >
                      {checked ? (
                        <Check size={13} color="#FFFFFF" strokeWidth={3} />
                      ) : (
                        <Plus size={14} color="#A89890" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* confirm */}
        <div className="px-5 pb-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={confirm}
            disabled={selected.length === 0}
            className="w-full h-[50px] rounded-full bg-ink text-white text-[14px] font-semibold cursor-pointer whitespace-nowrap disabled:opacity-40"
          >
            {selected.length > 0
              ? `${selected.length}개 스팟 추가하기`
              : "스팟을 선택해주세요"}
          </button>
        </div>
      </div>
    </div>
  );
}