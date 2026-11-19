// Formulário público de contato e confirmação clara após o envio.
(() => {
  const modal = document.getElementById('modal-contato');
  const abrir = document.getElementById('abrir-form-contato');
  const fechar = document.getElementById('fechar-form-contato');
  const form = document.getElementById('form-contato-publico');
  const status = document.getElementById('status-contato');
  if (!modal || !abrir || !fechar || !form || !status) return;

  const botaoEnviar = form.querySelector('[type="submit"]');
  const informar = (mensagem, estado) => {
    status.textContent = mensagem;
    status.dataset.estado = estado;
    status.setAttribute('role', estado === 'erro' ? 'alert' : 'status');
    if (estado !== 'enviando') {
      status.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      status.focus({ preventScroll: true });
    }
  };
  const mostrar = () => {
    status.textContent = '';
    delete status.dataset.estado;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('contato-nome').focus();
  };
  const ocultar = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
    abrir.focus();
  };
  abrir.addEventListener('click', mostrar);
  fechar.addEventListener('click', ocultar);
  modal.addEventListener('click', event => { if (event.target === modal) ocultar(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) ocultar(); });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (botaoEnviar.disabled) return;
    informar('Enviando sua mensagem…', 'enviando');
    botaoEnviar.disabled = true;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch('../backend/api/contato.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let resultado;
      try {
        resultado = await response.json();
      } catch (_) {
        throw new Error('O servidor não retornou uma resposta válida. Tente novamente mais tarde.');
      }
      if (!response.ok || !resultado.ok) {
        throw new Error((resultado && resultado.erro) || 'Não foi possível enviar sua mensagem.');
      }
      form.reset();
      informar('✓ Mensagem enviada com sucesso! A equipe do Sinaliza+ recebeu sua mensagem.', 'sucesso');
    } catch (erro) {
      informar((erro && erro.message) || 'Não foi possível enviar sua mensagem. Tente novamente.', 'erro');
    } finally {
      botaoEnviar.disabled = false;
    }
  });
})();
