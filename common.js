'use strict';
// ── common.js — Moltbook Prism ────────────────────────────────────────────────

// ── Formatters ────────────────────────────────────────────────────────────────
function fmt(n)        { if(n>=1e6)return(n/1e6).toFixed(2)+'M'; if(n>=1e3)return(n/1e3).toFixed(1)+'K'; return Number(n).toLocaleString(); }
function fmtFull(n)    { return Number(n).toLocaleString(); }
function fmtDec(n,d=1) { return Number(n).toFixed(d); }
function pctColor(p)   { if(p==null)return'var(--text-dim)'; if(p>=80)return'var(--comments)'; if(p>=60)return'var(--posts)'; if(p>=40)return'var(--submolts)'; return'var(--deleted)'; }

// ── Stats cache ───────────────────────────────────────────────────────────────
let _statsCache = null;
async function loadStats() {
  if (_statsCache) return _statsCache;
  // no-cache: dopo il refresh notturno il browser prende subito il file nuovo
  const res = await fetch('data/stats.json', { cache: 'no-cache' });
  if (res.status === 404) { const e = new Error('stats.json non ancora pubblicato'); e.notReady = true; throw e; }
  if (!res.ok) throw new Error('HTTP ' + res.status);
  _statsCache = await res.json();
  return _statsCache;
}

// ── URL params ────────────────────────────────────────────────────────────────
function getParam(key) { return new URLSearchParams(window.location.search).get(key) || ''; }

// ── Theme ─────────────────────────────────────────────────────────────────────
function _applyTheme() {
  if (localStorage.getItem('theme') === 'light') document.body.classList.add('light');
  else document.body.classList.remove('light');
}
function _bindThemeToggle(id) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
  });
}

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV = [
  { id:'overview',  href:'index.html',     label:'Overview',  color:'var(--posts)' },
  { id:'submolts',  href:'submolts.html',  label:'Submolts',  color:'var(--submolts)' },
  { id:'posts',     href:'posts.html',     label:'Post',      color:'var(--submolts)' },
  { id:'comments',  href:'comments.html',  label:'Commenti',  color:'var(--comments)' },
  { id:'agents',    href:'agents.html',    label:'Agenti',    color:'var(--neutral)' },
  { id:'integrity', href:'integrity.html', label:'Integrit\u00e0', color:'var(--deleted)' },
  { id:'about',     href:'about.html',     label:'Chi siamo', color:'var(--text-dim)' },
];

function renderShell(activeId, d) {
  // Header
  document.getElementById('site-header').innerHTML =
    '<a href="index.html" class="header-logo-wrap">' +
      '<img src="moltbook_prism_logo.png" alt="Moltbook Prism" class="header-logo">' +
      '<img src="ictlablogo.png" alt="ICT Lab" class="header-logo" style="height:36px">' +
    '</a>' +
    '<div class="header-right">' +
      '<button class="theme-toggle" id="theme-toggle" title="Cambia tema">&#9680;</button>' +
    '</div>';

  // Nav
  document.getElementById('site-nav').innerHTML =
    NAV.map(n =>
      '<a href="' + n.href + '" class="tab-btn' + (n.id === activeId ? ' active' : '') + '">' +
      '<span class="tab-dot" style="background:' + n.color + '"></span>' + n.label + '</a>'
    ).join('');

  // Footer
  document.getElementById('site-footer').innerHTML =
    '<div class="footer-left">' +
      '<div class="footer-brand">MOLTBOOK PRISM</div>' +
    '</div>' +
    '<div class="footer-contacts">' +
      '<div class="footer-contacts-label">CONTACTS</div>' +
      '<div class="footer-contacts-list">' +
        '<a href="mailto:amulya.galmarini@itsincom.it" class="footer-contact">' +
          '<span class="footer-contact-name">Amulya Galmarini</span>' +
          '<span class="footer-contact-mail">amulya.galmarini@itsincom.it</span>' +
        '</a>' +
      '</div>' +
    '</div>' +
    '<div class="footer-contacts">' +
      '<div class="footer-contacts-label">ABOUT</div>' +
      '<div class="footer-contacts-list">' +
        '<a href="about.html" class="footer-contact">' +
          '<span class="footer-contact-name">ICT Lab \u2014 LIUC</span>' +
        '</a>' +
        '<a href="https://francescobertolotti.github.io/ict-lab-presentazione/dashboard.html" target="_blank" rel="noopener" class="footer-contact">' +
          '<span class="footer-contact-name">Sito ICT Lab \u2197</span>' +
        '</a>' +
      '</div>' +
    '</div>';

  // Avviso dati parziali (primo giro: commenti ancora in download)
  const cs = d && d.collection_status;
  if (cs && cs.partial && !document.getElementById('partial-banner')) {
    const b = document.createElement('div');
    b.id = 'partial-banner';
    b.style.cssText = 'margin:0 auto;padding:10px 24px;text-align:center;font-size:13px;' +
      'background:rgba(245,158,11,.12);border-bottom:1px solid rgba(245,158,11,.35);color:var(--text)';
    b.innerHTML = '&#9888; <strong>Dati parziali</strong> — la raccolta dei commenti è in corso: ' +
      'scaricati per il <strong>' + cs.comments_pct + '%</strong> dei post con commenti (' +
      fmtFull(cs.posts_with_comments_downloaded) + ' su ' + fmtFull(cs.posts_with_comments) +
      '). I numeri sui commenti cresceranno nei prossimi giorni.';
    const nav = document.getElementById('site-nav');
    nav.parentNode.insertBefore(b, nav.nextSibling);
  }

  // Populate dynamic values
  _applyTheme();
  _bindThemeToggle('theme-toggle');

  // (date badge e footer stats rimossi su richiesta)
}

