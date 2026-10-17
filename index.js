'use strict';
// ── Overview ──────────────────────────────────────────────────────────────────

// Dots animation
let _dc=0, _dt=setInterval(()=>{ _dc=(_dc+1)%4; const e=document.getElementById('dots'); if(e) e.textContent='.'.repeat(_dc); },380);

initPage('overview', async d => {
  clearInterval(_dt);
  const t=d.totals, ts=d.timeseries, del_=d.deletions||{}, spam=d.spam||{};

  document.getElementById('content').innerHTML = `
    <div>
      <p class="slabel">Totali</p>
      <div class="kpis kpis--5 kpis">
        <div class="kpi kpi--submolts"><div class="kpi-bg" id="kpi-bg-sub"></div><div class="kpi-label">Submolts</div><div class="kpi-value" id="kpi-sub">0</div><div class="kpi-sub">comunit\u00e0 attive</div></div>
        <div class="kpi kpi--posts"><div class="kpi-bg" id="kpi-bg-posts"></div><div class="kpi-label">Posts</div><div class="kpi-value" id="kpi-posts">0</div><div class="kpi-sub">contenuti pubblicati</div></div>
        <div class="kpi kpi--comments"><div class="kpi-bg" id="kpi-bg-comments"></div><div class="kpi-label">Comments + Replies</div><div class="kpi-value" id="kpi-comments">0</div><div class="kpi-sub"><span id="kpi-cd">\u2014</span> diretti &middot; <span id="kpi-cr">\u2014</span> nested</div></div>
        <div class="kpi kpi--deleted"><div class="kpi-label">Cancellati</div><div class="kpi-value" id="kpi-del">\u2014</div><div class="kpi-sub" id="kpi-del-sub">\u2014 agenti</div></div>
        <div class="kpi kpi--spam"><div class="kpi-label">Spam</div><div class="kpi-value" id="kpi-spam">\u2014</div><div class="kpi-sub">post + commenti</div></div>
      </div>
    </div>
    <div>
      <div class="section-head">
        <span class="section-head-title">Serie storiche</span>
        <div class="section-head-line"></div>
        <div class="section-head-right">
          <div class="toggle" id="gran-toggle">
            <button class="toggle-btn active" data-gran="day">Day</button>
            <button class="toggle-btn" data-gran="week">Week</button>
            <button class="toggle-btn" data-gran="month">Month</button>
          </div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:1px;background:var(--border);border:1px solid var(--border)">
        <div class="card" style="border:none"><div class="card-head"><div class="card-title">Andamento — Posts</div><div class="legend"><div class="legend-item"><div class="legend-dot" style="background:var(--posts)"></div>Posts</div></div></div><div class="card-body"><div class="canvas-wrap"><canvas id="chart-posts"></canvas></div></div></div>
        <div class="card" style="border:none"><div class="card-head"><div class="card-title">Andamento — Commenti + Replies</div><div class="legend"><div class="legend-item"><div class="legend-dot" style="background:var(--comments)"></div>Commenti</div></div></div><div class="card-body"><div class="canvas-wrap"><canvas id="chart-comments"></canvas></div></div></div>
      </div>
    </div>`;

  document.getElementById('kpi-bg-sub').textContent   = fmtFull(t.submolts);
  document.getElementById('kpi-bg-posts').textContent  = fmt(t.posts);
  document.getElementById('kpi-bg-comments').textContent = fmt(t.comments_total);
  countUp(document.getElementById('kpi-sub'),      t.submolts,       900,  60);
  countUp(document.getElementById('kpi-posts'),    t.posts,         1200, 120);
  countUp(document.getElementById('kpi-comments'), t.comments_total,1500, 200);
  document.getElementById('kpi-cd').textContent = fmt(t.comments_direct);
  document.getElementById('kpi-cr').textContent = fmt(t.replies_nested);
  document.getElementById('kpi-del').textContent     = fmt((del_.comments_total||0)+(del_.posts_total||0));
  document.getElementById('kpi-del-sub').textContent  = fmt(del_.agents_with_deleted||0)+' agenti coinvolti';
  document.getElementById('kpi-spam').textContent    = fmt((spam.spam_posts||0)+(spam.spam_comments||0));

  const pc=lineChart(document.getElementById('chart-posts'),    ts.labels,ts.posts,   C.posts,   'Posts');
  const cc=lineChart(document.getElementById('chart-comments'), ts.labels,ts.comments,C.comments,'Commenti');
  document.getElementById('gran-toggle').addEventListener('click',e=>{
    const btn=e.target.closest('.toggle-btn'); if(!btn) return;
    document.querySelectorAll('#gran-toggle .toggle-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    const agg=aggregateTS(ts,btn.dataset.gran);
    pc.data.labels=agg.labels; pc.data.datasets[0].data=agg.posts; pc.update();
    cc.data.labels=agg.labels; cc.data.datasets[0].data=agg.comments; cc.update();
  });
});