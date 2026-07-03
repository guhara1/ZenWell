'use strict';
const site = require('../data/site');

/* ---- helpers ---- */
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (u) => (u.startsWith('http') ? u : site.domain + u);

/* description는 80자 이내 규칙을 강제 */
function clampDesc(desc) {
  const d = String(desc || '').trim().replace(/\s+/g, ' ');
  if (d.length <= 80) return d;
  return d.slice(0, 79).trimEnd() + '…';
}

/* ---- JSON-LD ---- */
function organizationLd() {
  return {
    '@type': 'Organization',
    '@id': site.domain + '/#organization',
    name: site.brand,
    url: site.domain + '/',
    telephone: site.tel,
    areaServed: { '@type': 'AdministrativeArea', name: '경기도' },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.tel,
      contactType: 'reservations',
      areaServed: 'KR',
      availableLanguage: 'Korean',
    },
    sameAs: [site.telegram.reserve],
  };
}

function breadcrumbLd(crumbs) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: abs(c.url),
    })),
  };
}

function webPageLd(page) {
  const ld = {
    '@type': 'WebPage',
    '@id': abs(page.url) + '#webpage',
    url: abs(page.url),
    name: page.metaTitle || page.title,
    description: clampDesc(page.desc),
    inLanguage: 'ko-KR',
    isPartOf: { '@id': site.domain + '/#website' },
    publisher: { '@id': site.domain + '/#organization' },
  };
  if (page.image) {
    ld.primaryImageOfPage = {
      '@type': 'ImageObject',
      url: abs(page.image),
      caption: page.title,
    };
  }
  return ld;
}

function faqLd(faqs) {
  if (!faqs || !faqs.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/* 실제 가격 기반 Service·Offer 스키마 (합법적 리치데이터, 가짜 후기·평점 미사용) */
function serviceLd(page) {
  if (!page.serviceArea) return null;
  return {
    '@type': 'Service',
    '@id': abs(page.url) + '#service',
    name: `${page.serviceArea} 출장마사지`,
    serviceType: '출장마사지·홈타이',
    inLanguage: 'ko-KR',
    areaServed: { '@type': 'AdministrativeArea', name: page.serviceArea },
    provider: { '@id': site.domain + '/#organization' },
    offers: [
      { '@type': 'Offer', name: '60분 코스', price: '90000', priceCurrency: 'KRW' },
      { '@type': 'Offer', name: '90분 코스', price: '150000', priceCurrency: 'KRW' },
      { '@type': 'Offer', name: '120분 코스', price: '180000', priceCurrency: 'KRW' },
    ],
  };
}

function buildJsonLd(page) {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': site.domain + '/#website',
      url: site.domain + '/',
      name: site.baseTitle,
      inLanguage: 'ko-KR',
      publisher: { '@id': site.domain + '/#organization' },
    },
    organizationLd(),
    webPageLd(page),
  ];
  if (page.crumbs && page.crumbs.length) graph.push(breadcrumbLd(page.crumbs));
  const faq = faqLd(page.faqs);
  if (faq) graph.push(faq);
  const svc = serviceLd(page);
  if (svc) graph.push(svc);
  if (page.extraLd) page.extraLd.forEach((x) => graph.push(x));
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

/* ---- header ---- */
function header(currentUrl) {
  const links = site.nav
    .map((n) => {
      const active = n.url === currentUrl ? ' aria-current="page"' : '';
      return `<a href="${n.url}"${active}>${esc(n.label)}</a>`;
    })
    .join('');
  return `
  <header class="site-header">
    <div class="wrap site-header__inner">
      <a class="brand" href="/">
        <span class="brand__mark">${esc(site.brandInitial)}</span>${esc(site.brand)}
      </a>
      <button class="nav-toggle" type="button" aria-label="메뉴 열기"
        onclick="this.closest('.site-header__inner').classList.toggle('open')">☰</button>
      <nav class="nav" aria-label="주요 메뉴">${links}</nav>
      <a class="btn btn--brand header-cta" href="tel:${site.tel}">전화예약 ${esc(site.tel)}</a>
    </div>
  </header>`;
}

/* ---- telegram icon ---- */
const tgIcon =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.3 18.7 19.5c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.2-8.3c.4-.4-.1-.6-.6-.2L6.3 13 1.4 11.5c-1-.3-1-1 .2-1.5L20.6 2.8c.9-.3 1.6.2 1.3 1.5z"/></svg>';

/* ---- footer (오렌지 문의 버튼 + 텔레그램) ---- */
function footer() {
  const cols = site.footer.cols
    .map(
      (c) => `
        <div class="footer-col">
          <h4>${esc(c.title)}</h4>
          <ul>${c.links.map((l) => `<li><a href="${l.url}">${esc(l.label)}</a></li>`).join('')}</ul>
        </div>`
    )
    .join('');

  return `
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-cta">
        <div class="footer-cta__copy">
          <h2>제작·제휴 문의는 텔레그램으로</h2>
          <p>웹사이트 제작과 지역 제휴 관련 문의를 남겨 주세요. 빠르게 안내해 드립니다.</p>
        </div>
        <div class="footer-cta__btns">
          <a class="btn btn--inquiry" href="${site.telegram.build}" target="_blank" rel="noopener nofollow">${tgIcon} 웹사이트 제작문의</a>
          <a class="btn btn--inquiry" href="${site.telegram.partner}" target="_blank" rel="noopener nofollow">${tgIcon} 제휴문의</a>
        </div>
      </div>

      <div class="footer-grid">
        <div class="footer-col footer-brand">
          <a class="brand" href="/"><span class="brand__mark">${esc(site.brandInitial)}</span>${esc(site.brand)}</a>
          <p>경기도 권역·생활권과 이용 장소별 예약 전 확인사항을 안내합니다.</p>
          <div class="footer-biz">
            <span><strong>상호</strong> · ${esc(site.brand)}</span>
            <a class="tel" href="tel:${site.tel}">전화예약 ${esc(site.tel)}</a>
          </div>
        </div>
        ${cols}
      </div>

      <div class="footer-bottom">
        <p class="disclaimer">${esc(site.footer.disclaimer)}</p>
        <span>© ${'2026'} ${esc(site.brand)}</span>
      </div>
    </div>
  </footer>`;
}

/* ---- page shell ---- */
function page(p) {
  const desc = clampDesc(p.desc);
  const title = p.metaTitle || `${p.title} · ${site.brand}`;
  const canonical = abs(p.canonical || p.url);
  const robots = p.noindex ? 'noindex, follow' : 'index, follow';
  const ogImage = abs(p.image || '/assets/img/og-default.png');

  return `<!doctype html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.brand)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="${site.locale}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#060607">
<meta name="naver-site-verification" content="bbf93bb26d0189b76a00ca61ccdfacade07a9e34">
<link rel="alternate" type="application/rss+xml" title="${esc(site.brand)} 경기 출장마사지 안내" href="/feed.xml">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
<link rel="stylesheet" href="/assets/css/style.css">
<script type="application/ld+json">
${buildJsonLd(p)}
</script>
</head>
<body>
${header(p.url)}
<main id="main">
${p.body}
</main>
${footer()}
<a class="call-fab" href="tel:${site.tel}" aria-label="전화 예약 ${site.tel}">
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.3 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z"/></svg>
  <span class="call-fab__label">전화</span>
</a>
</body>
</html>`;
}

module.exports = { page, esc, clampDesc, abs };
