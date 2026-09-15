# Content API 명세서

콘텐츠(작품: 드라마/영화/아티스트) 도메인 + 콘텐츠에 연결된 미디어(YouTube 영상, Spotify 앨범/트랙) API입니다.

## 1. 설계 메모

- 모든 요청·응답 필드명은 `camelCase` 기준.
- 인증이 필요한 API는 `Authorization: Bearer {accessToken}` 헤더 사용.
- 대부분의 쓰기 작업은 ADMIN 권한 필요 (콘텐츠는 관리자가 등록/관리하는 마스터 데이터).
- 조회 API는 전부 비인증(public) 허용.

---

## 2. Content (`/api/v1/contents`)

| Method | Path | 설명 | 권한 |
|---|---|---|---|
| GET | `/api/v1/contents?category={category}` | 콘텐츠 목록 (category 필터 optional) | 비인증 |
| GET | `/api/v1/contents/{contentId}` | 콘텐츠 상세 | 비인증 |
| POST | `/api/v1/contents` | 콘텐츠 생성 | ADMIN |
| PUT | `/api/v1/contents/{contentId}` | 콘텐츠 수정 | ADMIN |
| DELETE | `/api/v1/contents/{contentId}` | 콘텐츠 삭제 (연관 영상/앨범/트랙/spot_contents까지 cascade 삭제) | ADMIN |

⚠️ PUT 수정 시 YouTube/Spotify 미디어가 자동으로 재수집되지 않음 — 별도로 `/collect` 또는 `/refresh` 호출 필요.

### Request `ContentRequest`
```ts
{
  titleKo: string       // @NotBlank
  titleEn?: string
  category: "ARTIST" | "DRAMA" | "MOVIE"   // @NotNull
}
```

### Response `ContentResponse`
```ts
{
  contentId: number
  titleKo: string
  titleEn: string | null
  category: "ARTIST" | "DRAMA" | "MOVIE"
  createdAt: string   // LocalDateTime
  updatedAt: string
}
```

---

## 3. Content Media (영상/앨범/트랙)

| Method | Path | 설명 | 권한 |
|---|---|---|---|
| GET | `/api/v1/contents/{contentId}/videos` | 콘텐츠의 영상 목록 | 비인증 |
| GET | `/api/v1/contents/{contentId}/albums` | 콘텐츠의 앨범 목록 | 비인증 |
| GET | `/api/v1/contents/{contentId}/tracks` | 콘텐츠의 단일(비앨범) 트랙 목록 | 비인증 |
| GET | `/api/v1/albums/{contentAlbumId}/tracks` | 특정 앨범의 트랙 목록 | 비인증 |
| POST | `/api/v1/contents/{contentId}/collect` | YouTube + Spotify 미디어 일괄 수집 | ADMIN |
| POST | `/api/v1/contents/{contentId}/videos/refresh` | YouTube 영상만 재수집 | ADMIN |
| POST | `/api/v1/contents/{contentId}/tracks/refresh` | Spotify 트랙만 재수집 | ADMIN |
| PATCH | `/api/v1/videos/{videoId}` | 영상 노출/숨김 처리 | ADMIN |
| PATCH | `/api/v1/tracks/{trackId}` | 트랙 노출/숨김 처리 | ADMIN |
| PATCH | `/api/v1/albums/{albumId}` | 앨범 노출/숨김 처리 | ADMIN |

### Request `MediaVisibilityRequest` (PATCH 3종 공통)
```ts
{
  hidden: boolean   // @NotNull, true=숨김, false=노출
}
```

### Response `ContentVideoResponse`
```ts
{
  id: number
  videoId: string        // YouTube video id
  title: string
  channelTitle: string | null
  thumbnailUrl: string
  durationSec: number
  kind: "SHORT" | "LONG"
  hidden: boolean
}
```

### Response `ContentAlbumResponse`
```ts
{
  id: number
  spotifyAlbumId: string
  title: string
  imageUrl: string | null
  spotifyUrl: string
  hidden: boolean
  tracks: ContentTrackResponse[]   // 앨범 목록 조회 시 기본 빈 배열, 상세 컨텍스트에서 채워짐
}
```

### Response `ContentTrackResponse`
```ts
{
  id: number
  contentAlbumId: number | null   // null이면 단일(비앨범) 트랙
  spotifyTrackId: string
  title: string
  artistName: string | null
  imageUrl: string | null
  spotifyUrl: string
  durationMs: number | null
  hidden: boolean
}
```

### Response `ContentMediaCollectResponse` (`/collect`)
```ts
{
  contentId: number
  videos: MediaCollectResponse
  tracks: MediaCollectResponse
}
```

### Response `MediaCollectResponse` (`/collect` 하위 필드 및 `/refresh` 응답)
```ts
{
  contentId: number
  saved: number
  dropped: number
  videos: ContentVideoResponse[] | null
  albums: ContentAlbumResponse[] | null
  tracks: ContentTrackResponse[] | null
}
```

---

## 4. 에러 코드

| 코드 | HTTP | 설명 |
|---|---|---|
| `WORK_409` (`WORK_ALREADY_EXISTS`) | 409 | 동일 title+category 콘텐츠가 이미 존재 |
| `WORK_404` (`WORK_NOT_FOUND`) | 404 | 콘텐츠 없음 |
| `WORK_VIDEO_404` | 404 | 영상 없음 (hideVideo) |
| `WORK_TRACK_404` | 404 | 트랙 없음 (hideTrack) |
| `CONTENT_ALBUM_404` | 404 | 앨범 없음 (hideAlbum / albumTracks) |
| `SPOT_NOT_FOUND` | 404 | 존재하지 않는 장소 (스팟-콘텐츠 연결 관련) |
| `CONTENT_404` / `CONTENT_409` | 404/409 | 콘텐츠 미디어 수집 관련 일반 not-found/중복 |
| `CONTENT_400_URL` | 400 | URL 미입력 |
| `CONTENT_400_YOUTUBE_URL` / `CONTENT_400_SPOTIFY_URL` | 400 | YouTube/Spotify URL 형식 오류 |
| `CONTENT_400_YOUTUBE_KEY` / `CONTENT_400_SPOTIFY_KEY` | 400 | 외부 API 키 미설정 (서버 설정 문제) |
| `CONTENT_404_YOUTUBE` / `CONTENT_404_SPOTIFY` | 404 | 외부 플랫폼에서 영상/트랙을 찾을 수 없음 |
| `CONTENT_502_YOUTUBE` / `CONTENT_502_SPOTIFY` | 502 | 외부 API 요청 실패 |
| `CONTENT_502_THUMBNAIL` | 502 | 썸네일 해석 실패 |

---

## 5. 미구현 / 후속 과제

- collect/refresh 실패 시 부분 성공(saved/dropped) 케이스에 대한 프론트 UX 가이드 필요
