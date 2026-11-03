import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BellRing,
  ChevronLeft,
  Database,
  RefreshCw,
  Send,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";
import { ApiError } from "@/lib/auth/api";
import type { AuthUser } from "@/lib/auth/types";
import {
  adminApi,
  type AdminRole,
  type BadgeAdminItem,
  type MediaKind,
  type RegionAdminItem,
  type ResourceKind,
  type SyncStatus,
} from "@/lib/admin-api";
import { useAuth } from "@/store/auth-context";

type Section = "overview" | "users" | "notifications" | "resources" | "sync";
type ResourceAction = "create" | "update" | "delete";

const resourceTemplates: Record<ResourceKind, string> = {
  regions: JSON.stringify({ nameKo: "서울", nameEn: "Seoul" }, null, 2),
  spots: JSON.stringify(
    {
      regionId: 1,
      nameKo: "샘플 스팟",
      nameEn: "Sample Spot",
      category: "K_DRAMA",
      placeType: "OTHER",
      descriptionKo: "관리자 화면 생성 예시",
      descriptionEn: "Admin console example",
      addressKo: "서울특별시",
      addressEn: "Seoul",
      latitude: 37.5665,
      longitude: 126.978,
    },
    null,
    2,
  ),
  contents: JSON.stringify(
    { titleKo: "샘플 콘텐츠", titleEn: "Sample Content", category: "DRAMA" },
    null,
    2,
  ),
  badges: JSON.stringify(
    {
      name: "서울 탐험가",
      nameEn: "Seoul Explorer",
      description: "서울 스팟 5곳 방문",
      descriptionEn: "Visit five Seoul spots",
      requiredStamps: 5,
      regionId: 1,
      category: null,
      spotIds: null,
    },
    null,
    2,
  ),
};

const sectionMeta = [
  { id: "overview" as const, icon: ShieldCheck, label: "admin.overview" },
  { id: "users" as const, icon: Users, label: "admin.users" },
  { id: "notifications" as const, icon: BellRing, label: "admin.notifications" },
  { id: "resources" as const, icon: Database, label: "admin.resources" },
  { id: "sync" as const, icon: RefreshCw, label: "admin.sync" },
];

const inputClass =
  "w-full h-11 rounded-[12px] border border-line bg-white px-3 text-[13px] text-ink outline-none placeholder:text-[#B7AAA1] focus:border-brand";
const textAreaClass =
  "w-full rounded-[12px] border border-line bg-white px-3 py-2.5 text-[12px] leading-relaxed text-ink outline-none placeholder:text-[#B7AAA1] focus:border-brand";
const buttonClass =
  "h-11 rounded-[12px] bg-ink px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

