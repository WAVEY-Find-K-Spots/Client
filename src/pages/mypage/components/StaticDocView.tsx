import StatusBar from "@/components/layout/StatusBar";
import SubHeader from "./SubHeader";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import {
  getPolicy,
  getPolicyCategory,
  type PolicyData,
  type LegalDocumentType,
} from "@/lib/legal-documents-api";
import { useAuth } from "@/store/auth-context";

interface StaticDocViewProps {
  documentType: LegalDocumentType;
  onBack: () => void;
}

export default function StaticDocView({
  documentType,
  onBack,
}: StaticDocViewProps) {
  const { user } = useAuth();
  const language = user?.language === "EN" ? "en" : "ko";
  const [document, setDocument] = useState<PolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setDocument(null);
    setLoading(true);
    setError(false);

    getPolicy(getPolicyCategory(documentType), language)
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
  }, [documentType, language, retryCount]);

  const formatDate = (date: string) => {
    const normalized = date.trim();
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
            시행일 {formatDate(document.effectiveDate)} · v{document.version}
          </p>
          <div className="mt-4 text-[12.5px] leading-relaxed text-sub [&_h1]:mb-4 [&_h1]:text-[18px] [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:text-ink [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-[14px] [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-ink [&_h3]:mb-1.5 [&_h3]:mt-5 [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:text-ink [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_a]:text-brand [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-line [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-cream [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px]">
            <Markdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>
              {document.content}
            </Markdown>
          </div>
        </div>
      )}

      <div className="page-end-space" />
    </div>
  );
}
