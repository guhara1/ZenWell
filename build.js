'use strict';
/* =========================================================================
   간다GO 정적 사이트 빌더 (zero-dependency)
   node build.js  →  /dist 에 전체 페이지 생성
   ========================================================================= */
const fs = require('fs');
const path = require('path');

const site = require('./src/data/site');
const R = require('./src/data/regions');
const { page } = require('./src/templates/layout');
const C = require('./src/templates/components');

const OUT = path.join(__dirname, 'dist');
const pages = []; // {url, noindex}

/* ---- fs helpers ---- */
function emit(url, html, meta = {}) {
  const clean = url.replace(/^\//, '');
  const dir = clean.endsWith('/') || clean === '' ? clean : clean + '/';
  const full = path.join(OUT, dir, 'index.html');
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
  pages.push({ url, noindex: !!meta.noindex, priority: meta.priority || 0.6 });
}

const cityBySlug = Object.fromEntries(R.cities.map((c) => [c[0], c]));
const areaBySlug = Object.fromEntries(R.areas.map((a) => [a.slug, a]));

const HOME = { label: '경기 홈', url: '/' };

/* 공통 Who/How/Why + FAQ */
const whoHowWhy = {
  who: '경기도 권역·생활권과 이용 장소 기준을 정리해 온 운영진이 실제 이동·예약 확인 절차를 바탕으로 안내합니다.',
  how: '행정구역·역세권·신도시·산업단지·외곽 이동 기준을 구분하고, 예약 전 확인사항을 페이지마다 체크리스트로 제공합니다.',
  why: '같은 경기도라도 생활권마다 이용 기준이 달라, 방문 가능 여부를 미리 확인해 불필요한 혼선을 줄이기 위해서입니다.',
};
const baseFaqs = [
  { q: '경기 전 지역 방문이 가능한가요?', a: '실제 방문 주소, 가까운 생활권, 예약 가능 시간, 이동 기준을 확인한 뒤 안내합니다.' },
  { q: '경기남부와 경기북부는 이용 기준이 다른가요?', a: '네. 경기남부는 신도시·산업단지·SRT·업무지구 기준이 많고, 경기북부는 서울 접경·신도시·외곽 이동·펜션 숙소 기준이 중요합니다.' },
  { q: '호텔이나 출장 숙소에서도 이용할 수 있나요?', a: '숙소 정책, 객실 출입 가능 여부, 프런트 확인 방식 등을 먼저 확인해야 합니다.' },
  { q: '오피스텔이나 아파트는 어떤 점을 확인해야 하나요?', a: '공동현관, 엘리베이터, 관리 규정, 방문 가능 시간대를 확인해야 합니다.' },
  { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
  { q: '개인정보는 어떻게 처리하나요?', a: '예약 확인과 연락에 필요한 최소 정보만 확인하며, 개인정보 처리 기준 페이지로 연결합니다.' },
];

const authorityLinks = () => [R.authorities.gg, R.authorities.gtc, R.authorities.pipc, R.authorities.kca, R.authorities.google];

const whoHowWhySection = (data = whoHowWhy) => `
  <section class="section section--tight wrap">
    ${C.sectionHead('E-E-A-T', 'Who · How · Why', '누가, 어떻게, 왜 안내하는지 밝힙니다.')}
    ${C.whoHowWhy(data)}
  </section>`;

const referenceSection = () => `
  <section class="section section--tight wrap">
    ${C.sectionHead('참고 기준', '참고 · 공식 정보 출처', '행정구역·교통·개인정보·소비자 기준은 아래 공식 출처를 참고하세요.')}
    ${C.linkList(authorityLinks())}
  </section>`;

/* =========================================================================
   HOME  (/)
   ========================================================================= */
function buildHome() {
  const areaCards = R.areas.map((a) => ({ url: `/gyeonggi/area/${a.slug}/`, tag: '권역', title: a.name, desc: a.lead.slice(0, 60) + '…' }));
  const cityCards = R.cities.slice(0, 12).map((c) => ({ url: `/gyeonggi/city/${c[0]}/`, tag: '도시', title: c[1], desc: c[3] }));
  const lifeCards = R.lifeItems.slice(0, 6).map((l) => ({ url: `/gyeonggi/life/${l[0]}/`, tag: '생활권', title: l[1], desc: l[3] }));
  const useCards = R.useItems.slice(0, 8).map((u) => ({ url: `/gyeonggi/use/${u[0]}/`, tag: '이용 장소', title: u[1], desc: u[2] }));

  /* 롱테일 내부링크 (지역명 단순 반복 대신 확인 기준 앵커) */
  const longtail = [
    { url: '/gyeonggi/life/gwanggyo-yeongtong/', label: '광교·영통 오피스텔 이용 전 확인' },
    { url: '/gyeonggi/life/bundang-pangyo/', label: '분당·판교 업무지구 예약 기준' },
    { url: '/gyeonggi/life/dongtan-byeongjeom/', label: '동탄역 인접 숙소 이용 안내' },
    { url: '/gyeonggi/life/pyeongtaek-jije-godeok/', label: '평택 고덕·지제 산업권 이동 기준' },
    { url: '/gyeonggi/life/ilsan-lake-park/', label: '일산 정발산·마두 생활권 보기' },
    { url: '/gyeonggi/life/unjeong-newtown/', label: '운정신도시 아파트 공동현관 확인' },
    { url: '/gyeonggi/life/baegot-jeongwang/', label: '시흥 배곧·정왕 숙소 이용 기준' },
    { url: '/gyeonggi/life/bucheon-jungdong-sangdong/', label: '부천 중동·상동 오피스텔 예약 전 확인' },
    { url: '/gyeonggi/life/misa-gamil/', label: '하남 미사·감일 신도시 생활권 안내' },
    { url: '/gyeonggi/use/pension/', label: '양평·가평 펜션 숙소 이용 전 확인' },
    { url: '/gyeonggi/policy/service/', label: '불법·선정적 서비스 불가 안내' },
  ];

  const body = `
  <section class="hero">
    <div class="hero__bg" aria-hidden="true"></div>
    <div class="wrap hero__inner">
      <span class="badge-soft">경기도 권역·생활권 안내</span>
      <h1><span class="accent">경기 출장마사지</span> · 권역별 방문 가능 지역 안내</h1>
      <p>수원, 성남, 용인, 화성, 고양, 부천, 시흥, 평택, 안산, 남양주, 파주 등 경기도 주요 생활권과 자택·호텔·오피스텔 이용 전 확인사항을 안내합니다.</p>
      <div class="hero__cta">
        <a class="btn btn--brand btn--lg" href="tel:${site.tel}">전화예약 ${site.tel}</a>
        <a class="btn btn--ghost btn--lg" href="/gyeonggi/check/address/">예약 전 확인</a>
      </div>
      <div class="hero__meta">
        <span>상호 <strong>${site.brand}</strong></span>
        <span>전화예약 <strong>${site.tel}</strong></span>
        <span>운영 <strong>경기 전 권역 안내</strong></span>
      </div>
    </div>
  </section>

  <section class="section wrap">
    ${C.sectionHead('안내 원칙', '경기도는 도시명보다 권역과 생활권 확인이 먼저입니다',
      '같은 경기도라도 수원 광교, 성남 판교, 화성 동탄, 고양 일산, 시흥 배곧, 평택 고덕, 남양주 다산의 이용 기준이 다릅니다.')}
    <div class="notice">행정구역·생활권·역세권·신도시·산업단지·외곽 이동 기준을 함께 안내해 실제 방문 가능 여부를 확인하기 쉽게 구성했습니다.</div>
  </section>

  <section class="section wrap">
    ${C.sectionHead('7대 권역', '경기 7대 권역 안내', '내 위치가 어느 권역·생활권인지 먼저 확인하세요.')}
    ${C.cardGrid(areaCards, 3)}
  </section>

  <section class="section wrap">
    ${C.sectionHead('핵심 도시', '경기 핵심 도시 안내', '핵심 도시부터 생활권 기준으로 안내합니다.')}
    ${C.cardGrid(cityCards, 4)}
    <p class="text-center" style="margin-top:28px"><a class="btn btn--ghost" href="/gyeonggi/city/">도시별 안내 전체 보기</a></p>
  </section>

  <section class="section wrap">
    ${C.sectionHead('신도시·역세권', '신도시·산업단지·역세권 생활권', '생활권 기준으로 이용 전 확인사항을 안내합니다.')}
    ${C.cardGrid(lifeCards, 3)}
  </section>

  <section class="section wrap">
    ${C.sectionHead('이용 장소', '이용 장소별 확인 기준', '자택·호텔·오피스텔·아파트 등 장소별 확인 기준을 안내합니다.')}
    ${C.cardGrid(useCards, 4)}
  </section>

  <section class="section wrap" id="pricing">
    ${C.sectionHead('요금 안내', '이용 코스와 요금 살펴보기', '60·90·120분 코스별 기준 요금이며, 추가 비용 없이 있는 그대로 안내해 드립니다.')}
    ${C.pricing([
      { name: '60분 코스', price: '90,000', time: '60분', desc: '기본 컨디션·릴렉스 케어' },
      { name: '90분 코스', price: '150,000', time: '90분', desc: '아로마 포함 추천 구성', featured: true },
      { name: '120분 코스', price: '180,000', time: '120분', desc: '전신 집중 프리미엄 케어' },
    ])}
    <p class="text-center" style="margin-top:24px;color:var(--color-text-muted)">지역·예약 시간대·이동 거리에 따라 상담 시 최종 확인됩니다.</p>
  </section>

  <section class="section wrap">
    ${C.sectionHead('예약 전 확인', '예약 전 확인해야 할 내용', '방문 전 아래 항목을 미리 확인하면 안내가 빠릅니다.')}
    ${C.checklist([
      '방문 주소를 정확히 확인했나요?',
      '경기도 어느 권역인지 확인했나요?',
      '가까운 생활권과 역세권을 확인했나요?',
      '호텔·숙소 이용 가능 여부를 확인했나요?',
      '오피스텔 공동현관과 관리 규정을 확인했나요?',
      '아파트 단지 출입 방식을 확인했나요?',
      '산업단지 또는 외곽 지역 이동 기준을 확인했나요?',
      '예약 가능 시간과 변경 기준을 확인했나요?',
      '개인정보 처리 기준을 확인했나요?',
      '불법·선정적 서비스 불가 안내를 확인했나요?',
    ])}
  </section>

  <section class="section wrap">
    ${C.sectionHead('바로가기', '생활권별 예약 전 확인 바로가기', '지역명 나열 대신, 실제 확인 기준으로 이동하세요.')}
    ${C.linkList(longtail)}
  </section>

  <section class="section wrap">
    ${C.sectionHead('자주 묻는 질문', '경기 출장마사지 자주 묻는 질문')}
    ${C.faqBlock(baseFaqs)}
  </section>

  ${whoHowWhySection()}
  ${referenceSection()}
  `;

  emit('/', page({
    url: '/',
    canonical: '/',
    title: '경기 출장마사지 · 권역별 방문 가능 지역 안내',
    metaTitle: '경기 출장마사지｜수원·성남·용인·고양·부천·평택 지역 안내 · 간다GO',
    desc: '경기 출장마사지 예약 전 수원·성남·용인·고양·부천·평택 생활권과 이용 기준 안내.',
    crumbs: [HOME],
    faqs: baseFaqs,
    body,
  }), { priority: 1.0 });
}

/* =========================================================================
   권역 (area)
   ========================================================================= */
function buildAreas() {
  R.areas.forEach((a) => {
    const url = `/gyeonggi/area/${a.slug}/`;
    const crumbs = [HOME, { label: '권역별 안내', url }, { label: a.name, url }];
    const related = a.related.map((s) => areaBySlug[s]).filter(Boolean)
      .map((r) => ({ url: `/gyeonggi/area/${r.slug}/`, tag: '인접 권역', title: r.name, desc: r.lead.slice(0, 50) + '…' }));
    const zoneLinks = a.zones.map((z) => `<li><strong>${z[0]}</strong> — ${z[1]}</li>`).join('');

    const faqs = [
      { q: `${a.name}은 어떤 생활권으로 나뉘나요?`, a: `${a.zones.map((z) => z[0]).join(', ')} 등 생활권으로 나뉘며, 각 생활권마다 이동 기준과 숙소 형태가 다릅니다.` },
      ...baseFaqs.slice(0, 4),
    ];

    const body = `
    ${C.breadcrumb(crumbs)}
    <section class="section--tight wrap">
      <span class="badge-soft">경기 7대 권역</span>
      <h1>${a.h1}</h1>
      <p class="lead">${a.lead}</p>
    </section>

    <section class="section--tight wrap">
      <div class="prose">
        <h2>${a.name} 개요</h2>
        ${a.intro.map((p) => `<p>${p}</p>`).join('')}
        <h2>대표 생활권</h2>
        <ul>${zoneLinks}</ul>
        <h2>가까운 역·터미널</h2>
        <p>${a.stations}</p>
        <h2>이용 장소별 확인 기준</h2>
        <p>자택은 <a href="/gyeonggi/use/home/">공동현관과 방문 동선</a>, 호텔·숙소는 <a href="/gyeonggi/use/hotel/">객실 출입과 프런트 확인</a>, 오피스텔은 <a href="/gyeonggi/use/officetel/">관리 규정과 야간 출입</a>을 먼저 확인합니다. 신도시 아파트는 <a href="/gyeonggi/use/newtown/">단지 구조와 공동현관</a>, 산업단지 인접 숙소는 <a href="/gyeonggi/use/industrial-area/">정확한 주소와 이동 가능 시간</a>을 확인하세요.</p>
        <h2>예약 전 체크리스트</h2>
      </div>
      ${C.checklist(R.baseChecklist)}
      <div class="prose" style="margin-top:32px">
        <h2>개인정보 · 서비스 안내</h2>
        <p>예약 확인에 필요한 최소 정보만 확인하며 자세한 내용은 <a href="/gyeonggi/policy/privacy/">개인정보 처리방침</a>에서 확인할 수 있습니다. 본 안내는 <a href="/gyeonggi/policy/service/">불법·선정적 서비스 불가 안내</a> 기준을 따릅니다.</p>
      </div>
    </section>

    <section class="section--tight wrap">
      ${C.sectionHead('FAQ', `${a.name} 자주 묻는 질문`)}
      ${C.faqBlock(faqs)}
    </section>

    ${whoHowWhySection()}

    <section class="section--tight wrap">
      ${C.sectionHead('관련 지역', '인접 권역 보기')}
      ${C.cardGrid(related, 3)}
    </section>
    ${referenceSection()}
    `;

    emit(url, page({
      url, canonical: url, title: a.h1, desc: a.desc, crumbs, faqs, body,
    }), { priority: 0.9 });
  });
}

/* =========================================================================
   도시 인덱스 + 도시 상세
   ========================================================================= */
function buildCities() {
  // 인덱스
  const cards = R.cities.map((c) => ({ url: `/gyeonggi/city/${c[0]}/`, tag: '핵심 도시', title: c[1], desc: c[3] }));
  const idxUrl = '/gyeonggi/city/';
  const idxCrumbs = [HOME, { label: '도시별 안내', url: idxUrl }];
  emit(idxUrl, page({
    url: idxUrl, canonical: idxUrl,
    title: '경기 도시별 출장마사지 안내',
    desc: '경기 도시별 출장마사지 안내. 수원·성남·용인·고양 등 핵심 도시 생활권 이용 기준.',
    crumbs: idxCrumbs,
    body: `${C.breadcrumb(idxCrumbs)}
      <section class="section wrap">
        <h1>경기 핵심 도시 안내</h1>
        <p class="lead">핵심 도시부터 생활권 기준으로 이용 전 확인사항을 안내합니다.</p>
        ${C.cardGrid(cards, 4)}
      </section>${referenceSection()}`,
  }), { priority: 0.8 });

  // 상세
  R.cities.forEach((c) => {
    const [slug, name, zones, summary, areaSlug] = c;
    const area = areaBySlug[areaSlug];
    const url = `/gyeonggi/city/${slug}/`;
    const crumbs = [HOME, { label: '도시별 안내', url: idxUrl }, { label: name, url }];
    const zoneList = zones.split('·');
    const h1 = `${name} 출장마사지 · ${zoneList.slice(0, 3).join('·')} 생활권 안내`;
    const faqs = [
      { q: `${name}은 어떤 생활권으로 확인하나요?`, a: `${zones} 등 생활권 기준으로 확인하며, 각 생활권마다 이동 기준과 숙소 형태가 다릅니다.` },
      ...baseFaqs.slice(0, 4),
    ];
    const body = `
    ${C.breadcrumb(crumbs)}
    <section class="section--tight wrap">
      <span class="badge-soft">${area ? area.name : '경기 핵심 도시'}</span>
      <h1>${h1}</h1>
      <p class="lead">${summary}</p>
    </section>
    <section class="section--tight wrap">
      <div class="prose">
        <h2>${name} 생활권 개요</h2>
        <p>${name}은 ${zones} 등으로 생활권이 나뉩니다. ${summary} 같은 도시 안에서도 신도시·업무지구·역세권·외곽 이동권은 도로 구조와 숙소 형태가 달라, 방문 가능 여부를 생활권 기준으로 확인하는 것이 정확합니다.</p>
        <p>상위 권역인 <a href="/gyeonggi/area/${areaSlug}/">${area ? area.name : '해당 권역'}</a> 안내에서 인접 생활권과 이동 기준을 함께 확인할 수 있습니다.</p>
        <h2>대표 생활권</h2>
        <ul>${zoneList.map((z) => `<li><strong>${z}</strong> 생활권 — 이동 경로와 숙소 형태를 먼저 확인합니다.</li>`).join('')}</ul>
        <h2>이용 장소별 확인 기준</h2>
        <p><a href="/gyeonggi/use/home/">자택</a>·<a href="/gyeonggi/use/hotel/">호텔·숙소</a>·<a href="/gyeonggi/use/officetel/">오피스텔</a>·<a href="/gyeonggi/use/apartment/">아파트</a>는 각각 공동현관, 객실 출입, 관리 규정, 방문 가능 시간대를 확인해야 합니다.</p>
        <h2>예약 전 체크리스트</h2>
      </div>
      ${C.checklist(R.baseChecklist)}
    </section>
    <section class="section--tight wrap">
      ${C.sectionHead('FAQ', `${name} 자주 묻는 질문`)}
      ${C.faqBlock(faqs)}
    </section>
    ${whoHowWhySection()}
    ${referenceSection()}
    `;
    emit(url, page({ url, canonical: url, title: h1, desc: `${name} 출장마사지 안내. ${zoneList.slice(0,3).join('·')} 생활권 이용 전 확인사항.`, crumbs, faqs, body }), { priority: 0.8 });
  });
}

/* =========================================================================
   생활권 (life) — 인덱스 + 상세
   ========================================================================= */
function buildLife() {
  const idxUrl = '/gyeonggi/life/';
  const idxCrumbs = [HOME, { label: '생활권', url: idxUrl }];
  const cards = R.lifeItems.map((l) => ({ url: `/gyeonggi/life/${l[0]}/`, tag: '생활권', title: l[1], desc: l[3] }));
  emit(idxUrl, page({
    url: idxUrl, canonical: idxUrl, title: '경기 핵심 생활권 안내',
    desc: '경기 핵심 생활권 안내. 광교·판교·동탄·일산·배곧·고덕 생활권 이용 기준.',
    crumbs: idxCrumbs,
    body: `${C.breadcrumb(idxCrumbs)}<section class="section wrap"><h1>경기 핵심 생활권</h1><p class="lead">신도시·업무지구·역세권 생활권 기준으로 이용 전 확인사항을 안내합니다.</p>${C.cardGrid(cards, 3)}</section>${referenceSection()}`,
  }), { priority: 0.75 });

  R.lifeItems.forEach((l) => {
    const [slug, name, citySlug, desc] = l;
    const city = cityBySlug[citySlug];
    const url = `/gyeonggi/life/${slug}/`;
    const crumbs = [HOME, { label: '생활권', url: idxUrl }, { label: name, url }];
    const h1 = `${name} · 예약 전 확인 안내`;
    const faqs = baseFaqs.slice(0, 4);
    const body = `
    ${C.breadcrumb(crumbs)}
    <section class="section--tight wrap">
      <span class="badge-soft">${city ? city[1] : '경기'} 생활권</span>
      <h1>${h1}</h1>
      <p class="lead">${desc}</p>
    </section>
    <section class="section--tight wrap">
      <div class="prose">
        <h2>${name} 개요</h2>
        <p>${desc} 상위 도시인 <a href="/gyeonggi/city/${citySlug}/">${city ? city[1] : '해당 도시'}</a> 안내에서 인접 생활권과 이동 기준을 함께 확인할 수 있습니다.</p>
        <h2>이용 장소별 확인 기준</h2>
        <p>오피스텔은 <a href="/gyeonggi/use/officetel/">관리 규정·야간 출입</a>, 신도시 아파트는 <a href="/gyeonggi/use/newtown/">단지 구조·공동현관</a>, 인접 역·터미널은 <a href="/gyeonggi/use/station-terminal/">접근 동선과 예약 시간</a>을 먼저 확인하세요.</p>
        <h2>예약 전 체크리스트</h2>
      </div>
      ${C.checklist(R.baseChecklist)}
    </section>
    <section class="section--tight wrap">${C.sectionHead('FAQ', `${name} 자주 묻는 질문`)}${C.faqBlock(faqs)}</section>
    ${referenceSection()}
    `;
    // 생활권 상세는 얇을 수 있어 index 유지하되 본문 충분히 확보
    emit(url, page({ url, canonical: url, title: h1, desc, crumbs, faqs, body }), { priority: 0.7 });
  });
}

/* =========================================================================
   이용 장소 (use) & 예약 전 확인 (check)
   ========================================================================= */
function buildSimpleSet(items, base, label, extra) {
  items.forEach((it) => {
    const [slug, name, desc] = it;
    const url = `${base}${slug}/`;
    const crumbs = [HOME, { label, url }, { label: name, url }];
    const faqs = baseFaqs.slice(0, 4);
    const body = `
    ${C.breadcrumb(crumbs)}
    <section class="section--tight wrap">
      <span class="badge-soft">${label}</span>
      <h1>${name} · 이용 전 확인 안내</h1>
      <p class="lead">${desc}</p>
    </section>
    <section class="section--tight wrap">
      <div class="prose">
        <h2>${name} 안내</h2>
        <p>${desc} 경기도는 권역·생활권마다 건물 형태와 출입 방식이 달라, 방문 전 아래 항목을 함께 확인하면 안내가 빠릅니다.</p>
        ${extra(name)}
        <h2>예약 전 체크리스트</h2>
      </div>
      ${C.checklist(R.baseChecklist)}
      <div class="prose" style="margin-top:24px">
        <p>더 자세한 확인 기준은 <a href="/gyeonggi/check/address/">방문 주소 확인</a>, <a href="/gyeonggi/check/time/">예약 가능 시간</a>, <a href="/gyeonggi/policy/privacy/">개인정보 처리 기준</a>에서 확인할 수 있습니다.</p>
      </div>
    </section>
    <section class="section--tight wrap">${C.sectionHead('FAQ', `${name} 자주 묻는 질문`)}${C.faqBlock(faqs)}</section>
    ${referenceSection()}
    `;
    emit(url, page({ url, canonical: url, title: `${name} · 이용 전 확인 안내`, desc, crumbs, faqs, body }), { priority: 0.65 });
  });
}

/* =========================================================================
   운영 기준(policy) · 문의 · 사이트맵 페이지
   ========================================================================= */
function simplePage(url, title, desc, h1, inner, crumbs, opt = {}) {
  emit(url, page({
    url, canonical: url, title, desc, crumbs, noindex: opt.noindex,
    body: `${C.breadcrumb(crumbs)}<section class="section wrap"><h1>${h1}</h1>${inner}</section>`,
  }), { priority: opt.priority || 0.5 });
}

function buildPolicy() {
  const idxUrl = '/gyeonggi/policy/';
  const idxCrumbs = [HOME, { label: '운영 기준', url: idxUrl }];
  const policyCards = [
    { url: '/gyeonggi/policy/privacy/', tag: '운영', title: '개인정보 처리방침', desc: '예약 확인에 필요한 최소 정보만 확인하고 처리합니다.' },
    { url: '/gyeonggi/policy/service/', tag: '운영', title: '불법·선정적 서비스 불가 안내', desc: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
    { url: '/gyeonggi/policy/authors/', tag: '운영', title: '작성자·검수자 안내', desc: '누가 안내하고 검수하는지 밝힙니다.' },
  ];
  simplePage(idxUrl, '경기 출장마사지 운영 기준', '경기 출장마사지 안내 운영 기준. 개인정보·서비스·작성자 기준 안내.',
    '운영 기준', `<p class="lead">본 사이트의 운영·정보 기준을 안내합니다.</p>${C.cardGrid(policyCards, 3)}${referenceSection()}`, idxCrumbs, { priority: 0.6 });

  simplePage('/gyeonggi/policy/privacy/', '개인정보 처리방침 · 간다GO', '개인정보 처리방침. 예약 확인에 필요한 최소 정보만 확인·처리합니다.',
    '개인정보 처리방침',
    `<div class="prose">
      <p>본 사이트는 예약 확인과 연락에 필요한 최소한의 정보만 확인합니다. 수집된 정보는 예약 안내 목적 외에 사용하지 않으며, 목적이 끝나면 지체 없이 파기합니다.</p>
      <h2>수집 항목</h2><ul><li>예약 확인을 위한 연락 정보</li><li>방문 지역·이용 장소 확인 정보</li></ul>
      <h2>이용 목적</h2><p>예약 가능 여부 확인과 방문 안내에만 사용합니다.</p>
      <h2>보관 및 파기</h2><p>안내 목적이 완료되면 관련 정보를 지체 없이 파기합니다.</p>
      <h2>이용자 권리</h2><p>이용자는 언제든 자신의 정보 확인·삭제를 요청할 수 있습니다.</p>
      <p>개인정보 보호 일반 기준은 <a href="${R.authorities.pipc.url}" target="_blank" rel="${R.authorities.pipc.rel}">개인정보보호위원회</a>를 참고하세요.</p>
    </div>`, [...idxCrumbs, { label: '개인정보 처리방침', url: '/gyeonggi/policy/privacy/' }], { priority: 0.5 });

  simplePage('/gyeonggi/policy/service/', '불법·선정적 서비스 불가 안내 · 간다GO', '불법·선정적 서비스는 제공하거나 안내하지 않습니다.',
    '불법·선정적 서비스 불가 안내',
    `<div class="prose">
      <div class="notice">본 사이트는 정보 안내 목적의 페이지이며, 불법·선정적 서비스는 제공하거나 안내하지 않습니다.</div>
      <p>본 사이트는 경기도 권역·생활권과 자택·호텔·오피스텔 이용 전 확인사항을 안내합니다. 관련 소비자 유의사항은 <a href="${R.authorities.kca.url}" target="_blank" rel="${R.authorities.kca.rel}">한국소비자원</a>에서 확인할 수 있습니다.</p>
    </div>`, [...idxCrumbs, { label: '불법·선정적 서비스 불가 안내', url: '/gyeonggi/policy/service/' }], { priority: 0.5 });

  simplePage('/gyeonggi/policy/authors/', '작성자·검수자 안내 · 간다GO', '경기 지역 안내를 작성·검수하는 운영진 정보를 밝힙니다.',
    '작성자·검수자 안내',
    `<div class="prose">
      <p>본 사이트의 지역 안내는 경기도 권역·생활권과 이용 장소 기준을 정리해 온 운영진이 작성하고 검수합니다.</p>
      <h2>작성 기준</h2><p>행정구역·역세권·신도시·산업단지·외곽 이동 기준을 구분해 실제 방문 확인에 도움이 되도록 작성합니다.</p>
      <h2>검수 기준</h2><p>중복 문장, 과장 표현, 실제와 다른 안내가 없는지 확인하고, 필요 시 상위 생활권으로 통합·정리합니다.</p>
      <h2>문의</h2><p>안내 관련 문의는 <a href="/gyeonggi/contact/">문의하기</a> 페이지를 통해 남겨 주세요.</p>
    </div>`, [...idxCrumbs, { label: '작성자·검수자 안내', url: '/gyeonggi/policy/authors/' }], { priority: 0.5 });
}

function buildContact() {
  const url = '/gyeonggi/contact/';
  const crumbs = [HOME, { label: '문의하기', url }];
  simplePage(url, '문의하기 · 간다GO', '경기 출장마사지 안내 문의. 전화예약 0508-202-4719 · 텔레그램 문의.',
    '문의하기',
    `<div class="prose">
      <p class="lead">예약·제작·제휴 문의는 아래 채널로 남겨 주세요.</p>
      <div class="notice">상호 <strong>${site.brand}</strong> · 전화예약 <a href="tel:${site.tel}">${site.tel}</a></div>
      <p style="margin-top:24px">
        <a class="btn btn--brand" href="tel:${site.tel}">전화예약 ${site.tel}</a>
        <a class="btn btn--inquiry" href="${site.telegram.reserve}" target="_blank" rel="noopener nofollow">텔레그램 예약 문의</a>
      </p>
      <p style="margin-top:16px">
        <a class="btn btn--inquiry" href="${site.telegram.build}" target="_blank" rel="noopener nofollow">웹사이트 제작문의</a>
        <a class="btn btn--inquiry" href="${site.telegram.partner}" target="_blank" rel="noopener nofollow">제휴문의</a>
      </p>
    </div>`, crumbs, { priority: 0.6 });
}

function buildSitemapPage() {
  const url = '/gyeonggi/sitemap-page/';
  const crumbs = [HOME, { label: '사이트맵', url }];
  const group = (title, links) => `<h2>${title}</h2>${C.linkList(links)}`;
  const inner = `<div class="prose">
    ${group('권역', R.areas.map((a) => ({ url: `/gyeonggi/area/${a.slug}/`, label: a.name })))}
    ${group('도시', R.cities.map((c) => ({ url: `/gyeonggi/city/${c[0]}/`, label: c[1] })))}
    ${group('생활권', R.lifeItems.map((l) => ({ url: `/gyeonggi/life/${l[0]}/`, label: l[1] })))}
    ${group('이용 장소', R.useItems.map((u) => ({ url: `/gyeonggi/use/${u[0]}/`, label: u[1] })))}
    ${group('예약 전 확인', R.checkItems.map((c) => ({ url: `/gyeonggi/check/${c[0]}/`, label: c[1] })))}
  </div>`;
  simplePage(url, '사이트맵 · 간다GO', '간다GO 경기 출장마사지 안내 사이트맵. 권역·도시·생활권·이용 안내.',
    '사이트맵', inner, crumbs, { priority: 0.4 });
}

/* =========================================================================
   sitemap.xml + robots.txt
   ========================================================================= */
function buildSitemapXml() {
  const urls = pages.filter((p) => !p.noindex)
    .map((p) => `  <url><loc>${site.domain}${p.url}</loc><priority>${p.priority.toFixed(1)}</priority></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), xml);

  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${site.domain}/sitemap.xml\n`;
  fs.writeFileSync(path.join(OUT, 'robots.txt'), robots);
}

/* ---- 이용/확인 페이지 본문 보강 문단 ---- */
const useExtra = (name) =>
  `<h2>이런 점을 미리 확인하세요</h2><ul>
    <li>정확한 주소와 상세 동·호수</li>
    <li>건물 출입 방식과 방문 가능 시간</li>
    <li>주차·엘리베이터 등 이동 동선</li>
  </ul>`;
const checkExtra = (name) =>
  `<h2>확인 방법</h2><ul>
    <li>예약 전에 직접 확인하거나 관리 규정을 미리 문의합니다.</li>
    <li>확인이 어려우면 방문 가능 시간과 대체 동선을 함께 확인합니다.</li>
  </ul>`;

/* =========================================================================
   run
   ========================================================================= */
function run() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  // assets 복사
  fs.cpSync(path.join(__dirname, 'assets'), path.join(OUT, 'assets'), { recursive: true });

  buildHome();
  buildAreas();
  buildCities();
  buildLife();
  buildSimpleSet(R.useItems, '/gyeonggi/use/', '이용 장소', useExtra);
  buildSimpleSet(R.checkItems, '/gyeonggi/check/', '예약 전 확인', checkExtra);
  buildPolicy();
  buildContact();
  buildSitemapPage();
  buildSitemapXml();

  console.log(`✓ 생성 완료: ${pages.length} 페이지`);
  console.log(`  - index: ${pages.filter((p) => !p.noindex).length}, noindex: ${pages.filter((p) => p.noindex).length}`);
}

run();
