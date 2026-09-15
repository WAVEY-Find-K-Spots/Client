import { apiRequest } from "@/lib/auth/api";

export type UploadCategory = "PROFILE";

export interface PresignedUploadResult {
  uploadUrl: string;
  fileUrl: string;
  expiresAt: string;
}

/** POST /api/v1/uploads/presigned-url */
export function createPresignedUrl(category: UploadCategory, contentType: string) {
  return apiRequest<PresignedUploadResult>("/api/v1/uploads/presigned-url", {
    method: "POST",
    body: JSON.stringify({ category, contentType }),
  });
}

/** 스토리지로 직접 PUT 업로드 — 앱 서버를 거치지 않음(인증 헤더 불필요) */
export async function uploadFileToStorage(uploadUrl: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) {
    throw new Error("파일 업로드에 실패했어요.");
  }
}
