'use strict';
const { esc } = require('./layout');

const breadcrumb = (crumbs) => `
  <nav class="breadcrumb" aria-label="위치">
    <div class="wrap"><ol>
      ${crumbs.map((c, i) =>
        i === crumbs.length - 1
          ? `<li aria-current="page">${esc(c.label)}</li>`
          : `<li><a href="${c.url}">${esc(c.label)}</a></li>`
      ).join('')}
    </ol></div>
  </nav>`;

/* 지역/하위 페이지용 컴팩트 히어로 (메인과 동일한 배경 이미지 + 스크림) */
const pageHero = (badge, h1, lead) => `
  <section class="hero hero--compact">
    <div class="hero__bg" aria-hidden="true"></div>
    <div class="wrap hero__inner">
      ${badge ? `<span class="badge-soft">${badge}</span>` : ''}
      <h1>${h1}</h1>
      ${lead ? `<p class="lead">${lead}</p>` : ''}
    </div>
  </section>`;

const sectionHead = (eyebrow, h2, sub) => `
  <div class="section-head">
    ${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ''}
    <h2>${esc(h2)}</h2>
    ${sub ? `<p>${esc(sub)}</p>` : ''}
  </div>`;

/* 카드 그리드 (내부링크) */
const cardGrid = (items, cols = 3) => `
  <div class="grid grid--${cols}">
    ${items.map((it) => `
      <a class="card" href="${it.url}">
        ${it.tag ? `<span class="card__tag">${esc(it.tag)}</span>` : ''}
        <h3>${esc(it.title)}</h3>
        <p>${esc(it.desc)}</p>
        <span class="card__more">자세히 보기</span>
      </a>`).join('')}
  </div>`;

/* 롱테일 내부링크 리스트 */
const linkList = (links) => `
  <ul class="linklist">
    ${links.map((l) => `<li><a href="${l.url}"${l.rel ? ` rel="${l.rel}"` : ''}${l.ext ? ' target="_blank"' : ''}>${esc(l.label)}</a></li>`).join('')}
  </ul>`;

const checklist = (items) => `
  <ul class="checklist">
    ${items.map((t) => `<li>${esc(t)}</li>`).join('')}
  </ul>`;

const faqBlock = (faqs) => `
  <div class="faq">
    ${faqs.map((f) => `
      <details>
        <summary>${esc(f.q)}</summary>
        <p>${esc(f.a)}</p>
      </details>`).join('')}
  </div>`;

const pricing = (plans) => `
  <div class="pricing">
    ${plans.map((p) => `
      <div class="price-card${p.featured ? ' price-card--featured' : ''}">
        ${p.featured ? `<span class="price-card__badge">추천</span>` : ''}
        <div class="price-card__name">${esc(p.name)}</div>
        <div class="price-card__amt">${esc(p.price)}<small>원</small></div>
        <div class="price-card__time">${esc(p.time)}</div>
        <div class="price-card__desc">${esc(p.desc)}</div>
        <a class="btn ${p.featured ? 'btn--brand' : 'btn--ghost'} btn--block" href="tel:0508-202-4719">예약 문의</a>
      </div>`).join('')}
  </div>`;

/* Who / How / Why 블록 (E-E-A-T) */
const whoHowWhy = (data) => `
  <div class="grid grid--3">
    <div class="card"><span class="card__tag">Who</span><h3>누가 안내하나요</h3><p>${esc(data.who)}</p></div>
    <div class="card"><span class="card__tag">How</span><h3>어떻게 안내하나요</h3><p>${esc(data.how)}</p></div>
    <div class="card"><span class="card__tag">Why</span><h3>왜 안내하나요</h3><p>${esc(data.why)}</p></div>
  </div>`;

module.exports = {
  breadcrumb, pageHero, sectionHead, cardGrid, linkList, checklist, faqBlock, pricing, whoHowWhy,
};
