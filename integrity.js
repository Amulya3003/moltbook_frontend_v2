'use strict';
// ── Integrity ─────────────────────────────────────────────────────────────────
initPage('integrity', async d => {
  const del_=d.deletions||{}, spam=d.spam||{};
  document.getElementById('content').innerHTML = `
    <div>
      <p class="slabel">Cancellazioni &amp; spam</p>
      <div class="kpis kpis--4">
        <div class="kpi kpi--deleted"><div class="kpi-label">Commenti cancellati</div><div class="kpi-value">${fmt(del_.comments_total||0)}</div><div class="kpi-sub">incluse replies</div></div>
        <div class="kpi kpi--deleted"><div class="kpi-label">Agenti con cancellazioni</div><div class="kpi-value">${fmt(del_.agents_with_deleted||0)}</div><div class="kpi-sub">account attivi coinvolti</div></div>
        <div class="kpi kpi--spam"><div class="kpi-label">Post spam</div><div class="kpi-value">${fmt(spam.spam_posts||0)}</div><div class="kpi-sub">is_spam = True</div></div>
        <div class="kpi kpi--spam"><div class="kpi-label">Commenti spam</div><div class="kpi-value">${fmt(spam.spam_comments||0)}</div><div class="kpi-sub">incluse replies</div></div>
      </div>
    </div>
    <div>
      <div class="section-head"><span class="section-head-title">Cancellazioni</span><div class="section-head-line"></div></div>
      <div class="card" style="margin-bottom:1px"><div class="card-head"><div class="card-title">Commenti cancellati nel tempo</div><div class="legend"><div class="legend-item"><div class="legend-dot" style="background:var(--deleted)"></div>Cancellati/giorno</div></div></div><div class="card-body"><div class="canvas-wrap"><canvas id="chart-del-ts"></canvas></div></div></div>
      <div class="card"><div class="card-head"><div class="card-title">Top agenti con pi\u00f9 cancellazioni — clicca per il dettaglio</div></div><div class="card-body"><div class="chart-scroll-outer"><div class="chart-scroll-inner" id="wrap-del"><canvas id="chart-del"></canvas></div></div></div></div>
    </div>
    <div>
      <div class="section-head"><span class="section-head-title">Spam</span><div class="section-head-line"></div></div>
      <div class="card" style="margin-bottom:1px"><div class="card-head"><div class="card-title">Contenuti spam nel tempo</div><div class="legend"><div class="legend-item"><div class="legend-dot" style="background:var(--spam)"></div>Spam/giorno</div></div></div><div class="card-body"><div class="canvas-wrap"><canvas id="chart-spam-ts"></canvas></div></div></div>
      <div class="grid-2">
        <div class="card"><div class="card-head"><div class="card-title">Top agenti spam — Post</div></div><div class="card-body"><div class="chart-scroll-outer"><div class="chart-scroll-inner" id="wrap-sp-p"><canvas id="chart-sp-p"></canvas></div></div></div></div>
        <div class="card"><div class="card-head"><div class="card-title">Top agenti spam — Commenti</div></div><div class="card-body"><div class="chart-scroll-outer"><div class="chart-scroll-inner" id="wrap-sp-c"><canvas id="chart-sp-c"></canvas></div></div></div></div>
      </div>
    </div>`;

  const nav=name=>{window.location.href='agents.html?name='+encodeURIComponent(name);};
  if(del_.timeseries?.labels?.length) lineChart(document.getElementById('chart-del-ts'),del_.timeseries.labels,del_.timeseries.counts,C.deleted,'Cancellati');
  const tda=(del_.top_agents||[]).slice(0,30);
  if(tda.length) scrollBarH('wrap-del','chart-del',tda.map(a=>a.author),tda.map(a=>a.count),C.deleted,'Cancellati',null,idx=>nav(tda[idx].author));
  if(spam.timeseries?.labels?.length) lineChart(document.getElementById('chart-spam-ts'),spam.timeseries.labels,spam.timeseries.counts,C.spam,'Spam');
  const tsp=(spam.top_agents_posts||[]).slice(0,10), tsc=(spam.top_agents_comments||[]).slice(0,10);
  if(tsp.length) scrollBarH('wrap-sp-p','chart-sp-p',tsp.map(a=>a.author),tsp.map(a=>a.count),C.spam,'Post spam',null,idx=>nav(tsp[idx].author));
  if(tsc.length) scrollBarH('wrap-sp-c','chart-sp-c',tsc.map(a=>a.author),tsc.map(a=>a.count),C.spam,'Commenti spam',null,idx=>nav(tsc[idx].author));
});