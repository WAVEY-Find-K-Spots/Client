# 루트 탭 API 연동 현황

`src/pages/route/` 화면 기준, [routes.md](./routes.md) 명세 대비 실제 연동 상태 정리.

> 단일 루트(내 루트 하나) 기준으로 연동됨. "내 루트 목록"(`MyRoutesView.tsx`, 다중 루트 관리)은 아직 목업 그대로 — 별도 작업 필요.

## 1. 인증 불필요

| # | UI 동작 | 엔드포인트 | 구현 상태 |
|---|---|---|---|
| 13 | 추천 루트(둘러보기) 목록 조회 | `GET /api/v1/routes/public` | ✅ `src/lib/routes-api.ts`의 `getPublicRoutes()`. 소비 화면은 아직 없음 |

## 2. 인증 필요 (`Authorization: Bearer {accessToken}`)

| # | UI 동작 | 엔드포인트 | 구현 상태 |
|---|---|---|---|
| 1 | 탭 진입 시 내 루트 불러오기 | `GET /api/v1/routes/{routeId}` | ✅ `RouteProvider` 초기화 시 저장된 routeId(`wavey.route.current-id`)로 조회, 없으면 `GET /routes`에서 첫 루트 채택 |
| 2 | 내 루트 목록에서 선택 | `GET /api/v1/routes` | ⚠️ API는 구현(`getMyRoutes`)했지만 다중 루트 선택 UI는 없음(단일 루트 가정) |
| 3 | 빈 상태 → 새 루트 만들기 | `POST /api/v1/routes` | ✅ 스팟 추가 시 루트가 없으면 자동 생성(`createRoute`, 이름 "내 루트" 고정) |
| 4 | 스팟 추가 시트 후보 목록 (`SpotPicker.tsx`) | `GET /api/v1/spots` | ✅ `src/lib/spots-api.ts`의 `searchSpots()` (`excludeRouteId` 사용). 명세는 서버 PR `docs/#76` 기준(아직 OPEN이지만 구현은 머지됨) |
| 5 | 루트에 스팟 추가 | `POST /api/v1/routes/{routeId}/spots` | ✅ `addRouteSpot` |
| 6 | 스팟 개별 삭제 | `DELETE /api/v1/routes/{routeId}/spots/{routeSpotId}` | ✅ `removeRouteSpot` |
| 7 | 드래그 순서 변경 / 출발·도착 바꾸기 | `PATCH /api/v1/routes/{routeId}/spots/reorder` | ✅ `reorderRouteSpots` (낙관적 업데이트 + 실패 시 롤백) |
| 8 | "루트 비우기" | `DELETE /api/v1/routes/{routeId}` | ✅ `deleteRoute` |
| 9 | "저장" 버튼 (이름·설명 등 수정) | `PATCH /api/v1/routes/{routeId}` | ❌ 미구현 — `updateRoute` 함수는 있지만 이름 편집 UI가 없어서 아직 토스트만 표시 |
| 10 | 요약 카드 + 구간 소요시간 + 지도 경로선 | `POST /api/v1/routes/{routeId}/directions` | ✅ `getDirections`, plan/nav 진입 시 자동 계산, `PlanSheet`/`NavOverlay`에 실데이터 연결 |
| 11 | 이동수단 변경 시 재계산 | 10번 재호출 (`transportMode` 변경) | ✅ `transport` state 변경 시 자동 재호출 |

## 3. 서버 정책 미확정

| # | UI 동작 | 엔드포인트 | 상태 |
|---|---|---|---|
| 12 | 루트 공유하기 | 미정 (routes.md 10장) | ⏸ 여전히 더미 토스트 |

## 알려진 제한사항

- `src/pages/detail/page.tsx`의 "루트에 담기" 토글(`inRoute`/`toggleRoute`)은 홈/상세 화면이 아직 목업 스팟 카탈로그(`mocks/spots.ts`, 문자열 slug id)를 쓰고 있어서 백엔드 숫자 `spotId`와 매핑되지 않음. 홈/상세 화면이 `GET /spots` 기반으로 바뀌기 전까지는 사실상 동작하지 않음 — 별도 이슈 필요.
- "내 루트 목록"(`MyRoutesView.tsx`)은 다중 루트 관리 화면인데 아직 완전 목업. 지금은 앱 전체가 "루트 하나"만 갖는다고 가정하고 연동함.
- "저장" 버튼에 이름/설명 편집 UI가 없어 `PATCH /routes/{routeId}` 연동은 보류.

## 다음 단계 후보

- `MyRoutesView.tsx` 다중 루트 목업 → `GET /routes` 리스트 연동
- 홈/상세 화면 스팟 카탈로그를 `GET /spots` 기반으로 전환 (그래야 `inRoute`/`toggleRoute`도 정상 동작)
- 루트 이름 편집 UI 추가 후 `PATCH /routes/{routeId}` 연동
- 공개 루트 "둘러보기" 화면 신설 (`getPublicRoutes` 소비)
