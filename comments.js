'use strict';
// ── Comments: lista o dettaglio (?id=X) ──────────────────────────────────────
initPage('comments', async d => {
  const id = getParam('id');
  if (id) renderDetail(d, decodeURIComponent(id));
  else renderList(d);
});

function renderList(d) {
  const cpp=d.comments_per_post||{}, cpa=d.comments_per_agent||{}, mcd=d.max_comment_depth||{};
  const tic=d.top_impactful_comments||[], vd=d.vote_distribution||{};
  document.getElementById('content').innerHTML = `
    <div>
      <p class="slabel">Statistiche commenti</p>
      <div class="kpis kpis--4">
        <div class="kpi kpi--comments"><div class="kpi-label">Commenti per post (media)</div><div class="kpi-value">${fmtDec(cpp.avg||0,1)}</div><div class="kpi-sub">mediana: ${fmtDec(cpp.median||0,1)}</div></div>
        <div class="kpi kpi--comments"><div class="kpi-label">Commenti per post (max)</div><div class="kpi-value">${fmt(cpp.max||0)}</div><div class="kpi-sub">post pi\u00f9 commentato</div></div>
        <div class="kpi kpi--neutral"><div class="kpi-label">Commenti per agente (media)</div><div class="kpi-value">${fmtDec(cpa.avg||0,1)}</div><div class="kpi-sub">mediana: ${fmtDec(cpa.median||0,1)}</div></div>
        <div class="kpi kpi--neutral"><div class="kpi-label">Profondit\u00e0 massima</div><div class="kpi-value">${mcd.max_depth||1}</div><div class="kpi-sub">livelli di reply annidati</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">Numero di commenti per fascia di replies ricevute</div></div>
      <div class="card-body"><div class="canvas-wrap"><canvas id="chart-reply-dist"></canvas></div></div>
    </div>
    <div class="card">
      <div class="card-head"><div><p class="slabel" style="margin-bottom:.2rem">Commenti con pi\u00f9 impatto</p><div class="card-title">Top 15 per replies &times; 3 + upvotes — clicca per il dettaglio</div></div></div>
      <div class="card-body"><div class="item-grid" id="grid-impact"></div><div class="pagination" id="pag-impact"></div></div>
    </div>
    <div>
      <div class="section-head"><span class="section-head-title">Distribuzione voti — Commenti</span><div class="section-head-line"></div></div>
      <div class="grid-2">
        <div class="card"><div class="card-head"><div class="card-title">Upvotes per commento</div><div class="legend"><div class="legend-item"><div class="legend-dot" style="background:var(--comments)"></div>N commenti</div></div></div><div class="card-body"><div class="canvas-wrap"><canvas id="chart-vup"></canvas></div></div></div>
        <div class="card"><div class="card-head"><div class="card-title">Downvotes per commento</div><div class="legend"><div class="legend-item"><div class="legend-dot" style="background:var(--spam)"></div>N commenti</div></div></div><div class="card-body"><div class="canvas-wrap"><canvas id="chart-vdn"></canvas></div></div></div>
      </div>
    </div>`;

  CardGrid('grid-impact','pag-impact',tic,(c,i)=>{
    const url='comments.html?id='+encodeURIComponent(c.id||'');
    const agentUrl='agents.html?name='+encodeURIComponent(c.author||'');
    return `<div class="item-card clickable" onclick="window.location.href='${url}'" style="cursor:pointer">
      <div class="item-card-rank">#${i+1}</div>
      <div class="item-card-title" style="font-size:.9rem">${(c.preview||'').replace(/</g,'&lt;').slice(0,80)}</div>
      <div class="item-card-meta">
        <div class="item-card-stat"><div class="item-card-stat-val" style="color:var(--comments)">${fmtFull(c.impact_score||0)}</div><div class="item-card-stat-lbl">Impact</div></div>
        <div class="item-card-stat"><div class="item-card-stat-val" style="color:var(--neutral)">${c.reply_count||0}</div><div class="item-card-stat-lbl">Replies</div></div>
        <div class="item-card-stat"><div class="item-card-stat-val" style="color:var(--posts)">${c.upvotes||0}</div><div class="item-card-stat-lbl">Upvotes</div></div>
      </div>
      <a href="${agentUrl}" class="item-card-author" onclick="event.stopPropagation()">${(c.author||'?').replace(/</g,'&lt;')}</a>
    </div>`;
  },9);

  const rcDist = d.reply_count_distribution;
  if (rcDist) barV(document.getElementById('chart-reply-dist'), rcDist.labels, rcDist.counts, C.neutral, 'Commenti', {skipZero:true});

  const vd_cu=vd.comments_upvotes, vd_cd=vd.comments_downvotes;
  if(vd_cu) barV(document.getElementById('chart-vup'),vd_cu.labels,vd_cu.counts,C.comments,'Upvotes',{skipZero:true});
  if(vd_cd) barV(document.getElementById('chart-vdn'),vd_cd.labels,vd_cd.counts,C.spam,'Downvotes',{skipZero:true});
}

