import { useEffect, useState } from "react";
import type { Spot } from "@/mocks/spots";
import type {
  SpotMediaResponse,
  SpotMediaContent,
  ContentVideo,
} from "@/lib/content-api";
import { Play, ChevronRight, Music, MapPin, X } from "lucide-react";

type ActiveMedia =
  | { kind: "video"; videoId: string; title: string }
  | { kind: "track"; spotifyTrackId: string; title: string };

interface ContentTabProps {
  spot: Spot;
  media?: SpotMediaResponse | null;
  mediaLoading?: boolean;
}

interface MusicItem {
  key: string;
  title: string;
  artistName: string | null;
  imageUrl: string | null;
  spotifyTrackId: string;
}

function collectMusicItems(contents: SpotMediaContent[]): MusicItem[] {
  const items: MusicItem[] = [];
  for (const c of contents) {
    for (const album of c.albums) {
      for (const track of album.tracks) {
        items.push({
          key: `track-${track.id}`,
          title: track.title,
          artistName: track.artistName,
          imageUrl: track.imageUrl ?? album.imageUrl,
          spotifyTrackId: track.spotifyTrackId,
        });
      }
    }
    for (const track of c.tracks) {
      items.push({
        key: `track-${track.id}`,
        title: track.title,
        artistName: track.artistName,
        imageUrl: track.imageUrl,
        spotifyTrackId: track.spotifyTrackId,
      });
    }
  }
  return items;
}

