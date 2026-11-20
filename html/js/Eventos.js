(() => {
  const KEY='sinaliza_eventos_admin_v1';
  const box=document.getElementById('eventos-administracao');
  if(!box) return;
  let items=[];
  const safeUrl=v=>{try{const u=new URL(String(v),window.location.href);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}};
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const date=v=>{if(!v)return '';const [y,m,d]=v.split('-');return `${d}/${m}/${y}`};
  const expirado=v=>{if(!v)return false;const d=new Date(v+'T23:59:59');return Number.isFinite(d.getTime()) && d < new Date();};
  const isNovo=v=>{if(!v)return false; const t=Date.parse(v); return Number.isFinite(t) && (Date.now()-t) <= 7*24*60*60*1000;};
  const show=()=>{if(!items.length){box.innerHTML='';return;}
  box.innerHTML='<h2>Atualizações da administração</h2>'+items.map(i=>`<div class="evento">${isNovo(i.publicado_em)?'<span class="novo-evento" role="status">Novo evento</span>':''}<h2>${esc(i.titulo)}</h2><p><strong>Tipo:</strong> ${esc(i.tipo)}</p><p><strong>Local:</strong> ${esc(i.local)}</p><p><strong>Data:</strong> ${date(i.data)}</p>${expirado(i.data)?'<p class="evento-expirado" role="status">Evento expirado — a data já passou.</p>':''}<p>${esc(i.descricao)}</p>${i.fonte?`<p><strong>Fonte:</strong> ${esc(i.fonte)}</p>`:''}${safeUrl(i.link)?`<a class="botao-evento" href="${esc(safeUrl(i.link))}" target="_blank" rel="noopener noreferrer" aria-label="Participar do evento ${esc(i.titulo)}">Participar ↗</a>`:''}</div>`).join('');
  };
  fetch('../backend/api/eventos.php').then(async r=>{const d=await r.json();if(!r.ok||!d.ok)throw Error(d.erro||'Falha na consulta');items=d.eventos;show()}).catch(e=>{box.textContent='Não foi possível carregar os eventos: '+e.message});
})();
