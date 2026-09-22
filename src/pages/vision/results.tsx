import type { VisionAnalysisResult } from "@/lib/vision/api";
import TranslatedImageBeta from "./TranslatedImageBeta";
import {
  Check,
  ChevronRight,
  ExternalLink,
  Globe2,
  Languages,
  Landmark,
  MapPin,
  RotateCcw,
} from "lucide-react";

interface VisionResultsProps {
  result: VisionAnalysisResult;
  imageUrl: string | null;
  onReset: () => void;
}

export default function VisionResults({
  result,
  imageUrl,
  onReset,
}: VisionResultsProps) {
  return (
    <section id="vision-results" className="scroll-mt-4 pt-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E5EFE2] text-[#52714C]">
            <Check size={15} strokeWidth={2.5} />
          </span>
          <h2 className="text-[17px] font-bold text-ink">분석 결과</h2>
        </div>
        <button type="button" onClick={onReset} className="flex items-center gap-1 text-[11px] font-medium text-brand">
          <RotateCcw size={13} /> 새 사진
        </button>
      </div>

      {result.translation && (
        <article className="mt-4 overflow-hidden rounded-[22px] bg-white shadow-card">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-cream text-brand"><Languages size={16} /></span>
            <div>
              <h3 className="text-[13px] font-semibold text-ink">한국어 → English</h3>
              <p className="text-[9.5px] text-muted">문화 용어를 반영한 번역</p>
            </div>
          </div>
          <div className="px-4 py-4">
            <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-muted">{result.translation.originalText}</p>
            <div className="my-3 h-px bg-line" />
            <p className="whitespace-pre-wrap text-[13px] font-medium leading-relaxed text-ink">{result.translation.translatedText}</p>
            {imageUrl && (result.translation.layoutBlocks?.length ?? 0) > 0 && (
              <TranslatedImageBeta
                imageUrl={imageUrl}
                blocks={result.translation.layoutBlocks ?? []}
              />
            )}
          </div>
          {result.translation.terms?.length > 0 && (
            <div className="border-t border-line bg-[#FCF4ED] px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">Cultural notes</p>
              <div className="mt-2.5 flex flex-col gap-2">
                {result.translation.terms.map((term, index) => (
                  <div key={`${term.original}-${index}`} className="rounded-[14px] bg-white p-3">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-[12px] font-bold text-ink">{term.original}</span>
                      <span className="text-[11px] font-semibold text-brand">{term.translatedName}</span>
                    </div>
                    <p className="mt-1.5 text-[10.5px] leading-relaxed text-sub">
                      {term.description || term.koreanDescription}
                    </p>
                    {term.ambiguous && (
                      <p className="mt-1 text-[9.5px] text-[#A76B22]">문맥에 따라 다른 의미일 수 있어요.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      )}

      {result.heritage && (
        <article className="mt-4 rounded-[22px] bg-white p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-cream text-brand"><Landmark size={16} /></span>
            <div>
              <h3 className="text-[13px] font-semibold text-ink">문화유산</h3>
              <p className="text-[9.5px] text-muted">사진과 위치를 기준으로 찾은 후보</p>
            </div>
          </div>
          {result.heritage.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2.5">
              {result.heritage.map((item) => (
                <div key={item.id} className="rounded-[16px] border border-line p-3.5">
                  <p className="text-[13px] font-bold text-ink">{item.koreanName}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-brand">{item.englishName}</p>
                  <span className="mt-2 inline-flex rounded-full bg-cream px-2 py-1 text-[9px] font-medium text-sub">{item.designationType}</span>
                  <p className="mt-2.5 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-muted">
                    <MapPin size={12} className="mt-0.5 shrink-0" />
                    {item.detailedAddress || item.address}
                  </p>
                  <p className="mt-2 text-[10.5px] leading-relaxed text-sub">
                    {item.englishDescription || item.koreanDescription}
                  </p>
                  {item.translationRequired && (
                    <p className="mt-2 text-[9px] text-muted">영문 공식 명칭이 없어 번역된 명칭이에요.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyMessage>일치하는 문화유산을 찾지 못했어요.</EmptyMessage>
          )}
        </article>
      )}

      {result.webSearch && (
        <article className="mt-4 rounded-[22px] bg-white p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-cream text-brand"><Globe2 size={16} /></span>
            <div>
              <h3 className="text-[13px] font-semibold text-ink">관련 정보</h3>
              <p className="text-[9.5px] text-muted">이미지와 유사한 웹 검색 결과</p>
            </div>
          </div>
          <WebLabels result={result} />
          {(result.webSearch.pagesWithImages || []).length > 0 ? (
            <div className="mt-3 flex flex-col divide-y divide-line">
              {result.webSearch.pagesWithImages.slice(0, 5).map((page) => (
                <a key={page.url} href={page.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 py-3 text-[11px] text-ink">
                  <ExternalLink size={13} className="shrink-0 text-brand" />
                  <span className="min-w-0 flex-1 truncate">{page.title || page.url}</span>
                  <ChevronRight size={13} className="shrink-0 text-muted" />
                </a>
              ))}
            </div>
          ) : (
            <EmptyMessage>관련 웹 문서를 찾지 못했어요.</EmptyMessage>
          )}
        </article>
      )}
    </section>
  );
}

function WebLabels({ result }: { result: VisionAnalysisResult }) {
  if (!result.webSearch) return null;
  const labels = [
    ...(result.webSearch.bestGuessLabels || []),
    ...(result.webSearch.webEntities || []),
  ];
  const uniqueLabels = [...new Set(labels)].slice(0, 10);
  if (uniqueLabels.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {uniqueLabels.map((label) => (
        <span key={label} className="rounded-full bg-cream px-2.5 py-1.5 text-[10px] font-medium text-sub">#{label}</span>
      ))}
    </div>
  );
}

function EmptyMessage({ children }: { children: string }) {
  return (
    <p className="mt-3 rounded-[14px] bg-cream px-3 py-4 text-center text-[11px] text-sub">
      {children}
    </p>
  );
}
