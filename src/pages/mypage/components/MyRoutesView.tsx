import { useEffect, useMemo, useState } from "react";
import StatusBar from "@/components/layout/StatusBar";
import MiniMapThumb from "./MiniMapThumb";
import SubHeader from "./SubHeader";
import { useRoute } from "@/store/route-context";
import { getMyRoutes, deleteRoute, type RouteSummary } from "@/lib/routes-api";
import {
  Plus,
  ChevronsUpDown,
  MapPin,
  Lock,
  Globe2,
  Trash2,
} from "lucide-react";

interface MyRoutesViewProps {
  onBack: () => void;
  onToast: (msg: string) => void;
}

type Sort = "recent" | "name";
const sortOrder: Sort[] = ["recent", "name"];
const sortLabel: Record<Sort, string> = {
  recent: "최신순",
  name: "이름순",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export default function MyRoutesView({ onBack, onToast }: MyRoutesViewProps) {
  const { routeId: activeRouteId, switchRoute, clearRouteReference } = useRoute();
  const [list, setList] = useState<RouteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<Sort>("recent");

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyRoutes({ page: 0, size: 50 })
      .then((page) => {
        if (!cancelled) setList(page.content);
      })
      .catch(() => {
        if (!cancelled) setList([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const goCreate = () => navigate?.("/route");

  const openRoute = async (routeId: number) => {
    if (routeId !== activeRouteId) {
      await switchRoute(routeId);
    }
    navigate?.("/route");
  };

  const sorted = useMemo(() => {
    const arr = [...list];
    if (sort === "recent") {
      arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } else {
      arr.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    }
    return arr;
  }, [list, sort]);

  const cycleSort = () =>
    setSort((s) => sortOrder[(sortOrder.indexOf(s) + 1) % sortOrder.length]);

  const remove = async (routeId: number, name: string) => {
    try {
      await deleteRoute(routeId);
      setList((l) => l.filter((r) => r.routeId !== routeId));
      if (routeId === activeRouteId) clearRouteReference();
      onToast(`'${name}' 루트를 삭제했어요`);
    } catch {
      onToast("루트를 삭제하지 못했어요");
    }
  };

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />
      <SubHeader
        title="내 루트 목록"
        onBack={onBack}
        right={
          <button
            type="button"
            onClick={goCreate}
            aria-label="새 루트 만들기"
            className="flex items-center justify-center w-9 h-9 rounded-2xl bg-ink cursor-pointer whitespace-nowrap"
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={2.2} />
          </button>
        }
      />

      {/* 정렬 */}
      <div className="px-5 mt-4 flex items-center justify-between">
        <span className="text-[12px] text-muted">{list.length}개 루트</span>
        <button
          type="button"
          onClick={cycleSort}
          className="flex items-center gap-1 cursor-pointer whitespace-nowrap"
        >
          <span className="text-[12px] font-medium text-muted">{sortLabel[sort]}</span>
          <ChevronsUpDown size={14} color="#A89890" strokeWidth={2} />
        </button>
      </div>

      {/* 카드 리스트 */}
      <div className="px-5 mt-3 flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-[13px] text-muted py-10">
            불러오는 중...
          </p>
        ) : (
          sorted.map((r) => (
            <div
              key={r.routeId}
              className="bg-white rounded-[16px] shadow-soft overflow-hidden"
            >
              <button
                type="button"
                onClick={() => openRoute(r.routeId)}
                className="block w-full text-left cursor-pointer"
              >
                <MiniMapThumb count={r.spotCount} />
                <div className="p-4 pb-2">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[15px] font-semibold text-ink">{r.name}</h3>
                    {r.routeId === activeRouteId && (
                      <span className="px-1.5 h-[18px] rounded-full bg-brand/15 text-brand text-[10px] font-semibold flex items-center">
                        현재 루트
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <MapPin size={13} color="#A89890" strokeWidth={2} />
                      {r.spotCount}개 스팟
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      {r.visibility === "PUBLIC" ? (
                        <Globe2 size={13} color="#A89890" strokeWidth={2} />
                      ) : (
                        <Lock size={13} color="#A89890" strokeWidth={2} />
                      )}
                      {r.visibility === "PUBLIC" ? "공개" : "비공개"}
                    </span>
                    <span className="whitespace-nowrap">
                      {formatDate(r.updatedAt)}
                    </span>
                  </div>
                </div>
              </button>
              <div className="px-4 pb-3 pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => remove(r.routeId, r.name)}
                  aria-label={`${r.name} 삭제`}
                  className="flex items-center gap-1 text-[12px] font-medium text-muted cursor-pointer whitespace-nowrap"
                >
                  <Trash2 size={14} color="#A89890" strokeWidth={2} />
                  삭제
                </button>
              </div>
            </div>
          ))
        )}

        {!loading && list.length === 0 && (
          <p className="text-center text-[13px] text-muted py-6">
            저장된 루트가 없어요
          </p>
        )}

        <button
          type="button"
          onClick={goCreate}
          className="w-full h-[80px] rounded-[16px] border border-dashed border-line flex flex-col items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
        >
          <Plus size={18} color="#A89890" strokeWidth={2} />
          <span className="text-[14px] font-medium text-muted">새 루트 만들기</span>
        </button>
      </div>

      <div className="h-24" />
    </div>
  );
}
