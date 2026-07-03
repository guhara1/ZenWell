# 간다GO · 경기 출장마사지 지역 안내 (정적 SEO 사이트)

경기도 권역·생활권과 자택·호텔·오피스텔 이용 전 확인사항을 안내하는 **정보형 안내 사이트**입니다.
의존성 없는 Node 생성기로 `dist/` 에 정적 HTML을 생성합니다.

## 빌드

```bash
npm run build      # = node build.js  → dist/ 생성
```

`dist/` 를 그대로 정적 호스팅(Netlify, GitHub Pages, Nginx 등)에 배포하면 됩니다.
배포 전 `src/data/site.js` 의 `domain`, `telegram` 핸들, 전화번호를 실제 값으로 교체하세요.

## 구조

```
assets/css/style.css      프리미엄 디자인 토큰 + 컴포넌트 오버레이 (Pretendard)
src/data/site.js          상호·전화·텔레그램·네비·푸터 전역 설정
src/data/regions.js       7대 권역 / 핵심 도시 / 생활권 / 이용·확인 / 외부 출처
src/templates/layout.js   페이지 셸 · JSON-LD(schema) · 헤더 · 푸터
src/templates/components.js  히어로·카드·요금표·체크리스트·FAQ 등 섹션 빌더
build.js                  전체 페이지 + sitemap.xml + robots.txt 생성
```

## 반영된 요구사항

- **푸터 오렌지 문의 버튼** — `웹사이트 제작문의` · `제휴문의` (텔레그램 링크, `rel="nofollow"`).
- **상호/전화** — 상호 `간다GO`, 전화예약 `0508-202-4719` (헤더·푸터·문의·schema).
- **디스크립션 80자 이내** — `layout.js`의 `clampDesc()`가 모든 페이지에서 80자로 강제(현재 최대 52자).
- **스키마 필수** — 모든 페이지에 `WebSite · Organization · WebPage · BreadcrumbList` JSON-LD,
  FAQ 페이지엔 `FAQPage`, 이미지 지정 시 `ImageObject`. (LocalBusiness·Review·AggregateRating 미사용)
- **프리미엄 팔레트** — 디자인 토큰 자체를 딥 네이비 + 오렌지 프리미엄 팔레트로 교체하고 컴포넌트 오버레이 추가.
- **롱테일 내부링크 / 권위 링크** — 메인·지역 페이지에서 `광교·영통 오피스텔 이용 전 확인`처럼
  확인 기준 앵커로 연결하고, 하단 "참고 기준"에 경기도청·경기교통공사·개인정보보호위원회·한국소비자원·Google Search Essentials 등 공식 출처만 연결.

## SEO 운영 원칙 (지시서 반영)

- 지역명만 바꾼 복붙 금지 — 권역/도시/생활권마다 차별화된 본문.
- 색인 상세 페이지는 2,000자+ 확보. 본문이 얇으면 `page({ noindex:true })` 로 처리.
- 출구별·노선별 역 페이지, "추천/1위/최저가/VIP" URL·앵커 미생성.
- `Who / How / Why` 블록으로 E-E-A-T 신호 제공.

## 확장 방법 (지시서 1차-B/C)

- **도시 추가**: `regions.js`의 `cities` 배열에 `[slug, 이름, 생활권, 요약, 권역slug]` 추가.
- **생활권 추가**: `lifeItems`에 `[slug, 이름, 도시slug, 설명]` 추가.
- **얇은 외곽/읍면동**: 본문 2,000자 미만이면 상위 생활권 canonical + `noindex` 로 관리.
- 추가 후 `npm run build` 만 다시 실행하면 sitemap 포함 전체 재생성됩니다.
