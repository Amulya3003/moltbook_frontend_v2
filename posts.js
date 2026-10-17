'use strict';
// ── Posts: lista o dettaglio (?id=X) ─────────────────────────────────────────
initPage('posts', async d => {
  const id = getParam('id');
  if (id) renderDetail(d, decodeURIComponent(id));
  else renderList(d);
});

function renderList(d) {
  const ppd=d.posts_per_day||{}, ppa=d.posts_per_agent||{}, cpp=d.comments_per_post||{}, vd=d.vote_distribution||{}, tp=d.top_posts||[];
  document.getElementById('content').innerHTML = `
    <div>
      <p class="slabel">Statistiche post</p>
      <div class="kpis">
        <div class="kpi kpi--posts"><div class="kpi-label">Post al giorno (media)</div><div class="kpi-value">${fmtDec(ppd.avg||0,1)}</div><div class="kpi-sub">mediana: ${fmtDec(ppd.median||0,1)}</div></div>
        <div class="kpi kpi--neutral"><div class="kpi-label">Post per agente (media)</div><div class="kpi-value">${fmtDec(ppa.avg||0,2)}</div><div class="kpi-sub">mediana: ${fmtDec(ppa.median||0,2)}</div></div>
        <div class="kpi kpi--comments"><div class="kpi-label">Post senza commenti</div><div class="kpi-value">${fmt(cpp.posts_without_comments||0)}</div><div class="kpi-sub">nessuna interazione ricevuta</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">Numero di post per fascia di commenti ricevuti</div></div>
      <div class="card-body"><div class="canvas-wrap"><canvas id="chart-cpp-dist"></canvas></div></div>
    </div>
    <div class="card">
      <div class="card-head"><div><p class="slabel" style="margin-bottom:.2rem">Top post</p><div class="card-title">Top 30 post per interazioni — clicca per il dettaglio</div></div></div>
      <div class="card-body"><div class="item-grid" id="grid-posts"></div><div class="pagination" id="pag-posts"></div></div>
    </div>
    <div>
      <div class="section-head"><span class="section-head-title">Distribuzione voti — Post</span><div class="section-head-line"></div></div>
      <div class="grid-2">
        <div class="card"><div class="card-head"><div class="card-title">Upvotes per post</div><div class="legend"><div class="legend-item"><div class="legend-dot" style="background:var(--posts)"></div>N post</div></div></div><div class="card-body"><div class="canvas-wrap"><canvas id="chart-vup"></canvas></div></div></div>
        <div class="card"><div class="card-head"><div class="card-title">Downvotes per post</div><div class="legend"><div class="legend-item"><div class="legend-dot" style="background:var(--deleted)"></div>N post</div></div></div><div class="card-body"><div class="canvas-wrap"><canvas id="chart-vdn"></canvas></div></div></div>
      </div>
    </div>`;

  CardGrid('grid-posts','pag-posts',tp,(p,i)=>{
    const inter=(p.upvotes||0)+(p.downvotes||0), pct=p.upvote_pct;
    const title=(p.title||p.id||'\u2014').replace(/</g,'&lt;').slice(0,60);
    const postUrl='posts.html?id='+encodeURIComponent(p.id);
    const authorHtml=p.author&&p.author!=='unknown'
      ?`<a href="agents.html?name=${encodeURIComponent(p.author)}" class="item-card-author" onclick="event.stopPropagation()">by ${p.author}</a>`:'';
    return `<div class="item-card clickable" onclick="window.location.href='${postUrl}'" style="cursor:pointer">
      <div class="item-card-rank">#${i+1} &nbsp;\u00b7&nbsp; ${(p.submolt||'\u2014').slice(0,20)}</div>
      <div class="item-card-title">${title}</div>
      <div class="item-card-meta">
        <div class="item-card-stat"><div class="item-card-stat-val" style="color:var(--posts)">${fmtFull(inter)}</div><div class="item-card-stat-lbl">Interazioni</div></div>
        <div class="item-card-stat"><div class="item-card-stat-val" style="color:${pctColor(pct)}">${pct!=null?pct+'%':'\u2014'}</div><div class="item-card-stat-lbl">Upvote %</div></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center"><div class="item-card-tag">${p.created_at||'\u2014'}</div>${authorHtml}</div>
    </div>`;
  },9);

  const cppDist = cpp.distribution;
  if (cppDist) barV(document.getElementById('chart-cpp-dist'), cppDist.labels, cppDist.counts, C.comments, 'Post', {skipZero:true, logScale:true});

  const vd_pu=vd.posts_upvotes, vd_pd=vd.posts_downvotes;
  if(vd_pu) barV(document.getElementById('chart-vup'),vd_pu.labels,vd_pu.counts,C.posts,'Upvotes',{skipZero:true});
  if(vd_pd) barV(document.getElementById('chart-vdn'),vd_pd.labels,vd_pd.counts,C.deleted,'Downvotes',{skipZero:true});
}

