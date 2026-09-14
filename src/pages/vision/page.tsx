import { useEffect, useRef, useState, type ChangeEvent } from "react";
import StatusBar from "@/components/layout/StatusBar";
import { ApiError } from "@/lib/auth/api";
import { getCurrentCoords, type LatLng } from "@/lib/geo";
import {
  visionApi,
  type VisionAnalysisResult,
  type VisionFeature,
} from "@/lib/vision/api";
import {
  Camera,
  Check,
  CircleAlert,
  ImagePlus,
  Languages,
  Landmark,
  LoaderCircle,
  LocateFixed,
  MapPin,
  RotateCcw,
  ScanLine,
  Sparkles,
  X,
  Globe2,
} from "lucide-react";
import VisionResults from "./results";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const featureOptions: Array<{
  id: VisionFeature;
  title: string;
  description: string;
  icon: typeof Languages;
}> = [
  {
    id: "TRANSLATION",
    title: "OCR 번역",
    description: "한국어를 영어로 번역하고 문화 용어를 설명해요",
    icon: Languages,
  },
  {
    id: "HERITAGE",
    title: "문화유산",
    description: "사진 속 문화유산과 공식 명칭을 찾아요",
    icon: Landmark,
  },
  {
    id: "WEB_SEARCH",
    title: "관련 정보",
    description: "이미지와 관련된 키워드와 웹 문서를 찾아요",
    icon: Globe2,
  },
];

function getErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "이미지를 분석하지 못했어요. 잠시 후 다시 시도해 주세요.";
  }
  if (error.code === "VISION_400_IMAGE_TYPE") {
    return "지원하지 않는 이미지예요. JPG, PNG, WEBP 파일을 선택해 주세요.";
  }
  if (error.status === 429) {
    return "요청이 많아 잠시 쉬고 있어요. 잠시 후 다시 시도해 주세요.";
  }
  return error.message;
}

