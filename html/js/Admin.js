(() => {
  // O PHP protege /admin/painel.php. Nunca confiar no localStorage para autorizar acesso.
  const EVENTS = 'sinaliza_eventos_admin_v1';
  const csrf = document.querySelector('meta[name="admin-csrf-token"]')?.content || '';

  const read = () => { try { const v = JSON.parse(localStorage.getItem(EVENTS) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
  const save = v => localStorage.setItem(EVENTS, JSON.stringify(v));
  const safeUrl = value => { try { const u = new URL(String(value), window.location.href); return ['http:', 'https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const formatDate = value => { if (!value) return ''; const [y,m,d] = value.split('-'); return `${d}/${m}/${y}`; };

  const render = () => {
    const box = document.getElementById('admin-eventos'); if (!box) return;
    const items = read();
    if (!items.length) { box.innerHTML = '<p class="lista-vazia">Nenhuma publicação criada pela administração.</p>'; return; }
    box.innerHTML = items.map((item, index) => `<article class="perfil-interprete"><div><h3>${escape(item.titulo)}</h3><p><strong>${escape(item.tipo)}</strong> · ${escape(item.local)} · ${formatDate(item.data)}</p><p><strong>Status:</strong> ${escape(item.status || 'publicado')}</p><p>${escape(item.descricao)}</p>${item.fonte ? `<p><strong>Fonte:</strong> ${escape(item.fonte)}</p>` : ''}${safeUrl(item.link) ? `<p><a href="${escape(safeUrl(item.link))}" target="_blank" rel="noopener noreferrer">Link de informações ↗</a></p>` : ''}</div><div class="contato-interprete"><button class="botao" type="button" data-delete="${index}">Excluir</button></div></article>`).join('');
    box.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => { const list = read(); list.splice(Number(btn.dataset.delete), 1); save(list); render(); }));
  };

  const form = document.getElementById('form-evento-admin');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const item = { titulo: document.getElementById('evento-titulo').value.trim(), tipo: document.getElementById('evento-tipo').value, local: document.getElementById('evento-local').value.trim(), data: document.getElementById('evento-data').value, descricao: document.getElementById('evento-descricao').value.trim(), status: document.getElementById('evento-status')?.value || 'publicado', fonte: document.getElementById('evento-fonte')?.value.trim() || '', link: safeUrl(document.getElementById('evento-link').value.trim()), publicado_em: new Date().toISOString() };
    if (!item.titulo || !item.local || !item.data || !item.descricao) { document.getElementById('mensagem-admin-evento').textContent = 'Preencha título, local, data e descrição.'; return; }
    const rawLink = document.getElementById('evento-link').value.trim();
    if (rawLink && !item.link) { document.getElementById('mensagem-admin-evento').textContent = 'O link deve começar com http:// ou https://.'; return; }
    const list = read(); list.unshift(item); save(list); form.reset(); const out = document.getElementById('mensagem-admin-evento'); out.textContent = 'Publicação adicionada com sucesso.'; out.className = 'mensagem-interprete sucesso'; render();
  });

  const INTERPRETERS = 'sinaliza_interpretes_v1';
  const readInterpreters = () => { try { const v = JSON.parse(localStorage.getItem(INTERPRETERS) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
  const saveInterpreters = v => localStorage.setItem(INTERPRETERS, JSON.stringify(v));
  const normalizeInterpreterStatus = item => { if (!item.status) item.status = item.ativo === false ? 'bloqueado' : 'aprovado'; return item; };
  const statusLabel = status => ({pendente:'Pendente', aprovado:'Aprovado', reprovado:'Reprovado', bloqueado:'Bloqueado'}[status] || status);
  const renderInterpreters = () => {
    const box = document.getElementById('admin-interpretes'); if (!box) return;
    const list = readInterpreters().map(normalizeInterpreterStatus);
    saveInterpreters(list);
    if (!list.length) { box.innerHTML = '<p class="lista-vazia">Nenhum intérprete cadastrado.</p>'; return; }
    box.innerHTML = list.map((item,index) => {
      const status = item.status || 'pendente';
      const disabled = status === 'bloqueado';
      return `<article class="perfil-interprete" data-interprete-index="${index}">
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
    box.querySelectorAll('[data-interp-action]').forEach(btn => btn.addEventListener('click', () => {
      const article = btn.closest('[data-interprete-index]'); const index = Number(article.dataset.interpreteIndex); const action = btn.dataset.interpAction;
      const list = readInterpreters(); const item = list[index]; if (!item) return;
      if (action === 'excluir') { if (!confirm(`Excluir permanentemente o cadastro de ${item.nome}?`)) return; list.splice(index,1); saveInterpreters(list); renderInterpreters(); return; }
      if (action === 'aprovar') { item.status='aprovado'; item.ativo=true; item.motivo_status=''; item.status_atualizado_em=new Date().toISOString(); saveInterpreters(list); renderInterpreters(); return; }
      if (action === 'reprovar') { const motivo=prompt('Informe o motivo da reprovação:','Cadastro precisa de validação dos dados profissionais.'); if (motivo===null) return; item.status='reprovado'; item.ativo=false; item.motivo_status=motivo.trim() || 'Cadastro recusado pela administração.'; item.status_atualizado_em=new Date().toISOString(); saveInterpreters(list); renderInterpreters(); return; }
      if (action === 'bloquear') { const motivo=prompt('Motivo do bloqueio:','Acesso bloqueado pela administração para análise de segurança.'); if (motivo===null) return; item.status='bloqueado'; item.ativo=false; item.motivo_status=motivo.trim() || 'Acesso bloqueado pela administração.'; item.status_atualizado_em=new Date().toISOString(); saveInterpreters(list); renderInterpreters(); return; }
      if (action === 'desbloquear') { item.status='aprovado'; item.ativo=true; item.motivo_status=''; item.status_atualizado_em=new Date().toISOString(); saveInterpreters(list); renderInterpreters(); return; }
      if (action === 'editar') {
        const modal=document.getElementById('modal-editar-interprete'); if(!modal)return;
        document.getElementById('edit-interprete-index').value=String(index);
        document.getElementById('edit-interprete-nome').value=item.nome||'';
        document.getElementById('edit-interprete-email').value=item.email||'';
        document.getElementById('edit-interprete-telefone').value=item.telefone||'';
        document.getElementById('edit-interprete-cidade').value=item.cidade||'';
        document.getElementById('edit-interprete-atuacao').value=item.atuacao||'';
        document.getElementById('edit-interprete-certificacao').value=item.certificacao||'';
        document.getElementById('edit-interprete-modalidade').value=item.modalidade||'Presencial';
        document.getElementById('edit-interprete-disponibilidade').value=item.disponibilidade||'';
        document.getElementById('mensagem-editar-interprete').textContent=''; modal.hidden=false; document.body.style.overflow='hidden'; document.getElementById('edit-interprete-nome').focus();
      }
    }));
  };

  const editModal=document.getElementById('modal-editar-interprete');
  const closeEdit=()=>{if(editModal){editModal.hidden=true;document.body.style.overflow='';}};
  document.getElementById('fechar-edicao-interprete')?.addEventListener('click',closeEdit);
  document.getElementById('cancelar-edicao-interprete')?.addEventListener('click',closeEdit);
  editModal?.addEventListener('click',e=>{if(e.target===editModal)closeEdit();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&editModal&&!editModal.hidden)closeEdit();});
  document.getElementById('form-editar-interprete')?.addEventListener('submit',e=>{
    e.preventDefault(); const index=Number(document.getElementById('edit-interprete-index').value); const list=readInterpreters(); const item=list[index]; if(!item)return;
    item.nome=document.getElementById('edit-interprete-nome').value.trim(); item.email=document.getElementById('edit-interprete-email').value.trim(); item.telefone=document.getElementById('edit-interprete-telefone').value.trim(); item.cidade=document.getElementById('edit-interprete-cidade').value.trim(); item.atuacao=document.getElementById('edit-interprete-atuacao').value.trim(); item.certificacao=document.getElementById('edit-interprete-certificacao').value.trim(); item.modalidade=document.getElementById('edit-interprete-modalidade').value; item.disponibilidade=document.getElementById('edit-interprete-disponibilidade').value.trim();
    saveInterpreters(list); renderInterpreters(); document.getElementById('mensagem-editar-interprete').textContent='Alterações salvas com sucesso.'; closeEdit();
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

  render();
  renderInterpreters();
  renderContactMessages();
})();
