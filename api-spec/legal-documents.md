# Legal Document API 명세서

개인정보처리방침과 이용약관처럼 로그인 전에도 확인할 수 있어야 하는 법적 문서를 조회하는 API입니다.

## 1. 문서 조회

```text
GET /api/v1/policies?category=terms&language=ko
GET /api/v1/policies?category=privacy&language=en
```

- 인증: 불필요
- 응답 봉투: 기존 API와 동일한 `{ statusCode, message, data }`
- `category`는 `terms` 또는 `privacy`입니다.
- `language`는 `ko` 또는 `en`입니다.
- `data.content`는 Markdown 문자열입니다.

### Response

```json
{
  "statusCode": 200,
  "message": "정책 조회 성공",
  "data": {
    "category": "terms",
    "language": "ko",
    "title": "WAVEY 이용약관",
    "content": "# WAVEY 이용약관\\n\\n## 제1조 목적\\n\\n...",
    "version": 1,
    "effectiveDate": "2026-09-16"
  }
}
```

프론트는 `data.content`를 Markdown 렌더러로 표시하며, HTML 줄바꿈(`<br>`)을 지원해야 합니다.

관련 백엔드 작업: Server #102
