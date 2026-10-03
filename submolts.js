'use strict';
// ── Submolts: lista (?name= assente) o dettaglio (?name=X) ───────────────────
initPage('submolts', async d => {
  const name = getParam('name');
  if (name) renderDetail(d, decodeURIComponent(name));
  else renderList(d);
});

function renderList(d) {
  const list = (d.top_submolts_full||{}).by_subscribers || [];
  const popular = list.filter(s=>s.subscriber_count>1000).length;

  document.getElementById('content').innerHTML = `
    <div>
      <p class="slabel">Totali</p>
      <div class="kpis kpis--2">
        <div class="kpi kpi--submolts"><div class="kpi-bg"></div><div class="kpi-label">Submolts totali</div><div class="kpi-value">${fmt(d.totals.submolts)}</div><div class="kpi-sub">comunit\u00e0 registrate</div></div>
        <div class="kpi kpi--posts"><div class="kpi-label">Con &gt;1000 subscriber</div><div class="kpi-value">${popular}</div><div class="kpi-sub">submolts con alta rilevanza</div></div>
      </div>
    </div>
    <div>
      <div class="section-head"><span class="section-head-title">Distribuzione subscriber</span><div class="section-head-line"></div></div>
      <div class="card">
        <div class="card-head"><div class="card-title">Numero di submolts per fascia di subscribers</div></div>
        <div class="card-body"><div class="canvas-wrap"><canvas id="chart-sub-dist"></canvas></div></div>
      </div>
    </div>
    <div>
      <div class="section-head"><span class="section-head-title">Top ${list.length} per subscribers</span><div class="section-head-line"></div></div>
      <div class="submolt-grid">${list.map((s,i)=>submoltCard(s,i)).join('')}</div>
    </div>`;

  const sd = d.subscriber_distribution;
  if (sd) barV(document.getElementById('chart-sub-dist'), sd.labels, sd.counts, C.submolts, 'Submolts', {skipZero:true, logScale:true});
}

function submoltCard(s,i) {
  return `<a href="submolts.html?name=${encodeURIComponent(s.name)}" class="submolt-card" style="text-decoration:none">
    <div class="submolt-card-header"><div class="submolt-name">${s.name}</div><div class="submolt-rank">#${i+1}</div></div>
    <div class="submolt-metrics">
      <div class="submolt-metric"><div class="submolt-metric-value submolt-metric-value--subs">${fmt(s.subscriber_count)}</div><div class="submolt-metric-label">Subscribers</div></div>
      <div class="submolt-metric"><div class="submolt-metric-value submolt-metric-value--posts">${fmt(s.post_count)}</div><div class="submolt-metric-label">Posts</div></div>
    </div>
    ${s.description?`<div class="submolt-desc">${s.description.replace(/</g,'&lt;').slice(0,160)}</div>`:''}
  </a>`;
}

function renderDetail(d, name) {
  const list   = (d.top_submolts_full||{}).by_subscribers||[];
  const meta   = list.find(s=>s.name===name)||{};
  const det    = (d.submolt_details||{})[name]||{};
  const ts     = det.timeseries||{labels:[],posts:[]};
  const tposts = det.top_posts||[];
  const tagents= det.top_agents||[];

  document.getElementById('content').innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem">
      <a href="submolts.html" class="back-btn">\u2190 Submolts</a>
      <div style="flex:1;height:1px;background:var(--border)"></div>
    </div>
    <div class="card">
      <div class="card-body" style="display:flex;flex-direction:column;gap:.75rem">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:2.5rem;letter-spacing:.1em;color:var(--text);line-height:1">${name}</div>
          <div style="display:flex;gap:2rem">
            <div><div style="font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:var(--posts)">${fmt(meta.subscriber_count||0)}</div><div class="detail-stat-label">Subscribers</div></div>
            <div><div style="font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:var(--comments)">${fmt(meta.post_count||0)}</div><div class="detail-stat-label">Posts</div></div>
            <div><div style="font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:var(--neutral)">${fmt(det.total_comments||0)}</div><div class="detail-stat-label">Commenti</div></div>
          </div>
        </div>
        ${meta.description?`<div style="font-size:.82rem;color:var(--text-mid);line-height:1.6">${meta.description.replace(/</g,'&lt;')}</div>`:''}
        ${meta.creator_name?`<div style="font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--text-dim)">Creato da: <a href="agents.html?name=${encodeURIComponent(meta.creator_name)}" class="author-link" style="font-size:.65rem">${meta.creator_name}</a></div>`:''}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">Post nel tempo</div><div class="legend"><div class="legend-item"><div class="legend-dot" style="background:var(--posts)"></div>Post/giorno</div></div></div>
      <div class="card-body"><div class="canvas-wrap"><canvas id="chart-ts"></canvas></div></div>
    </div>
    <div class="grid-2">
      <div class="card"><div class="card-head"><div class="card-title">Top 5 post per interazioni</div></div><div class="card-body"><div class="chart-scroll-outer"><div class="chart-scroll-inner" id="wrap-tp"><canvas id="chart-tp"></canvas></div></div></div></div>
      <div class="card"><div class="card-head"><div class="card-title">Top 5 agenti pi\u00f9 attivi</div></div><div class="card-body"><div class="chart-scroll-outer"><div class="chart-scroll-inner" id="wrap-ta"><canvas id="chart-ta"></canvas></div></div></div></div>
    </div>`;

  if (ts.labels.length) lineChart(document.getElementById('chart-ts'),ts.labels,ts.posts,C.posts,'Post');
  if (tposts.length)  scrollBarH('wrap-tp','chart-tp',tposts.map(p=>(p.title||p.id||'\u2014').slice(0,38)),tposts.map(p=>p.interactions),C.submolts,'Interazioni',null,idx=>{window.location.href='posts.html?id='+encodeURIComponent(tposts[idx].id);});
  if (tagents.length) scrollBarH('wrap-ta','chart-ta',tagents.map(a=>a.author),tagents.map(a=>a.count),C.neutral,'Post',null,idx=>{window.location.href='agents.html?name='+encodeURIComponent(tagents[idx].author);});
}