// ── Page init ─────────────────────────────────────────────────────────────────
async function initPage(activeId, renderFn) {
  _applyTheme();
  try {
    const d = await loadStats();
    renderShell(activeId, d);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display     = 'block';
    await renderFn(d);
  } catch (err) {
    document.getElementById('loading').style.display = 'none';
    const errEl = document.getElementById('error');
    if (errEl) {
      // messaggio per i visitatori: niente istruzioni tecniche sul sito pubblico
      errEl.innerHTML = err && err.notReady
        ? '<span>&#8987; Dati in aggiornamento</span>' +
          '<span style="color:var(--text-dim)">La raccolta dei dati è in corso. Torna a trovarci tra qualche giorno.</span>'
        : '<span>&#9888; Impossibile caricare i dati</span>' +
          '<span style="color:var(--text-dim)">Riprova tra qualche minuto.</span>';
      errEl.style.display = 'flex';
    }
    console.error('initPage error:', err);
  }
}

// ── Count up ──────────────────────────────────────────────────────────────────
function countUp(el, target, duration=1200, delay=0, f) {
  if (!el) return;
  f = f || fmt;
  setTimeout(() => {
    const start = performance.now();
    const step = now => {
      const t = Math.min((now-start)/duration, 1);
      el.textContent = f(Math.round((1-Math.pow(1-t,4))*target));
      if (t < 1) requestAnimationFrame(step); else el.textContent = f(target);
    };
    requestAnimationFrame(step);
  }, delay);
}

// ── Chart.js defaults ─────────────────────────────────────────────────────────
Chart.defaults.color = '#6b8299';
Chart.defaults.font.family = "'JetBrains Mono', monospace";
Chart.defaults.font.size = 10;

const C = {
  posts:'#4d9fff', comments:'#34d399', neutral:'#a78bfa',
  deleted:'#f87171', spam:'#fb923c', submolts:'#f59e0b',
  surface:'#0d1420', border:'#1a2840', text:'#e8edf5', textMid:'#a0b4c8',
};
const ttBase = {
  backgroundColor:C.surface, borderColor:C.border, borderWidth:1,
  titleColor:C.text, bodyColor:C.textMid, padding:14,
  titleFont:{family:"'DM Sans',sans-serif",size:12,weight:'500'},
  bodyFont:{family:"'JetBrains Mono',monospace",size:11},
};

// ── Line chart ────────────────────────────────────────────────────────────────
function lineChart(canvas, labels, values, color, label) {
  if (!canvas) return null;
  const fill = color===C.posts?'rgba(77,159,255,.09)':color===C.comments?'rgba(52,211,153,.08)':'rgba(248,113,113,.08)';
  return new Chart(canvas, {
    type:'line',
    data:{ labels, datasets:[{ label, data:values, borderColor:color, backgroundColor:fill,
      borderWidth:1.5, pointRadius:0, pointHoverRadius:4, tension:.3, fill:true }] },
    options:{
      responsive:true, maintainAspectRatio:false,
      interaction:{mode:'index',intersect:false},
      plugins:{ legend:{display:false},
        tooltip:{...ttBase, callbacks:{label:ctx=>`  ${ctx.dataset.label}: ${fmtFull(ctx.parsed.y)}`}} },
      scales:{
        x:{type:'category',grid:{color:C.border},border:{color:C.border},ticks:{maxTicksLimit:8,maxRotation:0,padding:8}},
        y:{grid:{color:C.border},border:{dash:[4,4],color:'transparent'},ticks:{callback:v=>fmt(v),color,padding:8}},
      },
    },
  });
}