function findComment(d, commentId) {
  // Cerca in top_impactful_comments
  const tic=d.top_impactful_comments||[];
  let c=tic.find(x=>x.id===commentId);
  if (c) return c;
  // Cerca nei top_comments dei post_details
  for (const post of Object.values(d.post_details||{})) {
    const found=(post.top_comments||[]).find(x=>x.id===commentId);
    if (found) return found;
  }
  return null;
}

function renderDetail(d, commentId) {
  const c=findComment(d, commentId);
  if (!c) {
    document.getElementById('content').innerHTML='<a href="comments.html" class="back-btn">\u2190 Commenti</a><div style="color:var(--text-dim);padding:2rem">Commento non trovato nel dataset.</div>';
    return;
  }
  const replies=c.top_replies||[];
  const postRef=c.post_id?`<a href="posts.html?id=${encodeURIComponent(c.post_id)}" style="color:var(--posts);text-decoration:underline">${c.post_id.slice(0,8)}\u2026</a>`:'\u2014';

  document.getElementById('content').innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem">
      <a href="comments.html" class="back-btn">\u2190 Commenti</a>
      <div style="flex:1;height:1px;background:var(--border)"></div>
    </div>
    <div class="card">
      <div class="card-body" style="display:flex;flex-direction:column;gap:1rem">
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
          <a href="agents.html?name=${encodeURIComponent(c.author||'')}" class="author-link">${(c.author||'?').replace(/</g,'&lt;')}</a>
          <div style="font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--text-dim)">Post: ${postRef}</div>
        </div>
        <div style="display:flex;gap:2rem;flex-wrap:wrap">
          <div><div class="detail-stat" style="color:var(--comments)">${fmtFull(c.upvotes||0)}</div><div class="detail-stat-label">Upvotes</div></div>
          <div><div class="detail-stat" style="color:var(--deleted)">${fmtFull(c.downvotes||0)}</div><div class="detail-stat-label">Downvotes</div></div>
          <div><div class="detail-stat" style="color:var(--neutral)">${fmtFull(c.reply_count||0)}</div><div class="detail-stat-label">Replies</div></div>
          <div><div class="detail-stat" style="color:var(--submolts)">${fmtFull(c.impact_score||0)}</div><div class="detail-stat-label">Impact</div></div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">Contenuto del commento</div></div>
      <div class="card-body"><div style="font-size:.88rem;color:var(--text-mid);line-height:1.7;white-space:pre-wrap;word-break:break-word;max-height:400px;overflow-y:auto">${(c.content||c.preview||'\u2014').replace(/</g,'&lt;')}</div></div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">Top 3 replies pi\u00f9 votate</div></div>
      <div class="card-body">
        <div style="display:flex;flex-direction:column;gap:.75rem">
          ${replies.length
            ? replies.map(r=>`
              <div class="comment-card">
                <div class="comment-card-header">
                  <a href="agents.html?name=${encodeURIComponent(r.author||'')}" class="comment-author">${(r.author||'?').replace(/</g,'&lt;')}</a>
                  <div class="comment-votes"><span>\u25b2 ${r.upvotes||0}</span><span>\u25bc ${r.downvotes||0}</span></div>
                </div>
                <div class="comment-body">${(r.content||'').replace(/</g,'&lt;')}</div>
              </div>`).join('')
            : '<div style="color:var(--text-dim);font-size:.8rem">Nessuna reply disponibile</div>'}
        </div>
      </div>
    </div>`;
}