export default function VisionPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [features, setFeatures] = useState<VisionFeature[]>(["TRANSLATION"]);
  const [location, setLocation] = useState<LatLng | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [result, setResult] = useState<VisionAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    event.target.value = "";
    if (!nextFile) return;
    if (!SUPPORTED_IMAGE_TYPES.includes(nextFile.type)) {
      setError("JPG, PNG, WEBP 형식의 이미지만 선택할 수 있어요.");
      return;
    }
    if (nextFile.size > MAX_IMAGE_SIZE) {
      setError("이미지는 5MB 이하만 선택할 수 있어요.");
      return;
    }
    setFile(nextFile);
    setResult(null);
    setError(null);
  };

  const toggleFeature = (feature: VisionFeature) => {
    setFeatures((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature],
    );
    setResult(null);
    setError(null);
  };

  const requestLocation = async () => {
    if (location) {
      setLocation(null);
      return;
    }
    setLocationLoading(true);
    setError(null);
    try {
      setLocation(await getCurrentCoords());
    } catch {
      setError("현재 위치를 가져오지 못했어요. 위치 권한을 확인해 주세요.");
    } finally {
      setLocationLoading(false);
    }
  };

  const analyze = async () => {
    if (!file || features.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await visionApi.analyze({ file, features, location });
      setResult(data);
      window.setTimeout(() => {
        document.getElementById("vision-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-full bg-page pb-28">
      <StatusBar variant="dark" />
      <header className="flex items-center justify-between px-5 pt-1">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-brand">WAVEY LENS</p>
          <h1 className="mt-0.5 text-[22px] font-extrabold tracking-tight text-ink">
            사진으로 알아보기
          </h1>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-cream">
          <ScanLine size={20} color="#A8623E" strokeWidth={2.1} />
        </span>
      </header>

      <main className="px-5">
        <section className="relative mt-4 overflow-hidden rounded-[24px] bg-ink px-5 py-5 text-white shadow-soft">
          <div className="absolute -right-7 -top-9 h-28 w-28 rounded-full bg-brand/35" />
          <div className="absolute -bottom-10 right-12 h-20 w-20 rounded-full bg-cta/10" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-cream">
              <Sparkles size={12} /> AI 여행 도슨트
            </span>
            <p className="mt-3 text-[17px] font-bold leading-snug">
              한 장의 사진으로<br />낯선 한국 문화를 이해해 보세요
            </p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-cream/70">
              정지 이미지에서 번역·문화유산·관련 정보를 한 번에 분석해요.
            </p>
          </div>
        </section>

        <section className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-ink">분석할 사진</h2>
            <span className="text-[10px] text-muted">JPG · PNG · WEBP / 최대 5MB</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={selectFile}
            className="hidden"
          />

          {previewUrl ? (
            <div className="relative mt-3 overflow-hidden rounded-[22px] bg-white shadow-soft">
              <img src={previewUrl} alt="분석할 이미지 미리보기" className="h-[210px] w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-ink/85 to-transparent px-4 pb-4 pt-12">
                <div className="min-w-0 pr-3">
                  <p className="truncate text-[12px] font-semibold text-white">{file?.name}</p>
                  <p className="mt-0.5 text-[10px] text-white/65">
                    {file ? (file.size / 1024 / 1024).toFixed(1) : "0"}MB
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => inputRef.current?.click()} className="flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-[11px] font-semibold text-ink">
                    <ImagePlus size={14} /> 교체
                  </button>
                  <button type="button" onClick={reset} aria-label="이미지 제거" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur">
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => inputRef.current?.click()} className="mt-3 flex h-[190px] w-full flex-col items-center justify-center rounded-[22px] border border-dashed border-cta bg-white shadow-card">
              <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-cream text-brand">
                <Camera size={25} strokeWidth={1.9} />
              </span>
              <span className="mt-3 text-[14px] font-semibold text-ink">사진 촬영 또는 선택</span>
              <span className="mt-1 text-[11px] text-muted">문자가 선명한 사진일수록 정확해요</span>
            </button>
          )}
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-ink">알아볼 내용</h2>
            <span className="text-[10px] text-muted">여러 개 선택 가능</span>
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            {featureOptions.map((option) => {
              const selected = features.includes(option.id);
              const Icon = option.icon;
              return (
                <button key={option.id} type="button" aria-pressed={selected} onClick={() => toggleFeature(option.id)} className={`flex w-full items-center gap-3 rounded-[18px] border p-3.5 text-left transition-colors ${selected ? "border-brand bg-cream" : "border-line bg-white"}`}>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${selected ? "bg-brand text-white" : "bg-cream text-brand"}`}>
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-ink">{option.title}</span>
                    <span className="mt-0.5 block text-[10.5px] leading-relaxed text-sub">{option.description}</span>
                  </span>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-brand bg-brand text-white" : "border-line text-transparent"}`}>
                    <Check size={12} strokeWidth={3} />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {features.includes("HERITAGE") && (
          <section className="mt-3 rounded-[18px] border border-line bg-white p-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-cream text-brand"><MapPin size={17} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-ink">현재 위치로 정확도 높이기</p>
                <p className="mt-0.5 text-[10px] text-muted">위치는 문화유산 후보를 좁힐 때만 사용해요</p>
              </div>
              <button type="button" disabled={locationLoading} onClick={requestLocation} className={`flex h-8 items-center gap-1 rounded-full px-3 text-[10px] font-semibold ${location ? "bg-ink text-white" : "bg-cream text-brand"}`}>
                {locationLoading ? <LoaderCircle size={12} className="animate-spin" /> : <LocateFixed size={12} />}
                {location ? "사용 중" : "위치 사용"}
              </button>
            </div>
          </section>
        )}

        {error && (
          <div role="alert" className="mt-4 flex gap-2.5 rounded-[16px] border border-[#E8C4B6] bg-[#FFF1EB] p-3.5">
            <CircleAlert size={17} className="mt-0.5 shrink-0 text-brand" />
            <p className="text-[11.5px] leading-relaxed text-ink">{error}</p>
          </div>
        )}

        <button type="button" disabled={!file || features.length === 0 || loading} onClick={analyze} className="mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-[20px] bg-ink text-[14px] font-semibold text-white shadow-soft disabled:bg-line disabled:text-muted disabled:shadow-none">
          {loading ? (
            <><LoaderCircle size={18} className="animate-spin" /> 이미지를 살펴보고 있어요</>
          ) : (
            <><Sparkles size={17} /> 선택한 기능으로 분석하기</>
          )}
        </button>

        {result && <VisionResults result={result} onReset={reset} />}
      </main>
    </div>
  );
}