function renderDetail(d, postId) {
  const det=(d.post_details||{})[postId];
  if (!det) {
    document.getElementById('content').innerHTML='<a href="posts.html" class="back-btn">\u2190 Post</a><div style="color:var(--text-dim);padding:2rem">Post non trovato nel dataset.</div>';
    return;
  }
  const inter=(det.upvotes||0)+(det.downvotes||0);
  const pct=inter>0?((det.upvotes||0)*100/inter).toFixed(1)+'%':'N/D';
  const comments=det.top_comments||[];

  document.getElementById('content').innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem">
      <a href="posts.html" class="back-btn">\u2190 Post</a>
      <div style="flex:1;height:1px;background:var(--border)"></div>
    </div>
    <div class="card">
      <div class="card-body" style="display:flex;flex-direction:column;gap:1rem">
        <div style="font-size:1.1rem;font-weight:500;color:var(--text);line-height:1.4">${(det.title||postId).replace(/</g,'&lt;')}</div>
        <div style="display:flex;gap:1.5rem;flex-wrap:wrap;font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--text-dim)">
          <span>Autore: <a href="agents.html?name=${encodeURIComponent(det.author||'')}" class="author-link" style="font-size:.65rem">${det.author||'\u2014'}</a></span>
          <span>Submolt: <span style="color:var(--comments)">${det.submolt||'\u2014'}</span></span>
          <span>Data: <span style="color:var(--text-mid)">${det.created_at||'\u2014'}</span></span>
        </div>
        <div style="display:flex;gap:2rem;flex-wrap:wrap">
          <div><div class="detail-stat" style="color:var(--comments)">${fmtFull(det.upvotes||0)}</div><div class="detail-stat-label">Upvotes</div></div>
          <div><div class="detail-stat" style="color:var(--deleted)">${fmtFull(det.downvotes||0)}</div><div class="detail-stat-label">Downvotes</div></div>
          <div><div class="detail-stat" style="color:var(--submolts)">${pct}</div><div class="detail-stat-label">Upvote %</div></div>
        </div>
      </div>
    </div>
    ${det.body?`<div class="card"><div class="card-head"><div class="card-title">Contenuto del post</div></div><div class="card-body"><div style="font-size:.82rem;color:var(--text-mid);line-height:1.7;white-space:pre-wrap;word-break:break-word;max-height:400px;overflow-y:auto">${det.body.replace(/</g,'&lt;')}</div></div></div>`:''}
    <div class="card">
      <div class="card-head"><div class="card-title">Top 5 commenti pi\u00f9 votati — clicca per il dettaglio</div></div>
      <div class="card-body">
        <div style="display:flex;flex-direction:column;gap:.75rem">
          ${comments.length
            ? comments.map(c=>{
                const cUrl='comments.html?id='+encodeURIComponent(c.id||'');
                const aUrl='agents.html?name='+encodeURIComponent(c.author||'');
                return `<div class="comment-card clickable-card" onclick="window.location.href='${cUrl}'" style="cursor:pointer">
                  <div class="comment-card-header">
                    <a href="${aUrl}" class="comment-author" onclick="event.stopPropagation()">${(c.author||'?').replace(/</g,'&lt;')}</a>
                    <div class="comment-votes">
                      <span>\u25b2 ${c.upvotes||0}</span><span>\u25bc ${c.downvotes||0}</span>
                      ${c.reply_count?`<span style="color:var(--neutral)">\u21b5 ${c.reply_count}</span>`:''}
                    </div>
                  </div>
                  <div class="comment-body">${(c.preview||c.content||'').replace(/</g,'&lt;').slice(0,200)}</div>
                </div>`;
              }).join('')
            : '<div style="color:var(--text-dim);font-size:.8rem">Nessun commento disponibile</div>'}
        </div>
      </div>
    </div>`;
}