function numeric(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default function AdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, initializing } = useAuth();
  const [section, setSection] = useState<Section>("overview");
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [regions, setRegions] = useState<RegionAdminItem[]>([]);
  const [badges, setBadges] = useState<BadgeAdminItem[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState<unknown>(null);

  const [notification, setNotification] = useState({
    title: "",
    titleEn: "",
    body: "",
    bodyEn: "",
    recipients: "",
    targetType: "SYSTEM",
    targetId: "",
    eventKey: "",
  });
  const [notificationAttempted, setNotificationAttempted] = useState(false);

  const [resourceKind, setResourceKind] = useState<ResourceKind>("regions");
  const [resourceAction, setResourceAction] = useState<ResourceAction>("create");
  const [resourceId, setResourceId] = useState("");
  const [resourceJson, setResourceJson] = useState(resourceTemplates.regions);

  const [contentId, setContentId] = useState("");
  const [mediaKind, setMediaKind] = useState<MediaKind>("videos");
  const [mediaId, setMediaId] = useState("");
  const [mediaHidden, setMediaHidden] = useState(true);

  const [tourSize, setTourSize] = useState("10");
  const [placeName, setPlaceName] = useState("");
  const [syncCategory, setSyncCategory] = useState("K_DRAMA");
  const [syncPage, setSyncPage] = useState("0");
  const [syncSize, setSyncSize] = useState("20");
  const [contentTitle, setContentTitle] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextUsers, nextRegions, nextBadges, nextSyncStatus] =
        await Promise.all([
          adminApi.listUsers(),
          adminApi.listRegions(),
          adminApi.listBadges(),
          adminApi.getSyncStatus(),
        ]);
      setUsers(nextUsers);
      setRegions(nextRegions);
      setBadges(nextBadges);
      setSyncStatus(nextSyncStatus);
    } catch (loadError) {
      setError(errorMessage(loadError, t("admin.loadFailed")));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (user?.role === "ADMIN") void loadDashboard();
  }, [loadDashboard, user?.role]);

  const runAction = async (
    key: string,
    action: () => Promise<unknown>,
    refresh = false,
  ) => {
    if (busy) return;
    setBusy(key);
    setNotice("");
    setError("");
    try {
      const result = await action();
      setLastResult(result ?? { success: true });
      setNotice(t("admin.done"));
      if (refresh) await loadDashboard();
    } catch (actionError) {
      setError(errorMessage(actionError, t("admin.actionFailed")));
    } finally {
      setBusy("");
    }
  };

  const overviewCards = useMemo(
    () => [
      { label: t("admin.userCount"), value: users.length, section: "users" as const },
      { label: t("admin.regionCount"), value: regions.length, section: "resources" as const },
      { label: t("admin.badgeCount"), value: badges.length, section: "resources" as const },
      {
        label: t("admin.remainingCalls"),
        value: syncStatus?.remainingCalls ?? "-",
        section: "sync" as const,
      },
    ],
    [badges.length, regions.length, syncStatus?.remainingCalls, t, users.length],
  );

  if (initializing) {
    return (
      <div className="min-h-full bg-page">
        <StatusBar variant="dark" />
        <div className="mt-20 flex flex-col items-center gap-3 text-muted">
          <RefreshCw size={22} className="animate-spin" />
          <p className="text-[13px]">{t("admin.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/mypage" replace />;
  }

  const changeRole = (target: AuthUser, role: AdminRole) => {
    if (target.id === user.id) return;
    void runAction(
      `role-${target.id}`,
      () => adminApi.updateUserRole(target.id, role),
      true,
    );
  };

  const sendNotification = () => {
    setNotificationAttempted(true);
    if (!notification.title.trim() || !notification.body.trim() || !notification.eventKey.trim()) {
      setError(t("admin.required"));
      return;
    }
    const recipients = notification.recipients
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isInteger(value) && value > 0);
    const targetId = notification.targetId ? numeric(notification.targetId) : null;
    void runAction("notification", () =>
      adminApi.createSystemNotification({
        title: notification.title.trim(),
        titleEn: notification.titleEn.trim() || undefined,
        body: notification.body.trim(),
        bodyEn: notification.bodyEn.trim() || undefined,
        recipientUserIds: recipients.length ? recipients : undefined,
        targetType: notification.targetType as
          | "STAMP"
          | "BADGE"
          | "ROUTE"
          | "SPOT"
          | "REVIEW"
          | "SYSTEM",
        targetId: targetId ?? undefined,
        eventKey: notification.eventKey.trim(),
      }),
    );
  };

  const executeResource = () => {
    const id = numeric(resourceId);
    if (resourceAction !== "create" && !id) {
      setError(t("admin.required"));
      return;
    }
    if (resourceAction === "delete") {
      if (!window.confirm(t("admin.confirmDelete"))) return;
      void runAction(
        "resource",
        () => adminApi.deleteResource(resourceKind, id as number),
        true,
      );
      return;
    }
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(resourceJson) as Record<string, unknown>;
    } catch {
      setError(t("admin.invalidJson"));
      return;
    }
    if (resourceAction === "create") {
      void runAction(
        "resource",
        () => adminApi.createResource(resourceKind, payload),
        true,
      );
      return;
    }
    if (resourceKind === "contents") {
      setError(t("admin.contentsNoUpdate"));
      return;
    }
    void runAction(
      "resource",
      () => adminApi.updateResource(resourceKind, id as number, payload),
      true,
    );
  };

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-2 gap-3">
        {overviewCards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => setSection(card.section)}
            className="rounded-[16px] bg-white p-4 text-left shadow-soft"
          >
            <p className="text-[11px] text-muted">{card.label}</p>
            <p className="mt-1 text-[24px] font-extrabold text-ink">{card.value}</p>
          </button>
        ))}
      </div>
      <section className="mt-5">
        <h2 className="text-[15px] font-semibold text-ink">{t("admin.quickGuide")}</h2>
        <div className="mt-3 space-y-2.5">
          {[
            ["users", Users, "admin.users", "admin.userRoleDescription"],
            ["notifications", BellRing, "admin.notifications", "admin.notificationDescription"],
            ["resources", Database, "admin.resources", "admin.resourceDescription"],
            ["sync", RefreshCw, "admin.sync", "admin.syncDescription"],
          ].map(([id, Icon, titleKey, descriptionKey]) => {
            const ToolIcon = Icon as typeof Users;
            return (
              <button
                key={id as string}
                type="button"
                onClick={() => setSection(id as Section)}
                className="flex w-full items-center gap-3 rounded-[16px] bg-white p-4 text-left shadow-soft"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream">
                  <ToolIcon size={18} color="#A8623E" />
                </span>
                <span>
                  <span className="block text-[13px] font-semibold text-ink">
                    {t(titleKey as string)}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
                    {t(descriptionKey as string)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );

  const renderUsers = () => (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[12px] text-muted">{t("admin.userRoleDescription")}</p>
        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={loading}
          className="rounded-full bg-cream px-3 py-2 text-[11px] font-semibold text-brand disabled:opacity-50"
        >
          {t("admin.refresh")}
        </button>
      </div>
      <div className="space-y-2.5">
        {users.length === 0 && !loading && (
          <div className="rounded-[16px] bg-white p-5 text-center text-[12px] text-muted">
            {t("admin.noUsers")}
          </div>
        )}
        {users.map((member) => (
          <article key={member.id} className="rounded-[16px] bg-white p-4 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-[12px] font-bold text-brand">
                {(member.nickname || member.name || "?").slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-ink">
                  {member.nickname || member.name}
                  {member.id === user.id && (
                    <span className="ml-1.5 text-[10px] font-medium text-brand">
                      {t("admin.currentUser")}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-muted">{member.email}</p>
              </div>
              <select
                aria-label={t("admin.changeRole")}
                value={member.role}
                onChange={(event) => changeRole(member, event.target.value as AdminRole)}
                disabled={member.id === user.id || Boolean(busy)}
                className="h-9 rounded-[10px] border border-line bg-white px-2 text-[11px] font-semibold text-ink disabled:opacity-50"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  const renderNotifications = () => {
    const requiredClass = (value: string, baseClass: string) =>
      `${baseClass} ${notificationAttempted && !value.trim() ? "border-[#C85B4F] bg-[#FFF9F8]" : ""}`;

    return (
      <section className="rounded-[18px] bg-white p-4 shadow-soft">
        <p className="text-[12px] leading-relaxed text-muted">
          {t("admin.notificationDescription")}
        </p>
        <p className="mt-1 text-[10px] text-[#A8623E]">{t("admin.requiredHint")}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold text-sub">
              {t("admin.titleKoLabel")} <span className="text-[#C85B4F]">*</span>
            </span>
            <input
              className={requiredClass(notification.title, inputClass)}
              placeholder={t("admin.titleKoExample")}
              value={notification.title}
              onChange={(e) => setNotification({ ...notification, title: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold text-sub">
              {t("admin.titleEnLabel")} <span className="font-normal text-muted">({t("admin.optional")})</span>
            </span>
            <input
              className={inputClass}
              placeholder={t("admin.titleEnExample")}
              value={notification.titleEn}
              onChange={(e) => setNotification({ ...notification, titleEn: e.target.value })}
            />
          </label>
        </div>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-[10px] font-semibold text-sub">
            {t("admin.bodyKoLabel")} <span className="text-[#C85B4F]">*</span>
          </span>
          <textarea
            className={requiredClass(notification.body, `${textAreaClass} min-h-24`)}
            placeholder={t("admin.bodyKoExample")}
            value={notification.body}
            onChange={(e) => setNotification({ ...notification, body: e.target.value })}
          />
        </label>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-[10px] font-semibold text-sub">
            {t("admin.bodyEnLabel")} <span className="font-normal text-muted">({t("admin.optional")})</span>
          </span>
          <textarea
            className={`${textAreaClass} min-h-20`}
            placeholder={t("admin.bodyEnExample")}
            value={notification.bodyEn}
            onChange={(e) => setNotification({ ...notification, bodyEn: e.target.value })}
          />
        </label>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-[10px] font-semibold text-sub">
            {t("admin.recipientIdsLabel")} <span className="font-normal text-muted">({t("admin.optional")})</span>
          </span>
          <input
            className={inputClass}
            placeholder={t("admin.recipientIdsExample")}
            value={notification.recipients}
            onChange={(e) => setNotification({ ...notification, recipients: e.target.value })}
          />
          <span className="mt-1 block px-1 text-[10px] text-muted">{t("admin.recipientHint")}</span>
        </label>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold text-sub">
              {t("admin.targetTypeLabel")}
            </span>
            <select
              className={inputClass}
              value={notification.targetType}
              onChange={(e) => setNotification({ ...notification, targetType: e.target.value })}
            >
              {["SYSTEM", "STAMP", "BADGE", "ROUTE", "SPOT", "REVIEW"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold text-sub">
              {t("admin.targetIdLabel")} <span className="font-normal text-muted">({t("admin.optional")})</span>
            </span>
            <input
              className={inputClass}
              inputMode="numeric"
              placeholder={t("admin.targetIdExample")}
              value={notification.targetId}
              onChange={(e) => setNotification({ ...notification, targetId: e.target.value })}
            />
          </label>
        </div>
        <p className="mt-1 px-1 text-[10px] text-muted">{t("admin.targetHint")}</p>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-[10px] font-semibold text-sub">
            {t("admin.eventKeyLabel")} <span className="text-[#C85B4F]">*</span>
          </span>
          <input
            className={requiredClass(notification.eventKey, inputClass)}
            placeholder={t("admin.eventKeyExample")}
            value={notification.eventKey}
            onChange={(e) => setNotification({ ...notification, eventKey: e.target.value })}
          />
          <span className="mt-1 block px-1 text-[10px] text-muted">{t("admin.eventKeyHint")}</span>
        </label>

        <button
          type="button"
          className={`${buttonClass} mt-4 flex w-full items-center justify-center gap-2`}
          disabled={Boolean(busy)}
          onClick={sendNotification}
        >
          <Send size={15} />
          {busy === "notification" ? t("admin.processing") : t("admin.sendNotification")}
        </button>
      </section>
    );
  };
  const renderResources = () => (
    <div className="space-y-4">
      <section className="rounded-[18px] bg-white p-4 shadow-soft">
        <p className="text-[12px] leading-relaxed text-muted">{t("admin.resourceDescription")}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <select
            className={inputClass}
            value={resourceKind}
            onChange={(e) => {
              const kind = e.target.value as ResourceKind;
              setResourceKind(kind);
              setResourceJson(resourceTemplates[kind]);
              if (kind === "contents" && resourceAction === "update") setResourceAction("create");
            }}
          >
            <option value="regions">REGION</option>
            <option value="spots">SPOT</option>
            <option value="contents">CONTENT</option>
            <option value="badges">BADGE</option>
          </select>
          <select className={inputClass} value={resourceAction} onChange={(e) => setResourceAction(e.target.value as ResourceAction)}>
            <option value="create">{t("admin.create")}</option>
            {resourceKind !== "contents" && <option value="update">{t("admin.update")}</option>}
            <option value="delete">{t("admin.delete")}</option>
          </select>
        </div>
        {resourceAction !== "create" && (
          <input className={`${inputClass} mt-2`} inputMode="numeric" placeholder={t("admin.resourceId")} value={resourceId} onChange={(e) => setResourceId(e.target.value)} />
        )}
        {resourceAction !== "delete" && (
          <textarea className={`${textAreaClass} mt-2 min-h-52 font-mono`} value={resourceJson} onChange={(e) => setResourceJson(e.target.value)} aria-label={t("admin.jsonPayload")} />
        )}
        <button type="button" className={`${buttonClass} mt-3 w-full`} disabled={Boolean(busy)} onClick={executeResource}>
          {busy === "resource" ? t("admin.processing") : t("admin.run")}
        </button>
      </section>

      <section className="rounded-[18px] bg-white p-4 shadow-soft">
        <h2 className="text-[14px] font-semibold text-ink">{t("admin.mediaManagement")}</h2>
        <input className={`${inputClass} mt-3`} inputMode="numeric" placeholder={t("admin.contentId")} value={contentId} onChange={(e) => setContentId(e.target.value)} />
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            [t("admin.collectAll"), () => adminApi.collectContentMedia(numeric(contentId) as number)],
            [t("admin.refreshVideos"), () => adminApi.refreshContentMedia(numeric(contentId) as number, "videos")],
            [t("admin.refreshTracks"), () => adminApi.refreshContentMedia(numeric(contentId) as number, "tracks")],
          ].map(([label, action]) => (
            <button
              key={label as string}
              type="button"
              disabled={Boolean(busy) || !numeric(contentId)}
              onClick={() => void runAction("content-media", action as () => Promise<unknown>)}
              className="min-h-11 rounded-[12px] bg-cream px-2 text-[10px] font-semibold text-brand disabled:opacity-50"
            >
              {label as string}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <select className={inputClass} value={mediaKind} onChange={(e) => setMediaKind(e.target.value as MediaKind)}>
            <option value="videos">VIDEO</option>
            <option value="tracks">TRACK</option>
            <option value="albums">ALBUM</option>
          </select>
          <input className={inputClass} inputMode="numeric" placeholder={t("admin.mediaId")} value={mediaId} onChange={(e) => setMediaId(e.target.value)} />
        </div>
        <label className="mt-3 flex items-center gap-2 text-[12px] text-ink">
          <input type="checkbox" checked={mediaHidden} onChange={(e) => setMediaHidden(e.target.checked)} />
          {t("admin.hidden")}
        </label>
        <button
          type="button"
          className={`${buttonClass} mt-3 w-full`}
          disabled={Boolean(busy) || !numeric(mediaId)}
          onClick={() => void runAction("media-visibility", () => adminApi.setMediaVisibility(mediaKind, numeric(mediaId) as number, mediaHidden))}
        >
          {t("admin.applyVisibility")}
        </button>
      </section>
    </div>
  );

  const renderSync = () => (
    <div className="space-y-4">
      <section className="rounded-[18px] bg-ink p-4 text-white shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold">{t("admin.syncStatus")}</h2>
          <button type="button" onClick={() => void loadDashboard()} className="rounded-full bg-white/10 p-2" aria-label={t("admin.refresh")}>
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
          {[
            [t("admin.usedCalls"), syncStatus?.apiCallCount ?? "-"],
            [t("admin.dailyLimit"), syncStatus?.dailyCallLimit ?? "-"],
            [t("admin.safetyReserve"), syncStatus?.safetyReserve ?? "-"],
            [t("admin.nextHeritagePage"), syncStatus?.nextHeritagePage ?? "-"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[12px] bg-white/10 p-3">
              <p className="text-white/60">{label}</p>
              <p className="mt-1 text-[18px] font-bold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-[18px] bg-white p-4 shadow-soft">
        <div className="flex gap-2">
          <input className={inputClass} inputMode="numeric" placeholder={t("admin.tourSize")} value={tourSize} onChange={(e) => setTourSize(e.target.value)} />
          <button type="button" className={buttonClass} disabled={Boolean(busy) || !numeric(tourSize)} onClick={() => void runAction("tour", () => adminApi.syncTourDaily(numeric(tourSize) as number), true)}>{t("admin.runTourSync")}</button>
        </div>
        <div className="flex gap-2">
          <input className={inputClass} placeholder={t("admin.placeName")} value={placeName} onChange={(e) => setPlaceName(e.target.value)} />
          <button type="button" className={buttonClass} disabled={Boolean(busy) || !placeName.trim()} onClick={() => void runAction("enrich", () => adminApi.enrichPlace(placeName.trim()))}>{t("admin.enrichPlace")}</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input className={inputClass} placeholder={t("admin.category")} value={syncCategory} onChange={(e) => setSyncCategory(e.target.value)} />
          <input className={inputClass} inputMode="numeric" placeholder={t("admin.page")} value={syncPage} onChange={(e) => setSyncPage(e.target.value)} />
          <input className={inputClass} inputMode="numeric" placeholder={t("admin.size")} value={syncSize} onChange={(e) => setSyncSize(e.target.value)} />
        </div>
        <button type="button" className={`${buttonClass} w-full`} disabled={Boolean(busy) || !numeric(syncSize)} onClick={() => void runAction("media-page", () => adminApi.syncMediaPage(syncCategory, Number(syncPage) || 0, numeric(syncSize) as number))}>{t("admin.syncMediaPage")}</button>
        <div className="grid grid-cols-[1fr_110px] gap-2">
          <input className={inputClass} placeholder={t("admin.contentTitle")} value={contentTitle} onChange={(e) => setContentTitle(e.target.value)} />
          <input className={inputClass} placeholder={t("admin.category")} value={syncCategory} onChange={(e) => setSyncCategory(e.target.value)} />
        </div>
        <button type="button" className={`${buttonClass} w-full`} disabled={Boolean(busy) || !contentTitle.trim() || !syncCategory.trim()} onClick={() => void runAction("title", () => adminApi.reviewTitleAutomation(contentTitle.trim(), syncCategory.trim()))}>{t("admin.reviewTitle")}</button>
      </section>
    </div>
  );

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />
      <header className="flex items-center justify-between px-5 pt-1">
        <button type="button" onClick={() => navigate("/mypage")} aria-label={t("admin.back")} className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cream">
          <ChevronLeft size={20} color="#2C1810" />
        </button>
        <div className="text-center">
          <h1 className="text-[18px] font-semibold text-ink">{t("admin.title")}</h1>
          <p className="text-[10px] font-semibold text-brand">ADMIN</p>
        </div>
        <button type="button" onClick={() => void loadDashboard()} disabled={loading} aria-label={t("admin.refresh")} className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cream disabled:opacity-50">
          <RefreshCw size={17} color="#A8623E" className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      <nav className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
        {sectionMeta.map((item) => {
          const Icon = item.icon;
          const active = section === item.id;
          return (
            <button key={item.id} type="button" onClick={() => setSection(item.id)} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold ${active ? "bg-ink text-white" : "bg-white text-muted"}`}>
              <Icon size={13} />
              {t(item.label)}
            </button>
          );
        })}
      </nav>

      <main className="px-5 pb-24 pt-4">
        {(notice || error) && (
          <div className={`mb-3 rounded-[12px] px-3 py-2.5 text-[11px] leading-relaxed ${error ? "bg-[#FBE8E5] text-[#B4453A]" : "bg-[#E7EFE3] text-[#477143]"}`}>
            {error || notice}
          </div>
        )}
        {section === "overview" && renderOverview()}
        {section === "users" && renderUsers()}
        {section === "notifications" && renderNotifications()}
        {section === "resources" && renderResources()}
        {section === "sync" && renderSync()}

        {lastResult !== null && section !== "overview" && (
          <details className="mt-4 rounded-[14px] bg-white p-3 shadow-soft">
            <summary className="cursor-pointer text-[11px] font-semibold text-ink">{t("admin.result")}</summary>
            <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-all text-[10px] leading-relaxed text-muted">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </details>
        )}
      </main>
    </div>
  );
}