function MediaCard({
  thumbnailUrl,
  title,
  onPlay,
}: {
  thumbnailUrl: string | null;
  title: string;
  onPlay: (() => void) | null;
}) {
  return (
    <button
      type="button"
      disabled={!onPlay}
      onClick={() => onPlay?.()}
      className="bg-white rounded-2xl overflow-hidden shadow-soft text-left cursor-pointer disabled:cursor-default"
    >
      <div className="relative w-full h-[70px] overflow-hidden bg-cream">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {onPlay && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-ink/35 backdrop-blur-sm">
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
            </span>
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[13px] font-semibold text-ink leading-tight">{title}</p>
        {onPlay && (
          <p className="flex items-center gap-0.5 text-[11px] font-medium text-brand mt-1.5">
            재생하기
            <span className="flex items-center justify-center w-3 h-3">
              <ChevronRight size={12} />
            </span>
          </p>
        )}
      </div>
    </button>
  );
}

function RealMediaContent({ media }: { media: SpotMediaResponse }) {
  const videos: ContentVideo[] = media.contents.flatMap((c) => c.videos).slice(0, 2);
  const music: MusicItem[] = collectMusicItems(media.contents).slice(0, 2);
  const artists = media.contents.filter((c) => c.category === "ARTIST");
  const hasAnyMedia = videos.length > 0 || music.length > 0;
  const [activeMedia, setActiveMedia] = useState<ActiveMedia | null>(null);

  // 재생 시트가 떠 있는 동안 뒤 배경(app-scroll)이 스크롤되면서
  // absolute 포지션인 시트가 화면 밖으로 같이 밀려나는 문제 방지
  useEffect(() => {
    if (!activeMedia) return;
    const el = document.getElementById("app-scroll");
    if (!el) return;
    const prevOverflow = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = prevOverflow;
    };
  }, [activeMedia]);

  return (
    <div className="px-5 pt-5">
      {/* related videos */}
      {videos.length > 0 && (
        <div className="mt-5 first:mt-0">
          <h4 className="text-[15px] font-semibold text-ink">연관 영상</h4>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {videos.map((v) => (
              <MediaCard
                key={v.id}
                thumbnailUrl={v.thumbnailUrl}
                title={v.title}
                onPlay={() =>
                  setActiveMedia({ kind: "video", videoId: v.videoId, title: v.title })
                }
              />
            ))}
          </div>
        </div>
      )}

      {artists.length > 0 && (
        <div className="mt-5 first:mt-0">
          <h4 className="text-[15px] font-semibold text-ink">관련 아티스트</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {artists.map((c) => (
              <span
                key={c.contentId}
                className="px-3.5 h-9 flex items-center rounded-full bg-cream text-[13px] font-medium text-ink"
              >
                {c.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* related music */}
      {music.length > 0 && (
        <>
          <h4 className="mt-5 text-[15px] font-semibold text-ink">연관 음악</h4>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {music.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() =>
                  setActiveMedia({
                    kind: "track",
                    spotifyTrackId: m.spotifyTrackId,
                    title: m.title,
                  })
                }
                className="bg-white rounded-2xl p-2 flex items-center gap-2.5 shadow-soft text-left cursor-pointer"
              >
                <div className="relative shrink-0 w-[60px] h-[60px] rounded-xl overflow-hidden">
                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt={m.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-ink/30">
                      <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
                    </span>
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-ink truncate">
                    {m.title}
                  </p>
                  <p className="text-[10px] text-muted truncate mt-0.5">
                    {m.artistName ?? " "}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1">
                    <div className="flex-1 h-[3px] rounded-full bg-line">
                      <div
                        className="h-full rounded-full"
                        style={{ width: "68%", backgroundColor: "#A8623E" }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Spotify CTA */}
          <button
            type="button"
            onClick={() =>
              setActiveMedia({
                kind: "track",
                spotifyTrackId: music[0].spotifyTrackId,
                title: music[0].title,
              })
            }
            className="mt-3 w-full h-[50px] rounded-full flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: "#1DB954" }}
          >
            <span className="flex items-center justify-center w-5 h-5">
              <Music size={18} color="#FFFFFF" fill="#FFFFFF" />
            </span>
            <span className="text-[14px] font-semibold text-white">
              Spotify에서 플레이리스트 열기
            </span>
          </button>
        </>
      )}

      {!hasAnyMedia && (
        <p className="text-center text-[11px] text-muted py-4">
          이 스팟과 연결된 영상·음악 카드는 아직 없어요.
        </p>
      )}

      {activeMedia && (
        <MediaPlayerSheet media={activeMedia} onClose={() => setActiveMedia(null)} />
      )}
    </div>
  );
}

function MediaPlayerSheet({
  media,
  onClose,
}: {
  media: ActiveMedia;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-[70] flex flex-col justify-end">
      <div className="absolute inset-0 bg-ink/60" onClick={onClose} />
      <div className="relative bg-white rounded-t-[26px] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <p className="text-[14px] font-semibold text-ink truncate pr-3">
            {media.title}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-cream cursor-pointer"
          >
            <X size={16} color="#2C1810" />
          </button>
        </div>
        <div className="px-5 pb-6 safe-bottom">
          {media.kind === "video" ? (
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-ink">
              <iframe
                src={`https://www.youtube.com/embed/${media.videoId}?autoplay=1`}
                title={media.title}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="w-full h-[152px] rounded-2xl overflow-hidden">
              <iframe
                src={`https://open.spotify.com/embed/track/${media.spotifyTrackId}?autoplay=1`}
                title={media.title}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; clipboard-write"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContentTab({ spot, media, mediaLoading }: ContentTabProps) {
  const hasMockContent =
    spot.dramas.length > 0 || spot.music.length > 0 || spot.videos.length > 0;

  if (mediaLoading) {
    return (
      <div className="px-5 pt-5">
        <p className="text-center text-[13px] text-muted py-16">
          불러오는 중...
        </p>
      </div>
    );
  }

  if (!hasMockContent) {
    if (media && media.contents.length > 0) {
      return <RealMediaContent media={media} />;
    }
    return (
      <div className="px-5 pt-5">
        <p className="text-center text-[13px] text-muted py-16">
          이 스팟과 연결된 드라마·음악·영상 콘텐츠가 아직 없어요
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5">
      {/* Related dramas */}
      <h4 className="text-[15px] font-semibold text-ink">연관 드라마</h4>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {spot.dramas.map((d) => (
          <div
            key={d.title}
            className="bg-white rounded-2xl overflow-hidden shadow-soft cursor-pointer"
          >
            <div className="relative w-full h-[70px] overflow-hidden">
              <img
                src={d.image}
                alt={d.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-ink/35 backdrop-blur-sm">
                  <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                </span>
              </span>
            </div>
            <div className="p-3">
              <p className="text-[13px] font-semibold text-ink leading-tight">
                {d.title}
              </p>
              <p className="text-[10px] text-muted mt-1">{d.eps}</p>
              <p className="flex items-center gap-0.5 text-[11px] font-medium text-brand mt-1.5">
                촬영 장면 보기
                <span className="flex items-center justify-center w-3 h-3">
                  <ChevronRight size={12} />
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* shooting scene */}
      <div className="mt-4 rounded-xl border border-cta bg-cream p-4">
        <h4 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <span className="flex items-center justify-center w-4 h-4">
            <MapPin size={15} color="#A8623E" />
          </span>
          {spot.sceneTitle}
        </h4>
        <p className="mt-2 text-[13px] leading-relaxed text-sub">
          {spot.sceneDesc}
        </p>
      </div>

      {/* related music */}
      <h4 className="mt-5 text-[15px] font-semibold text-ink">연관 음악</h4>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {spot.music.map((m) => (
          <div
            key={m.title}
            className="bg-white rounded-2xl p-2 flex items-center gap-2.5 shadow-soft cursor-pointer"
          >
            <div className="relative shrink-0 w-[60px] h-[60px] rounded-xl overflow-hidden">
              <img
                src={m.image}
                alt={m.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-ink/30">
                  <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
                </span>
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-ink truncate">
                {m.title}
              </p>
              <p className="text-[10px] text-muted truncate mt-0.5">
                {m.artist}
              </p>
              <div className="mt-1.5 flex items-center gap-1">
                <div className="flex-1 h-[3px] rounded-full bg-line">
                  <div
                    className="h-full rounded-full"
                    style={{ width: "68%", backgroundColor: "#A8623E" }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Spotify CTA */}
      <button
        type="button"
        className="mt-3 w-full h-[50px] rounded-full flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        style={{ backgroundColor: "#1DB954" }}
      >
        <span className="flex items-center justify-center w-5 h-5">
          <Music size={18} color="#FFFFFF" fill="#FFFFFF" />
        </span>
        <span className="text-[14px] font-semibold text-white">
          Spotify에서 플레이리스트 열기
        </span>
      </button>

      {/* related videos */}
      <h4 className="mt-5 text-[15px] font-semibold text-ink">연관 영상</h4>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {spot.videos.map((v) => (
          <div
            key={v.label}
            className="relative h-[88px] rounded-xl overflow-hidden cursor-pointer"
          >
            <img
              src={v.image}
              alt={v.label}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-ink/35 backdrop-blur-sm">
                <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
              </span>
            </span>
            <span className="absolute left-2 bottom-1.5 right-2 text-[9px] text-white/95 truncate whitespace-nowrap">
              {v.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