// ── Vertical bar ──────────────────────────────────────────────────────────────
function barV(canvas, labels, values, color, label, opts={}) {
  if (!canvas) return null;
  let dispL=labels, dispV=values, zeroInfo=null;
  if (opts.skipZero && labels && labels[0]==='0') { zeroInfo={count:values[0]}; dispL=labels.slice(1); dispV=values.slice(1); }
  const zeroPlugin = zeroInfo ? [{
    id:'zeroAnnotation',
    afterDraw(chart) {
      const {ctx,chartArea:ca}=chart;
      const text='0 : '+fmt(zeroInfo.count);
      const padX=10,padY=6,fSize=11;
      ctx.save(); ctx.font=`700 ${fSize}px 'JetBrains Mono',monospace`;
      const tw=ctx.measureText(text).width;
      const bw=tw+padX*2,bh=fSize+padY*2;
      const x=ca.right-bw-10,y=ca.top+10;
      ctx.fillStyle='rgba(26,40,64,.92)'; ctx.beginPath(); ctx.roundRect(x,y,bw,bh,4); ctx.fill();
      ctx.strokeStyle='rgba(196,207,224,.25)'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle='#fff'; ctx.textAlign='left'; ctx.textBaseline='middle';
      ctx.fillText(text,x+padX,y+bh/2); ctx.restore();
    },
  }] : [];
  return new Chart(canvas, {
    type:'bar',
    data:{labels:dispL,datasets:[{label,data:dispV,backgroundColor:color+'99',borderColor:color,borderWidth:1,borderRadius:2}]},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{...ttBase,callbacks:{label:ctx=>`  ${ctx.dataset.label}: ${fmtFull(ctx.parsed.y)}`}}},
      scales:{
        x:{grid:{color:C.border},border:{color:C.border},ticks:{font:{size:9}}},
        y:{type:opts.logScale?'logarithmic':'linear',grid:{color:C.border},border:{dash:[4,4],color:'transparent'},ticks:{callback:v=>fmt(v),padding:8}},
      },
    },
    plugins:zeroPlugin,
  });
}

// ── Horizontal scrollable bar ─────────────────────────────────────────────────
const BAR_H = 28;
function scrollBarH(wrapperId, canvasId, labels, values, color, label, tooltipFn, onClickFn) {
  const wrapper=document.getElementById(wrapperId), canvas=document.getElementById(canvasId);
  if (!wrapper||!canvas) return;
  const h=Math.max(180,labels.length*BAR_H+40);
  wrapper.style.height=h+'px'; canvas.style.height=h+'px'; canvas.height=h;
  if (onClickFn) canvas.style.cursor='pointer';
  return new Chart(canvas, {
    type:'bar',
    data:{labels,datasets:[{label,data:values,backgroundColor:color+'99',borderColor:color,borderWidth:1,borderRadius:2,borderSkipped:false}]},
    options:{
      indexAxis:'y',responsive:true,maintainAspectRatio:false,
      onClick:(evt,els)=>{ if(els.length&&onClickFn) onClickFn(els[0].index); },
      plugins:{legend:{display:false},tooltip:{...ttBase,callbacks:{label:tooltipFn||(ctx=>`  ${ctx.dataset.label}: ${fmtFull(ctx.parsed.x)}`)}}},
      scales:{
        x:{grid:{color:C.border},border:{color:C.border},ticks:{callback:v=>fmt(v)}},
        y:{grid:{display:false},border:{color:C.border},ticks:{font:{family:"'DM Sans',sans-serif",size:10},color:C.textMid,padding:8}},
      },
    },
  });
}

// ── Paginated card grid ───────────────────────────────────────────────────────
function CardGrid(gridId, pagId, items, renderFn, pageSize=9) {
  const grid=document.getElementById(gridId), pag=document.getElementById(pagId);
  if (!grid) return;
  let page=0;
  const pages=Math.ceil(items.length/pageSize);
  function render() {
    const slice=items.slice(page*pageSize,(page+1)*pageSize);
    grid.innerHTML=slice.map((item,i)=>renderFn(item,page*pageSize+i)).join('');
    if (!pag) return;
    if (pages<=1){pag.innerHTML='';return;}
    pag.innerHTML=
      `<button class="pag-btn"${page===0?' disabled':''} id="pp-${gridId}">\u2190 Prec</button>`+
      `<span class="pag-info">Pagina ${page+1} / ${pages}</span>`+
      `<button class="pag-btn"${page===pages-1?' disabled':''} id="pn-${gridId}">Succ \u2192</button>`;
    document.getElementById('pp-'+gridId).onclick=()=>{if(page>0){page--;render();}};
    document.getElementById('pn-'+gridId).onclick=()=>{if(page<pages-1){page++;render();}};
  }
  render();
}

// ── Time series aggregation ───────────────────────────────────────────────────
function aggregateTS(ts, gran) {
  if (gran==='day') return ts;
  const getKey = gran==='week'
    ? d=>{ const t=new Date(d); t.setDate(t.getDate()+3-((t.getDay()+6)%7));
           const w1=new Date(t.getFullYear(),0,4);
           return `${t.getFullYear()}-W${String(1+Math.round(((t-w1)/86400000-3+((w1.getDay()+6)%7))/7)).padStart(2,'0')}`; }
    : d=>d.slice(0,7);
  const pm={},cm={};
  ts.labels.forEach((d,i)=>{ const k=getKey(d); pm[k]=(pm[k]||0)+ts.posts[i]; cm[k]=(cm[k]||0)+ts.comments[i]; });
  const keys=Object.keys(pm).sort();
  return {labels:keys,posts:keys.map(k=>pm[k]),comments:keys.map(k=>cm[k])};
}