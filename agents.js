'use strict';
// ── Agents: lista o dettaglio (?name=X) ──────────────────────────────────────
initPage('agents', async d => {
  const name = getParam('name');
  if (name) renderDetail(d, decodeURIComponent(name));
  else renderList(d);
});

function renderList(d) {
  const da=d.deleted_agents||{}, tak=d.top_agents_karma||[];
  const ppa=d.posts_per_agent||{}, cpa=d.comments_per_agent||{};
  document.getElementById('content').innerHTML = `
    <div>
      <p class="slabel">Agenti cancellati</p>
      <div class="kpis kpis--2">
        <div class="kpi kpi--deleted"><div class="kpi-label">Contributi da account eliminati</div><div class="kpi-value">${fmt(da.total_contributions||0)}</div><div class="kpi-sub">righe in cui l'account risulta cancellato</div></div>
        <div class="kpi kpi--deleted"><div class="kpi-label">Di cui nelle replies annidate</div><div class="kpi-value">${fmt(da.deleted_rows_in_replies||0)}</div><div class="kpi-sub">su replies_flat.db</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div><p class="slabel" style="margin-bottom:.2rem">Reputazione</p><div class="card-title">Top 15 agenti per karma — clicca per il dettaglio</div></div></div>
      <div class="card-body"><div class="item-grid" id="grid-karma"></div><div class="pagination" id="pag-karma"></div></div>
    </div>
    <div class="grid-2">
      <div class="card"><div class="card-head"><div class="card-title">Top 30 per post pubblicati</div><div class="legend"><div class="legend-item"><div class="legend-dot" style="background:var(--submolts)"></div>Post</div></div></div><div class="card-body"><div class="chart-scroll-outer"><div class="chart-scroll-inner" id="wrap-ap"><canvas id="chart-ap"></canvas></div></div></div></div>
      <div class="card"><div class="card-head"><div class="card-title">Top 30 per commenti totali</div><div class="legend"><div class="legend-item"><div class="legend-dot" style="background:var(--comments)"></div>Commenti</div></div></div><div class="card-body"><div class="chart-scroll-outer"><div class="chart-scroll-inner" id="wrap-ac"><canvas id="chart-ac"></canvas></div></div></div></div>
    </div>`;

  CardGrid('grid-karma','pag-karma',tak,(a,i)=>{
    const agentUrl='agents.html?name='+encodeURIComponent(a.author);
    return `<div class="item-card clickable" onclick="window.location.href='${agentUrl}'" style="cursor:pointer">
      <div class="item-card-rank">#${i+1}</div>
      <div class="item-card-title">${a.author.replace(/</g,'&lt;')}</div>
      <div class="item-card-meta">
        <div class="item-card-stat"><div class="item-card-stat-val" style="color:var(--submolts)">${fmtFull(a.karma)}</div><div class="item-card-stat-lbl">Karma</div></div>
        <div class="item-card-stat"><div class="item-card-stat-val" style="color:var(--posts)">${fmt(a.follower_count)}</div><div class="item-card-stat-lbl">Followers</div></div>
      </div>
      <div class="item-card-tag">Last: ${a.last_active||'\u2014'}</div>
    </div>`;
  },9);

  const tpa=(ppa.top_agents||[]).slice(0,30), tca=(cpa.top_agents||[]).slice(0,30);
  if(tpa.length) scrollBarH('wrap-ap','chart-ap',tpa.map(a=>a.author),tpa.map(a=>a.count),C.submolts,'Post',null,idx=>{window.location.href='agents.html?name='+encodeURIComponent(tpa[idx].author);});
  if(tca.length) scrollBarH('wrap-ac','chart-ac',tca.map(a=>a.author),tca.map(a=>a.count),C.comments,'Commenti',null,idx=>{window.location.href='agents.html?name='+encodeURIComponent(tca[idx].author);});
}

function renderDetail(d, agentName) {
  const prof=(d.top_agents_karma||[]).find(a=>a.author===agentName)
          ||(d.creator_profiles||{})[agentName]||{};
  const det=(d.agent_details||{})[agentName]||{};
  const ts=det.timeseries||{labels:[],posts:[]};
  const tp=det.top_posts||[];

  document.getElementById('content').innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem">
      <a href="agents.html" class="back-btn">\u2190 Agenti</a>
      <div style="flex:1;height:1px;background:var(--border)"></div>
    </div>
    <div class="card">
      <div class="card-body" style="display:flex;flex-direction:column;gap:1rem">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:2.2rem;letter-spacing:.1em;color:var(--text)">${agentName.replace(/</g,'&lt;')}</div>
        <div style="display:flex;gap:2rem;flex-wrap:wrap">
          <div><div class="detail-stat" style="color:var(--submolts)">${fmtFull(prof.karma||0)}</div><div class="detail-stat-label">Karma</div></div>
          <div><div class="detail-stat" style="color:var(--posts)">${fmt(prof.follower_count||0)}</div><div class="detail-stat-label">Followers</div></div>
          <div><div class="detail-stat" style="color:var(--comments)">${fmt(prof.following_count||0)}</div><div class="detail-stat-label">Following</div></div>
          <div><div class="detail-stat" style="color:var(--neutral)">${fmt(det.total_posts||0)}</div><div class="detail-stat-label">Post totali</div></div>
          <div><div class="detail-stat" style="color:var(--neutral)">${fmt(det.total_comments||0)}</div><div class="detail-stat-label">Commenti totali</div></div>
        </div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--text-dim)">Last active: <span style="color:var(--text-mid)">${prof.last_active||'\u2014'}</span></div>
      </div>
    </div>
    <div class="grid-2">
      <div class="card"><div class="card-head"><div class="card-title">Post nel tempo</div><div class="legend"><div class="legend-item"><div class="legend-dot" style="background:var(--posts)"></div>Post/giorno</div></div></div><div class="card-body"><div class="canvas-wrap"><canvas id="chart-ts"></canvas></div></div></div>
      <div class="card"><div class="card-head"><div class="card-title">Top 5 post per interazioni</div></div><div class="card-body"><div class="chart-scroll-outer"><div class="chart-scroll-inner" id="wrap-tp"><canvas id="chart-tp"></canvas></div></div></div></div>
    </div>`;

  if(ts.labels.length) lineChart(document.getElementById('chart-ts'),ts.labels,ts.posts,C.posts,'Post');
  if(tp.length) scrollBarH('wrap-tp','chart-tp',tp.map(p=>(p.title||p.id||'\u2014').slice(0,38)),tp.map(p=>p.interactions),C.submolts,'Interazioni',null,idx=>{window.location.href='posts.html?id='+encodeURIComponent(tp[idx].id);});
}