import StatusBar from "@/components/layout/StatusBar";
import SubHeader from "./SubHeader";
import { useEffect, useState } from "react";
import {
  getLegalDocument,
  type LegalDocument,
  type LegalDocumentType,
} from "@/lib/legal-documents-api";

interface StaticDocViewProps {
  documentType: LegalDocumentType;
  onBack: () => void;
}

export default function StaticDocView({
  documentType,
  onBack,
}: StaticDocViewProps) {
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setDocument(null);
    setLoading(true);
    setError(false);

    getLegalDocument(documentType)
      .then((response) => {
        if (!cancelled) setDocument(response);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [documentType, retryCount]);

  const formatUpdatedAt = (updatedAt: string) => {
    const normalized = updatedAt.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) {
      return normalized.slice(0, 10).replaceAll("-", ".");
    }
    return normalized;
  };

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />
      <SubHeader
        title={
          document?.title ||
          (documentType === "TERMS" ? "이용약관" : "개인정보 처리방침")
        }
        onBack={onBack}
      />

      {loading && (
        <div className="px-6 mt-8 text-center">
          <p className="text-[13px] text-muted">문서를 불러오는 중이에요...</p>
        </div>
      )}

      {!loading && error && (
        <div className="px-6 mt-8 text-center">
          <p className="text-[13px] font-semibold text-ink">
            문서를 불러오지 못했어요.
          </p>
          <p className="mt-1.5 text-[12px] text-muted">
            잠시 후 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="mt-4 h-9 px-4 rounded-full bg-ink text-[12px] font-semibold text-white cursor-pointer"
          >
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && document && (
        <div className="px-6 mt-5">
          <p className="text-[11px] text-muted">
            최종 업데이트 {formatUpdatedAt(document.updatedAt)}
          </p>
          <div className="mt-4 flex flex-col gap-5">
            {document.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="text-[14px] font-semibold text-ink">
                  {section.heading}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-sub whitespace-pre-line">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      )}

      <div className="h-24" />
    </div>
  );
}
