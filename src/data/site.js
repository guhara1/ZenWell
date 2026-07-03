'use strict';
/* 간다GO · 사이트 전역 설정 -------------------------------------------------- */

const site = {
  brand: '간다GO',
  brandInitial: 'G',
  domain: 'https://zenwell.pages.dev', // 메인 배포 도메인
  baseTitle: '경기 출장마사지 안내 · 간다GO',
  tel: '0508-202-4719',
  telHref: 'tel:050820247419'.replace('050820247419', '0508-202-4719'),
  locale: 'ko_KR',
  lang: 'ko',

  // 텔레그램 문의 채널 (실제 채널 핸들로 교체)
  telegram: {
    build: 'https://t.me/gandago_web',      // 웹사이트 제작문의
    partner: 'https://t.me/gandago_partner', // 제휴문의
    reserve: 'https://t.me/gandago',         // 예약 문의
  },

  // 상단 네비게이션 — "출장마사지" 단어를 반복하지 않는다
  nav: [
    { label: '경기 홈', url: '/' },
    { label: '권역별 안내', url: '/gyeonggi/area/suwon-yongin-hwaseong/' },
    { label: '도시별 안내', url: '/gyeonggi/city/' },
    { label: '생활권', url: '/gyeonggi/life/' },
    { label: '이용 장소', url: '/gyeonggi/use/home/' },
    { label: '예약 전 확인', url: '/gyeonggi/check/address/' },
    { label: '운영 기준', url: '/gyeonggi/policy/' },
    { label: '문의하기', url: '/gyeonggi/contact/' },
  ],

  footer: {
    disclaimer:
      '본 사이트는 경기도 권역·생활권과 자택·호텔·오피스텔 이용 전 확인사항을 안내하는 정보 페이지입니다. ' +
      '불법·선정적 서비스는 제공하거나 안내하지 않으며, 지역·예약 시간대·이동 거리에 따라 상담 시 최종 확인됩니다.',
    cols: [
      {
        title: '권역 안내',
        links: [
          { label: '수원·용인·화성권', url: '/gyeonggi/area/suwon-yongin-hwaseong/' },
          { label: '성남·분당·판교권', url: '/gyeonggi/area/seongnam-bundang-pangyo/' },
          { label: '부천·시흥·안산·김포권', url: '/gyeonggi/area/bucheon-siheung-ansan-gimpo/' },
          { label: '고양·파주 북부권', url: '/gyeonggi/area/goyang-paju-northwest/' },
        ],
      },
      {
        title: '이용 안내',
        links: [
          { label: '자택 이용 기준', url: '/gyeonggi/use/home/' },
          { label: '호텔·숙소 이용 기준', url: '/gyeonggi/use/hotel/' },
          { label: '오피스텔 이용 기준', url: '/gyeonggi/use/officetel/' },
          { label: '예약 전 확인', url: '/gyeonggi/check/address/' },
        ],
      },
      {
        title: '운영 기준',
        links: [
          { label: '개인정보 처리방침', url: '/gyeonggi/policy/privacy/' },
          { label: '불법·선정적 서비스 불가 안내', url: '/gyeonggi/policy/service/' },
          { label: '작성자·검수자 안내', url: '/gyeonggi/policy/authors/' },
          { label: '사이트맵', url: '/gyeonggi/sitemap-page/' },
        ],
      },
    ],
  },
};

module.exports = site;
