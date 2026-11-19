(() => {
  const KEY='sinaliza_interpretes_v1';
  const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const normal=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const busca=document.getElementById('busca'), localidade=document.getElementById('localidade'), modalidade=document.getElementById('modalidade');
  const lista=document.getElementById('lista-interpretes'), vazio=document.getElementById('vazio'), resultado=document.getElementById('resultado');
  const whatsapp=(telefone,nome)=>{const number=String(telefone||'').replace(/\D/g,'');return number?'https://wa.me/55'+number+'?text='+encodeURIComponent('Olá, '+nome+'. Encontrei seu perfil no Sinaliza+ e gostaria de solicitar ajuda em Libras.'):'#'};
  function render(){
    const q=normal(busca.value), loc=normal(localidade.value), mod=normal(modalidade.value);
    const itens=read().filter(i=>i.ativo!==false && (!i.status || i.status==='aprovado')).filter(i=>{
      const texto=normal([i.nome,i.atuacao,i.cidade,i.certificacao,i.disponibilidade].join(' '));
      const okq=!q||texto.includes(q), okl=!loc||normal(i.cidade).includes(loc), okm=!mod||normal(i.modalidade||'Presencial')===mod;
      return okq&&okl&&okm;
    });
    resultado.textContent=itens.length===1?'1 intérprete aprovado encontrado.':`${itens.length} intérpretes aprovados encontrados.`;
    vazio.hidden=itens.length!==0;
    lista.innerHTML=itens.map(i=>{
      const foto=i.foto_url?`<img class="foto" src="${esc(i.foto_url)}" alt="Foto de ${esc(i.nome)}" loading="lazy">`:'<div class="foto sem-foto" role="img" aria-label="Intérprete sem foto">👤</div>';
      const wa=whatsapp(i.telefone,i.nome);
      return `<article class="card-interprete"><div>${foto}</div><div class="dados"><h3>${esc(i.nome)}</h3><span class="validado">✓ Cadastro aprovado</span><p><strong>Localidade:</strong> ${esc(i.cidade)}</p><p><strong>Atuação:</strong> ${esc(i.atuacao)}</p><p><strong>Modalidade:</strong> ${esc(i.modalidade||'Presencial')}</p><p><strong>Disponibilidade:</strong> ${esc(i.disponibilidade)}</p>${i.certificacao?`<p><strong>Formação:</strong> ${esc(i.certificacao)}</p>`:''}<div class="acoes"><a class="botao" href="${esc(wa)}" target="_blank" rel="noopener noreferrer">Solicitar ajuda pelo WhatsApp</a><a class="botao botao-claro" href="mailto:${encodeURIComponent(i.email)}">Enviar e-mail</a></div></div></article>`;
    }).join('');
  }
  [busca,localidade,modalidade].forEach(el=>el.addEventListener('input',render));
  render();
})();
