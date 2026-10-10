'use strict';
// ── Chi siamo — ICT Lab ───────────────────────────────────────────────────────
initPage('about', async d => {
  document.getElementById('content').innerHTML = `
    <div class="card">
      <div class="card-body" style="display:flex;flex-direction:column;gap:1.5rem">
        <div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap">
          <img src="ictlablogo.png" alt="Logo ICT Lab" style="height:64px;width:auto">
          <div>
            <div style="font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:.06em;color:var(--text);line-height:1.1">
              Intelligence, Complexity and Technology Lab
            </div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:.7rem;letter-spacing:.1em;color:var(--text-dim);margin-top:.3rem">
              ICT Lab &middot; LIUC &mdash; Universit\u00e0 Cattaneo
            </div>
          </div>
        </div>
        <div style="font-size:.9rem;color:var(--text-mid);line-height:1.75;max-width:760px">
          In questo momento, imprese, istituzioni e cittadini si trovano davanti a una tecnologia
          che evolve a velocit\u00e0 settimanale, difficile da interpretare e ancora pi\u00f9 difficile
          da adottare in modo consapevole, e che per\u00f2 allo stesso tempo \u00e8 impossibile da ignorare.
          L'ICT Lab \u00e8 il centro di ricerca LIUC che produce conoscenza scientifica su IA generativa,
          sistemi multi-agente e complessit\u00e0, e la trasferisce al tessuto produttivo come leva di
          competitivit\u00e0 e innovazione.
        </div>
      </div>
    </div>

    <div>
      <div class="section-head"><span class="section-head-title">Moltbook Prism</span><div class="section-head-line"></div></div>
      <div class="card">
        <div class="card-body">
          <div style="font-size:.88rem;color:var(--text-mid);line-height:1.75;max-width:760px">
            Moltbook Prism \u00e8 il progetto di analytics sviluppato all'interno dell'ICT Lab per
            studiare il comportamento e le dinamiche di Moltbook, un social network popolato
            interamente da agenti AI. La pipeline raccoglie dati su submolts, post, commenti e
            interazioni, mentre questa dashboard ne restituisce un'analisi quantitativa esplorabile:
            andamento temporale dei contenuti, reputazione degli agenti, distribuzione dei voti,
            cancellazioni e contenuti spam.
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="section-head"><span class="section-head-title">Il team</span><div class="section-head-line"></div></div>
      <div class="card">
        <div class="card-body" style="display:flex;flex-direction:column;gap:.75rem">
          <div style="font-size:.85rem;color:var(--text-mid);line-height:1.7">
            Progetto sviluppato da stagisti e ricercatori dell'ICT Lab. Per i dettagli completi su
            persone, ruoli e aree di ricerca del laboratorio, consulta la presentazione ufficiale.
          </div>
          <a href="https://francescobertolotti.github.io/ict-lab-presentazione/dashboard.html"
             target="_blank" rel="noopener"
             style="display:inline-flex;align-items:center;gap:.5rem;width:fit-content;
                    font-family:'JetBrains Mono',monospace;font-size:.7rem;letter-spacing:.08em;
                    text-transform:uppercase;color:var(--posts);text-decoration:none;
                    border:1px solid var(--border);padding:.6rem 1.1rem;margin-top:.25rem;
                    transition:background .15s"
             onmouseover="this.style.background='var(--surface2)'"
             onmouseout="this.style.background='transparent'">
            Presentazione completa ICT Lab &#8599;
          </a>
        </div>
      </div>
    </div>

    <div>
      <div class="section-head"><span class="section-head-title">Contatti progetto</span><div class="section-head-line"></div></div>
      <div class="card">
        <div class="card-body">
          <div style="display:flex;flex-direction:column;gap:.6rem">
            <a href="mailto:amulya.galmarini@itsincom.it" class="footer-contact" style="flex-direction:row;gap:.6rem;align-items:baseline">
              <span class="footer-contact-name" style="font-size:.85rem">Amulya Galmarini</span>
              <span class="footer-contact-mail">amulya.galmarini@itsincom.it</span>
            </a>
          </div>
        </div>
      </div>
    </div>`;
});