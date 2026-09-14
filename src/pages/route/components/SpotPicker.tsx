import { useEffect, useState } from "react";
import { spots as mockSpots, spotGradientMap } from "@/mocks/spots";
import { searchSpots } from "@/lib/spots-api";
import { toSpotCandidate, type SpotCandidate, type StopType } from "@/lib/route-adapters";
import { Check, Plus } from "lucide-react";

interface SpotPickerProps {
  routeId: number | null;
  onAdd: (spotIds: number[]) => void;
  onClose: () => void;
}

// 백엔드 /spots 연동 확인용 임시 데모 데이터.
// 실제 데이터가 비어있거나 API 호출이 실패할 때만 화면 확인용으로 보여준다.
// spotId는 실제 백엔드 스팟과 무관한 값이라 "추가하기"를 눌러도 서버에는 반영되지 않을 수 있다.
const MOCK_CANDIDATES: SpotCandidate[] = mockSpots.map((s, i) => ({
  id: String(i + 1),
  spotId: i + 1,
  name: s.name,
  loc: s.loc,
  image: s.image,
  type: s.type as StopType,
  typeLabel: s.typeLabel,
}));

export default function SpotPicker({ routeId, onAdd, onClose }: SpotPickerProps) {
  const [candidates, setCandidates] = useState<SpotCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotice(null);
    searchSpots(routeId ? { excludeRouteId: routeId } : {})
      .then((result) => {
        if (cancelled) return;
        if (result.spots.length === 0) {
          setCandidates(MOCK_CANDIDATES);
          setNotice("아직 실제 스팟 데이터가 없어 데모 스팟을 보여드려요.");
          return;
        }
        setCandidates(result.spots.map(toSpotCandidate));
      })
      .catch(() => {
        if (cancelled) return;
        setCandidates(MOCK_CANDIDATES);
        setNotice("스팟을 불러오지 못해 데모 스팟을 보여드려요.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [routeId]);

  const toggle = (id: string) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );

  const confirm = () => {
    if (selected.length === 0) return;
    onAdd(selected.map(Number));
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
          {notice && (
            <p className="w-full px-5 mt-2 text-[11px] text-brand">{notice}</p>
          )}
        </div>

        {/* list */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 pb-2">
          {loading ? (
            <p className="text-center text-[13px] text-muted py-10">
              불러오는 중...
            </p>
          ) : candidates.length === 0 ? (
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
