import { apiRequest } from "@/lib/auth/api";

export type LegalDocumentType = "TERMS" | "PRIVACY";
export type PolicyCategory = "terms" | "privacy";
export type PolicyLanguage = "ko" | "en";

export interface PolicyData {
  category: PolicyCategory;
  language: PolicyLanguage;
  title: string;
  content: string;
  version: number;
  effectiveDate: string;
}

export interface PolicyApiResponse {
  statusCode: number;
  message: string;
  data: PolicyData;
}

const CATEGORY_BY_DOCUMENT_TYPE: Record<LegalDocumentType, PolicyCategory> = {
  TERMS: "terms",
  PRIVACY: "privacy",
};

/** 로그인 없이 통합 정책 API에서 이용약관 또는 개인정보 처리방침을 조회합니다. */
export async function getPolicy(
  category: PolicyCategory,
  language: PolicyLanguage = "ko",
): Promise<PolicyData> {
  const params = new URLSearchParams({ category, language });

  return apiRequest<PolicyData>(`/api/v1/policies?${params.toString()}`, {
    authenticated: false,
  });
}

/** 화면에서 사용하는 문서 타입을 통합 정책 API의 카테고리로 변환합니다. */
export function getPolicyCategory(type: LegalDocumentType): PolicyCategory {
  return CATEGORY_BY_DOCUMENT_TYPE[type];
}

/** 설정 화면의 표시 언어를 정책 API 언어 코드로 변환합니다. */
export function getPolicyLanguage(language: string | undefined): PolicyLanguage {
  return language === "English" ? "en" : "ko";
}
