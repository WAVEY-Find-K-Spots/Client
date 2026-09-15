import type { Spot } from "@/mocks/spots";
import type {
  SpotMediaResponse,
  SpotMediaContent,
  ContentVideo,
} from "@/lib/content-api";
import { Play, ChevronRight, Music, MapPin, Clapperboard } from "lucide-react";

interface ContentTabProps {
  spot: Spot;
  media?: SpotMediaResponse | null;
  mediaLoading?: boolean;
}

const categoryLabel: Record<SpotMediaContent["category"], string> = {
  DRAMA: "관련 드라마",
  MOVIE: "관련 영화",
  ARTIST: "관련 아티스트",
};

const categoryOrder: SpotMediaContent["category"][] = ["DRAMA", "MOVIE", "ARTIST"];

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface MusicItem {
  key: string;
  title: string;
  artistName: string | null;
  imageUrl: string | null;
  spotifyUrl: string;
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
          spotifyUrl: track.spotifyUrl,
        });
      }
    }
    for (const track of c.tracks) {
      items.push({
        key: `track-${track.id}`,
        title: track.title,
        artistName: track.artistName,
        imageUrl: track.imageUrl,
        spotifyUrl: track.spotifyUrl,
      });
    }
  }
  return items;
}

function RealMediaContent({ media }: { media: SpotMediaResponse }) {
  const videos: ContentVideo[] = media.contents.flatMap((c) => c.videos);
  const music: MusicItem[] = collectMusicItems(media.contents);
  const hasAnyMedia = videos.length > 0 || music.length > 0;

  return (
    <div className="px-5 pt-5 flex flex-col gap-5">
      {categoryOrder.map((cat) => {
        const group = media.contents.filter((c) => c.category === cat);
        if (group.length === 0) return null;
        return (
          <div key={cat}>
            <h4 className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
              <Clapperboard size={16} color="#A8623E" />
              {categoryLabel[cat]}
            </h4>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {group.map((c) => (
                <span
                  key={c.contentId}
                  className="px-3.5 h-9 flex items-center rounded-full bg-cream text-[13px] font-medium text-ink"
                >
                  {c.title}
                </span>
              ))}
            </div>
          </div>
        );
      })}

      {music.length > 0 && (
        <div>
          <h4 className="text-[15px] font-semibold text-ink">연관 음악</h4>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {music.map((m) => (
              <a
                key={m.key}
                href={m.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-white rounded-2xl p-2 flex items-center gap-2.5 shadow-soft cursor-pointer"
              >
                <div className="relative shrink-0 w-[60px] h-[60px] rounded-xl overflow-hidden bg-cream">
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
                  {m.artistName && (
                    <p className="text-[10px] text-muted truncate mt-0.5">
                      {m.artistName}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <h4 className="text-[15px] font-semibold text-ink">연관 영상</h4>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {videos.map((v) => (
              <a
                key={v.id}
                href={`https://www.youtube.com/watch?v=${v.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="relative h-[88px] rounded-xl overflow-hidden cursor-pointer bg-cream"
              >
                <img
                  src={v.thumbnailUrl}
                  alt={v.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-ink/35 backdrop-blur-sm">
                    <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
                  </span>
                </span>
                <span className="absolute right-1.5 top-1.5 px-1.5 py-0.5 rounded bg-ink/70 text-[9px] text-white">
                  {formatDuration(v.durationSec)}
                </span>
                <span className="absolute left-2 bottom-1.5 right-2 text-[9px] text-white/95 truncate whitespace-nowrap">
                  {v.title}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {!hasAnyMedia && (
        <p className="text-center text-[11px] text-muted py-4">
          이 스팟과 연결된 영상·음악 카드는 아직 없어요.
        </p>
      )}
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
