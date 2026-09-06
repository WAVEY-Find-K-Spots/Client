export interface DocSection {
  heading: string;
  body: string;
}
export const PRIVACY_DOC: { updatedAt: string; sections: DocSection[] } = {
  updatedAt: "2026.09.01",
  sections: [
    {
      heading: "1. 수집하는 정보",
      body: "WAVEY는 서비스 제공을 위해 최소한의 정보만 수집합니다.\n· 계정 정보: 소셜 로그인 시 제공되는 닉네임, 이메일\n· 이용 정보: 저장한 스팟, 만든 루트, 획득한 스탬프\n· 위치 정보: 방문 스탬프 자동 인식을 위한 기기 위치 (동의 시에만)",
    },
    {
      heading: "2. 정보의 이용 목적",
      body: "수집한 정보는 스팟 추천, 루트 저장, 스탬프 기록, 서비스 개선 및 통계 분석 목적으로만 이용합니다.",
    },
    {
      heading: "3. 정보의 보관 및 파기",
      body: "회원 탈퇴 시 수집된 개인정보는 즉시 파기됩니다. 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안만 분리 보관합니다.",
    },
    {
      heading: "4. 이용자의 권리",
      body: "이용자는 언제든지 개인정보 조회·수정·삭제 및 처리 정지를 요청할 수 있습니다. 설정 > 개인정보에서 위치 정보 수집을 끌 수 있습니다.",
    },
  ],
};

export const TERMS_DOC: { updatedAt: string; sections: DocSection[] } = {
  updatedAt: "2026.09.01",
  sections: [
    {
      heading: "제1조 (목적)",
      body: "본 약관은 WAVEY가 제공하는 K-콘텐츠 로케이션 여행 가이드 서비스의 이용 조건 및 절차를 규정합니다.",
    },
    {
      heading: "제2조 (서비스의 내용)",
      body: "· K-드라마·영화·뮤직비디오 촬영지 정보 제공\n· 사용자 맞춤 여행 루트 생성 및 저장\n· 방문 스탬프 수집 및 뱃지 시스템",
    },
    {
      heading: "제3조 (이용자의 의무)",
      body: "이용자는 타인의 정보를 도용하거나 서비스 운영을 방해하는 행위를 해서는 안 됩니다. 작성한 리뷰는 사실에 근거해야 합니다.",
    },
    {
      heading: "제4조 (콘텐츠의 저작권)",
      body: "서비스 내 제공되는 장소 정보와 이미지의 저작권은 WAVEY 또는 제휴사에 있으며, 무단 복제·배포를 금합니다.",
    },
  ],
};
