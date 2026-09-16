import { apiRequest } from "@/lib/auth/api";

export type LegalDocumentType = "TERMS" | "PRIVACY";

export interface LegalDocumentSection {
  heading: string;
  body: string;
}

export interface LegalDocument {
  type: LegalDocumentType;
  title: string;
  updatedAt: string;
  sections: LegalDocumentSection[];
}

const LEGAL_DOCUMENT_PATHS: Record<LegalDocumentType, string> = {
  TERMS: "/api/v1/policies/terms",
  PRIVACY: "/api/v1/policies/privacy",
};

type LegalDocumentPayload = LegalDocument | string;

function parseMarkdownDocument(
  markdown: string,
  type: LegalDocumentType,
): LegalDocument {
  const lines = markdown.split(/\r?\n/);
  const title = lines.find((line) => line.startsWith("# "))?.slice(2).trim();
  const updatedAt = lines
    .find((line) => /^(공고일|시행일):/.test(line.trim()))
    ?.replace(/^(공고일|시행일):\s*/, "")
    .trim();
  const sections: LegalDocumentSection[] = [];

  for (const line of lines) {
    const heading = line.match(/^#{2,3}\s+(.+)$/);
    if (heading) {
      sections.push({ heading: heading[1].trim(), body: "" });
      continue;
    }

    if (sections.length > 0) {
      const section = sections[sections.length - 1];
      section.body = section.body
        ? `${section.body}\n${line}`
        : line;
    }
  }

  return {
    type,
    title: title || (type === "TERMS" ? "이용약관" : "개인정보 처리방침"),
    updatedAt: updatedAt || "",
    sections: sections
      .map((section) => ({ ...section, body: section.body.trim() }))
      .filter((section) => section.heading !== "부칙" || section.body),
  };
}

/** 공개 법적 문서 조회 */
export async function getLegalDocument(type: LegalDocumentType) {
  const payload = await apiRequest<LegalDocumentPayload>(LEGAL_DOCUMENT_PATHS[type], {
    authenticated: false,
  });

  return typeof payload === "string"
    ? parseMarkdownDocument(payload, type)
    : payload;
}
