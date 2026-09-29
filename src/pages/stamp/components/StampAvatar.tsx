import { Lock, Check } from "lucide-react";
import { useEffect, useState } from "react";
import type { SpotCategory } from "@/lib/routes-api";
import {
  getStampCategoryTheme,
  type StampVisualState,
} from "../stamp-themes";
import CategoryThemeIcon from "../category-theme-icon";

interface StampAvatarProps {
  name: string;
  imageUrl?: string | null;
  category?: SpotCategory | null;
  state?: StampVisualState;
  size: number;
  className?: string;
  showCheck?: boolean;
}

/** 원형 스탬프 이미지 — <img> 우선, 없으면 그라데이션 */
export default function StampAvatar({
  name,
  imageUrl,
  category,
  state = "acquired",
  size,
  className = "",
  showCheck = false,
}: StampAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => setImgFailed(false), [imageUrl]);
  const theme = getStampCategoryTheme(category);
  const locked = state === "locked";
  const showImage = !locked && Boolean(imageUrl) && !imgFailed;
  return (
    <div
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: locked ? theme.background : theme.fallback,
      }}
    >
      {locked ? null : showImage ? (
        <img
          src={imageUrl!}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <CategoryThemeIcon
            category={category}
            size={Math.round(size * 0.32)}
            color="#FFFFFF"
            strokeWidth={1.8}
          />
        </div>
      )}
      {locked && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Lock size={Math.round(size * 0.3)} color={theme.accent} strokeWidth={2} />
        </span>
      )}
      {showCheck && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/15">
          <Check size={Math.round(size * 0.28)} color="#FFFFFF" strokeWidth={2.6} />
        </span>
      )}
    </div>
  );
}
