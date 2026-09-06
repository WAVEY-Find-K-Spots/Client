import { createContext, useContext } from "react";

export const NOTIFICATIONS_STORAGE_KEY = "wavey.notifications.read";

export type NotifType = "stamp" | "route" | "spot" | "system";

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  at: string;
  link?: string;
}

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n-stamp-gyeongbokgung",
    type: "stamp",
    title: "스탬프를 획득했어요",
    body: "경복궁 방문 스탬프가 스탬프북에 추가됐어요.",
    at: "3시간 전",
    link: "/stamp",
  },
  {
    id: "n-route-night",
    type: "route",
    title: "새로운 추천 루트",
    body: "‘서울 야경 루트’가 회원님 취향에 맞을 것 같아요.",
    at: "어제",
    link: "/route",
  },
  {
    id: "n-spot-bukchon",
    type: "spot",
    title: "북촌한옥마을 새 리뷰",
    body: "저장한 스팟에 새 리뷰 12개가 달렸어요.",
    at: "2일 전",
    link: "/spot/bukchon",
  },
  {
    id: "n-badge-palace",
    type: "stamp",
    title: "뱃지 진행 상황",
    body: "‘궁궐 마스터’ 뱃지까지 스팟 1곳 남았어요.",
    at: "4일 전",
    link: "/stamp",
  },
  {
    id: "n-system-v1",
    type: "system",
    title: "WAVEY 1.0 업데이트",
    body: "루트 지도가 실제 지도로 업그레이드됐어요.",
    at: "5일 전",
  },
];

export interface NotificationsContextValue {
  items: (AppNotification & { read: boolean })[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const NotificationsContext =
  createContext<NotificationsContextValue | null>(null);

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error("useNotifications must be used within <NotificationsProvider>");
  return ctx;
}
