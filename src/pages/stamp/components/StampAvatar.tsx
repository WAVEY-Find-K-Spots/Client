import { Check } from "lucide-react";

const FALLBACK =
  "linear-gradient(158deg,#7a3d28,#c96a42)";

interface StampAvatarProps {
  name: string;
  imageUrl?: string | null;
  size: number;
  className?: string;
  showCheck?: boolean;
}

/** 원형 스탬프 이미지 — <img> 우선, 없으면 그라데이션 */
export default function StampAvatar({
  name,
  imageUrl,
  size,
  className = "",
  showCheck = false,
}: StampAvatarProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full" style={{ background: FALLBACK }} />
      )}
      {showCheck && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/15">
          <Check size={Math.round(size * 0.28)} color="#FFFFFF" strokeWidth={2.6} />
        </span>
      )}
    </div>
  );
}
