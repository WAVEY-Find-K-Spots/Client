import { apiRequest } from "@/lib/auth/api";
import type { AuthUser } from "@/lib/auth/types";

export type AdminRole = "USER" | "ADMIN";
export type ResourceKind = "regions" | "spots" | "contents" | "badges";
export type MediaKind = "videos" | "tracks" | "albums";

export interface RegionAdminItem {
  regionId: number;
  nameKo: string;
  nameEn: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BadgeAdminItem {
  badgeId: number;
  name: string;
  nameEn?: string | null;
  requiredStamps: number;
  setType: boolean;
}

export interface SyncStatus {
  date: string;
  dailyCallLimit: number;
  safetyReserve: number;
  apiCallCount: number;
  remainingCalls: number;
  nextHeritagePage: number;
}

export interface SystemNotificationPayload {
  title: string;
  titleEn?: string;
  body: string;
  bodyEn?: string;
  recipientUserIds?: number[];
  targetType?: "STAMP" | "BADGE" | "ROUTE" | "SPOT" | "REVIEW" | "SYSTEM";
  targetId?: number;
  eventKey: string;
}

const resourcePaths: Record<ResourceKind, string> = {
  regions: "/api/v1/regions",
  spots: "/api/v1/spots",
  contents: "/api/v1/contents",
  badges: "/api/v1/admin/badges",
};

export const adminApi = {
  listUsers: () => apiRequest<AuthUser[]>("/api/v1/auth/all"),

  updateUserRole(userId: number, role: AdminRole) {
    const query = new URLSearchParams({ role });
    return apiRequest<void>(`/api/v1/auth/role/${userId}?${query.toString()}`, {
      method: "PATCH",
    });
  },

  createSystemNotification(payload: SystemNotificationPayload) {
    return apiRequest<{
      requestedCount: number;
      createdCount: number;
      skippedCount: number;
    }>("/api/v1/admin/notifications/system", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listRegions: () => apiRequest<RegionAdminItem[]>("/api/v1/regions"),

  listBadges: () =>
    apiRequest<BadgeAdminItem[]>("/api/v1/admin/badges"),

  createResource(kind: ResourceKind, payload: Record<string, unknown>) {
    return apiRequest<unknown>(resourcePaths[kind], {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateResource(
    kind: Exclude<ResourceKind, "contents">,
    resourceId: number,
    payload: Record<string, unknown>,
  ) {
    return apiRequest<unknown>(`${resourcePaths[kind]}/${resourceId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteResource(kind: ResourceKind, resourceId: number) {
    return apiRequest<void>(`${resourcePaths[kind]}/${resourceId}`, {
      method: "DELETE",
    });
  },

  collectContentMedia(contentId: number) {
    return apiRequest<unknown>(`/api/v1/contents/${contentId}/collect`, {
      method: "POST",
    });
  },

  refreshContentMedia(contentId: number, type: "videos" | "tracks") {
    return apiRequest<unknown>(`/api/v1/contents/${contentId}/${type}/refresh`, {
      method: "POST",
    });
  },

  setMediaVisibility(kind: MediaKind, mediaId: number, hidden: boolean) {
    return apiRequest<unknown>(`/api/v1/${kind}/${mediaId}`, {
      method: "PATCH",
      body: JSON.stringify({ hidden }),
    });
  },

  getSyncStatus: () =>
    apiRequest<SyncStatus>("/api/v1/spots/sync/status"),

  syncTourDaily(size: number) {
    return apiRequest<unknown>(`/api/v1/spots/sync/tour/daily?size=${size}`, {
      method: "POST",
    });
  },

  enrichPlace(name: string) {
    return apiRequest<unknown>("/api/v1/spots/sync/enrich/place", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  syncMediaPage(category: string, page: number, size: number) {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (category) query.set("category", category);
    return apiRequest<unknown>(`/api/v1/spots/sync/media/page?${query}`, {
      method: "POST",
    });
  },

  reviewTitleAutomation(title: string, category: string) {
    return apiRequest<unknown>("/api/v1/spots/sync/media/by-title", {
      method: "POST",
      body: JSON.stringify({ title, category }),
    });
  },
};