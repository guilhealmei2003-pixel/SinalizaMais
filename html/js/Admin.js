(() => {
  // O PHP protege /admin/painel.php. Nunca confiar no localStorage para autorizar acesso.
  const EVENTS = 'sinaliza_eventos_admin_v1';
  const csrf = document.querySelector('meta[name="admin-csrf-token"]')?.content || '';

  let eventItems=[];
  const read=()=>eventItems;
  const api=async(path,options={})=>{const r=await fetch('../backend/api/'+path,{credentials:'same-origin',...options});let d;try{d=await r.json()}catch{throw Error('Resposta inválida do servidor. Verifique o PHP e o MySQL.')}if(!r.ok||!d.ok)throw Error(d.erro||'Não foi possível acessar o servidor.');return d;};
  const mutation=(method,data)=>({method,headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify(data)});
  const loadEvents=async()=>{try{eventItems=(await api('eventos.php?admin=1')).eventos;render()}catch(e){document.getElementById('admin-eventos').textContent=e.message;}};
  const safeUrl = value => { try { const u = new URL(String(value), window.location.href); return ['http:', 'https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const formatDate = value => { if (!value) return ''; const [y,m,d] = value.split('-'); return `${d}/${m}/${y}`; };

  const render = () => {
    const box = document.getElementById('admin-eventos'); if (!box) return;
    const items = read();
    if (!items.length) { box.innerHTML = '<p class="lista-vazia">Nenhuma publicação criada pela administração.</p>'; return; }
    box.innerHTML = items.map((item, index) => `<article class="perfil-interprete"><div><h3>${escape(item.titulo)}</h3><p><strong>${escape(item.tipo)}</strong> · ${escape(item.local)} · ${formatDate(item.data)}</p><p><strong>Status:</strong> ${escape(item.status || 'publicado')}</p><p>${escape(item.descricao)}</p>${item.fonte ? `<p><strong>Fonte:</strong> ${escape(item.fonte)}</p>` : ''}${safeUrl(item.link) ? `<p><a href="${escape(safeUrl(item.link))}" target="_blank" rel="noopener noreferrer">Link de informações ↗</a></p>` : ''}</div><div class="contato-interprete"><button class="botao" type="button" data-delete="${Number(item.id)}">Excluir</button></div></article>`).join('');
    box.querySelectorAll('[data-delete]').forEach(btn=>btn.addEventListener('click',async()=>{if(!confirm('Excluir esta publicação?'))return;try{await api('eventos.php',mutation('DELETE',{id:Number(btn.dataset.delete)}));await loadEvents()}catch(e){alert(e.message)}}));
  };

  const form = document.getElementById('form-evento-admin');
  if(form) form.addEventListener('submit',async e=>{
    e.preventDefault();const out=document.getElementById('mensagem-admin-evento');
    const item={titulo:document.getElementById('evento-titulo').value.trim(),tipo:document.getElementById('evento-tipo').value,local:document.getElementById('evento-local').value.trim(),data:document.getElementById('evento-data').value,descricao:document.getElementById('evento-descricao').value.trim(),status:document.getElementById('evento-status').value,fonte:document.getElementById('evento-fonte').value.trim(),link:document.getElementById('evento-link').value.trim()};
    if(!item.titulo||!item.local||!item.data||!item.descricao){out.textContent='Preencha os campos obrigatórios.';return;}
    if(item.link&&!safeUrl(item.link)){out.textContent='Informe um link HTTP ou HTTPS válido.';return;}
    try{await api('eventos.php',mutation('POST',item));form.reset();out.textContent='Publicação salva no banco de dados com sucesso.';out.className='mensagem-interprete sucesso';await loadEvents()}catch(err){out.textContent=err.message;out.className='mensagem-interprete erro';}
  });
  let interpreterItems=[];
  const readInterpreters=()=>interpreterItems;
  const loadInterpreters=async()=>{try{interpreterItems=(await api('interpretes_admin.php')).interpretes;renderInterpreters()}catch(e){document.getElementById('admin-interpretes').textContent=e.message;}};
  const normalizeInterpreterStatus = item => { if (!item.status) item.status = item.ativo === false ? 'bloqueado' : 'aprovado'; return item; };
  const statusLabel = status => ({pendente:'Pendente', aprovado:'Aprovado', reprovado:'Reprovado', bloqueado:'Bloqueado'}[status] || status);
  const renderInterpreters = () => {
    const box = document.getElementById('admin-interpretes'); if (!box) return;
    const list = readInterpreters().map(normalizeInterpreterStatus);
    if (!list.length) { box.innerHTML = '<p class="lista-vazia">Nenhum intérprete cadastrado.</p>'; return; }
    box.innerHTML = list.map((item,index) => {
      const status = item.status || 'pendente';
      const disabled = status === 'bloqueado';
      return `<article class="perfil-interprete" data-interprete-index="${Number(item.id)}">
        <div>
          ${item.foto_url ? `<img src="${escape(item.foto_url)}" alt="Foto de ${escape(item.nome)}" style="max-width:90px;border-radius:12px;margin-bottom:10px;">` : ''}
          <h3>${escape(item.nome)}</h3>
          <p><strong>Status:</strong> ${escape(statusLabel(status))}</p>
          <p><strong>E-mail:</strong> ${escape(item.email)}</p>
          <p><strong>Telefone:</strong> ${escape(item.telefone)}</p>
          <p><strong>Cidade:</strong> ${escape(item.cidade)}</p>
          <p><strong>Atuação:</strong> ${escape(item.atuacao)}</p>
          <p><strong>Modalidade:</strong> ${escape(item.modalidade || 'Presencial')}</p>
          <p><strong>Formação:</strong> ${escape(item.certificacao || 'Não informada')}</p>
          <p><strong>Disponibilidade:</strong> ${escape(item.disponibilidade)}</p>
          ${item.motivo_status ? `<p><strong>Observação administrativa:</strong> ${escape(item.motivo_status)}</p>` : ''}
        </div>
        <div class="contato-interprete" style="display:flex;flex-direction:column;gap:8px;min-width:190px;">
          ${status !== 'aprovado' && !disabled ? `<button class="botao" type="button" data-interp-action="aprovar">Aprovar cadastro</button>` : ''}
          ${status !== 'reprovado' && !disabled ? `<button class="botao botao-claro" type="button" data-interp-action="reprovar">Reprovar</button>` : ''}
          ${!disabled ? `<button class="botao botao-claro" type="button" data-interp-action="bloquear">Bloquear acesso</button>` : `<button class="botao" type="button" data-interp-action="desbloquear">Desbloquear</button>`}
          <button class="botao botao-claro" type="button" data-interp-action="editar">Editar dados</button>
          <button class="botao botao-claro" type="button" data-interp-action="excluir">Excluir cadastro</button>
        </div>
      </article>`;
    }).join('');
    box.querySelectorAll('[data-interp-action]').forEach(btn=>btn.addEventListener('click',async()=>{
      const id=Number(btn.closest('[data-interprete-index]').dataset.interpreteIndex),action=btn.dataset.interpAction;
      const item=readInterpreters().find(i=>Number(i.id)===id);if(!item)return;
      try{
        if(action==='excluir'){if(!confirm(`Excluir permanentemente ${item.nome}?`))return;await api('interpretes_admin.php',mutation('DELETE',{id}));await loadInterpreters();return;}
        if(action==='editar'){
          const modal=document.getElementById('modal-editar-interprete');if(!modal)return;
          document.getElementById('edit-interprete-index').value=String(id);
          for(const field of ['nome','email','telefone','cidade','atuacao','certificacao','modalidade','disponibilidade'])document.getElementById('edit-interprete-'+field).value=item[field]||'';
          document.getElementById('mensagem-editar-interprete').textContent='';modal.hidden=false;document.body.style.overflow='hidden';document.getElementById('edit-interprete-nome').focus();return;
        }
        let status=({aprovar:'aprovado',reprovar:'reprovado',bloquear:'bloqueado',desbloquear:'aprovado'})[action];if(!status)return;
        let motivo_status='';if(['reprovar','bloquear'].includes(action)){const text=prompt('Informe o motivo:',action==='reprovar'?'Cadastro precisa de validação.':'Acesso bloqueado para análise.');if(text===null)return;motivo_status=text.trim();}
        await api('interpretes_admin.php',mutation('PATCH',{id,status,motivo_status}));await loadInterpreters();
      }catch(e){alert(e.message)}
    }));
  };

  const editModal=document.getElementById('modal-editar-interprete');
  const closeEdit=()=>{if(editModal){editModal.hidden=true;document.body.style.overflow='';}};
  document.getElementById('fechar-edicao-interprete')?.addEventListener('click',closeEdit);
  document.getElementById('cancelar-edicao-interprete')?.addEventListener('click',closeEdit);
  editModal?.addEventListener('click',e=>{if(e.target===editModal)closeEdit();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&editModal&&!editModal.hidden)closeEdit();});
  document.getElementById('form-editar-interprete')?.addEventListener('submit',async e=>{
    e.preventDefault();const id=Number(document.getElementById('edit-interprete-index').value);
    const d={id};for(const field of ['nome','email','telefone','cidade','atuacao','certificacao','modalidade','disponibilidade'])d[field]=document.getElementById('edit-interprete-'+field).value.trim();
    try{await api('interpretes_admin.php',mutation('PATCH',d));await loadInterpreters();closeEdit();}
    catch(err){document.getElementById('mensagem-editar-interprete').textContent=err.message;}
  });

  const renderContactMessages=async()=>{
    const box=document.getElementById('admin-mensagens-contato'); if(!box)return;
    try{
      const response=await fetch('../backend/api/contato.php'); const data=await response.json(); if(!response.ok||!data.ok)throw new Error(data.erro||'Falha ao consultar mensagens.');
      if(!data.mensagens.length){box.innerHTML='<p class="lista-vazia">Nenhuma mensagem recebida até o momento.</p>';return;}
      box.innerHTML=data.mensagens.map(m=>`<article class="mensagem-admin-card" data-message-id="${Number(m.id)}"><h3>${escape(m.assunto)}</h3><p class="mensagem-admin-meta">${escape(m.nome)} · <a href="mailto:${escape(m.email)}">${escape(m.email)}</a> · ${escape(m.criado_em)} · Status: ${escape(m.status)}</p><p>${escape(m.mensagem)}</p><div class="mensagem-admin-acoes"><button class="botao botao-claro" data-msg-status="lida" type="button">Marcar como lida</button><button class="botao botao-claro" data-msg-status="respondida" type="button">Marcar respondida</button><button class="botao botao-claro" data-msg-status="arquivada" type="button">Arquivar</button></div></article>`).join('');
      box.querySelectorAll('[data-msg-status]').forEach(btn=>btn.addEventListener('click',async()=>{const id=Number(btn.closest('[data-message-id]').dataset.messageId);try{const r=await fetch('../backend/api/contato.php',{method:'PATCH',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({id,status:btn.dataset.msgStatus})});const result=await r.json();if(!r.ok||!result.ok)throw new Error(result.erro||'Falha ao atualizar.');renderContactMessages();}catch(err){alert(err.message||'Não foi possível atualizar o status.');}}));
    }catch(err){box.innerHTML='<p class="lista-vazia">Não foi possível carregar as mensagens. Confirme se o banco está configurado e a tabela mensagens_contato foi criada pelo schema.sql.</p>';}
  };

  document.getElementById('importar-local')?.addEventListener('click',async()=>{
    const result=document.getElementById('mensagem-importar-local');
    let eventos=[],interpretes=[];
    try{eventos=JSON.parse(localStorage.getItem('sinaliza_eventos_admin_v1')||'[]');interpretes=JSON.parse(localStorage.getItem('sinaliza_interpretes_v1')||'[]');}catch{result.textContent='Dados locais inválidos.';return;}
    if(!Array.isArray(eventos)||!Array.isArray(interpretes)){result.textContent='Dados locais inválidos.';return;}
    if(!eventos.length&&!interpretes.length){result.textContent='Não há dados antigos salvos neste navegador.';return;}
    if(!confirm(`Importar ${eventos.length} eventos e ${interpretes.length} intérpretes para o banco de dados?`))return;
    try{const r=await api('importar_local.php',mutation('POST',{eventos,interpretes}));result.textContent=`Importação concluída: ${r.eventos_importados} eventos e ${r.interpretes_importados} intérpretes novos no banco de dados. Os dados antigos permanecem neste navegador como cópia de segurança.`;await loadEvents();await loadInterpreters();}catch(err){result.textContent='Falha na importação: '+err.message;}
  });
  loadEvents();
  loadInterpreters();
  renderContactMessages();
})();
