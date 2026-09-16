# Legal Document API 명세서

개인정보처리방침과 이용약관처럼 로그인 전에도 확인할 수 있어야 하는 법적 문서를 조회하는 API입니다.

## 1. 문서 조회

```text
GET /api/v1/policies/terms
GET /api/v1/policies/privacy
```

- 인증: 불필요
- 응답 봉투: 기존 API와 동일한 `{ statusCode, message, data }`
- 현재 `data`는 Markdown 문자열로 반환됩니다.

### Response

```json
{
  "statusCode": 200,
  "message": "이용약관 조회 성공",
  "data": "# WAVEY 이용약관\\n\\n## 제1조 목적\\n\\n..."
}
```

프론트는 Markdown의 `#` 제목, 시행일, `##`·`###` 헤딩을 문서 화면용 구조로 변환합니다.

관련 백엔드 작업: Server #102
