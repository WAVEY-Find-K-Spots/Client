import { useEffect, useState } from "react";
import type { TranslationLayoutBlock } from "@/lib/vision/api";
import {
  CircleAlert,
  Image as ImageIcon,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { createTranslatedImage } from "./translated-image";

interface TranslatedImageBetaProps {
  imageUrl: string;
  blocks: TranslationLayoutBlock[];
}

type ImageMode = "original" | "translated";

export default function TranslatedImageBeta({
  imageUrl,
  blocks,
}: TranslatedImageBetaProps) {
  const [translatedUrl, setTranslatedUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<ImageMode>("original");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode("original");
    setError(null);
    setTranslatedUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }, [imageUrl, blocks]);

  useEffect(
    () => () => {
      if (translatedUrl) URL.revokeObjectURL(translatedUrl);
    },
    [translatedUrl],
  );

  const generate = async () => {
    if (translatedUrl) {
      setMode("translated");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const blob = await createTranslatedImage(imageUrl, blocks);
      const url = URL.createObjectURL(blob);
      setTranslatedUrl(url);
      setMode("translated");
    } catch {
      setMode("original");
      setError(
        "번역 이미지를 만들지 못했어요. 위의 텍스트 번역 결과를 확인해 주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t border-line pt-4">
      {!translatedUrl && (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={() => void generate()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-[15px] bg-ink text-[12px] font-semibold text-white disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle size={15} className="animate-spin" />
                번역 이미지를 만들고 있어요
              </>
            ) : (
              <>
                <Sparkles size={15} />
                이미지 위에 번역 보기
                <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[8px] uppercase tracking-wide">
                  Beta
                </span>
              </>
            )}
          </button>
          <p className="mt-2 text-center text-[9.5px] leading-relaxed text-muted">
            개발 중인 기능으로, 이미지의 배경과 글자 배치에 따라
            <br />번역 위치 또는 표시 결과가 정확하지 않을 수 있어요.
          </p>
        </>
      )}

      {translatedUrl && (
        <div>
          <div className="flex rounded-[13px] bg-cream p-1">
            <ModeButton
              active={mode === "original"}
              onClick={() => setMode("original")}
            >
              원본 이미지
            </ModeButton>
            <ModeButton
              active={mode === "translated"}
              onClick={() => setMode("translated")}
            >
              번역 이미지
            </ModeButton>
          </div>
          <div className="mt-3 overflow-hidden rounded-[16px] border border-line bg-page">
            <img
              src={mode === "translated" ? translatedUrl : imageUrl}
              alt={mode === "translated" ? "영문 번역이 합성된 이미지" : "원본 이미지"}
              className="h-auto max-h-[520px] w-full object-contain"
            />
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-[9.5px] leading-relaxed text-muted">
            <ImageIcon size={11} className="mt-0.5 shrink-0" />
            자동 합성 결과로 원본 글꼴·배경과 다르게 표시될 수 있어요.
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 flex gap-2 rounded-[12px] bg-[#FFF1EB] p-3 text-[10px] leading-relaxed text-ink">
          <CircleAlert size={14} className="mt-0.5 shrink-0 text-brand" />
          {error}
        </p>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-8 flex-1 rounded-[10px] text-[10.5px] font-semibold transition-colors ${
        active ? "bg-white text-ink shadow-sm" : "text-muted"
      }`}
    >
      {children}
    </button>
  );
}
