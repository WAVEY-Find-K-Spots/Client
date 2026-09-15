import { useEffect, useState, type ImgHTMLAttributes, type ReactNode } from "react";

interface SafeImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onError"> {
  src: string | null | undefined;
  fallback: ReactNode;
}

/**
 * presigned GET URL(프로필/배지 이미지 등)은 TTL이 지나면 만료돼 깨질 수 있어서,
 * 로드 실패 시 깨진 이미지 대신 폴백 UI를 보여준다.
 */
export default function SafeImage({ src, fallback, ...imgProps }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (!src || failed) return <>{fallback}</>;

  return <img src={src} onError={() => setFailed(true)} {...imgProps} />;
}
