<?php
declare(strict_types=1);
require_once __DIR__ . '/../backend/admin_auth.php';
sinalizaAdminExigirPagina();
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="admin-csrf-token" content="<?= htmlspecialchars(sinalizaAdminCsrf(), ENT_QUOTES, 'UTF-8') ?>"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Painel Administrativo | Sinaliza+</title><link rel="shortcut icon" href="../html/ico/Sinaliza+.png" type="image/png"><link rel="stylesheet" href="../html/css/Conteudo.css"><link rel="stylesheet" href="../html/css/Acessibilidade.css"></head>
<body>
<header class="pagina-topo"><a class="voltar" href="../html/Sinaliza.html">← Site público</a><span class="selo">PAINEL ADMINISTRATIVO</span><h1>Gerenciar Sinaliza+</h1><p>Cadastre e organize eventos, shows, palestras e outras atualizações.</p></header>
<aside class="admin-sidebar" aria-label="Navegação administrativa">
  <div class="admin-sidebar-brand">Sinaliza+<small>Painel de gestão</small></div>
  <a href="#topo-admin">Visão geral</a><a href="#form-evento-admin">Publicar conteúdo</a><a href="#gestao-interpretes">Intérpretes</a><a href="#mensagens-contato">Mensagens recebidas</a><a href="#admin-eventos">Conteúdos publicados</a><a href="../html/Eventos.html">Ver página de eventos</a><a href="../html/Noticias.html">Ver notícias</a><a href="../html/Direitos.html">Ver direitos</a><a href="../html/CentralLibrasPG.html">Ver Central de Libras de Praia Grande – SP</a><a href="../html/Interpretes.html">Ver intérpretes</a><a href="../html/ConectarInterprete.html">Ver conexão com intérpretes</a><a href="../html/Sinaliza.html">Voltar ao site ↗</a>
</aside>
<main class="conteudo admin-com-sidebar" id="topo-admin">
<section class="destaque"><span class="numero">01</span><div><h2>Bem-vindo à administração</h2><p>O administrador pode publicar informações para a comunidade sem exigir cadastro do usuário surdo.</p><form action="/admin/sair.php" method="post" class="admin-form-sair"><input type="hidden" name="csrf" value="<?= htmlspecialchars(sinalizaAdminCsrf(), ENT_QUOTES, 'UTF-8') ?>"><button class="botao" id="sair-admin" type="submit">Desconectar da administração</button></form></div></section>
<section class="referencia"><h2>Adicionar evento ou atualização</h2><form id="form-evento-admin" class="form-interprete"><label for="evento-titulo">Título</label><input id="evento-titulo" required placeholder="Ex.: Show acessível com intérprete de Libras"><label for="evento-tipo">Tipo</label><select id="evento-tipo" required><option value="Evento">Evento</option><option value="Show">Show</option><option value="Palestra">Palestra</option><option value="Curso">Curso</option><option value="Atualização">Atualização</option></select><label for="evento-local">Local</label><input id="evento-local" required placeholder="Local ou endereço"><label for="evento-data">Data</label><input id="evento-data" type="date" required><label for="evento-descricao">Descrição</label><textarea id="evento-descricao" rows="4" required placeholder="Explique o evento e os recursos de acessibilidade."></textarea><label for="evento-status">Status da publicação</label><select id="evento-status"><option value="publicado">Publicado</option><option value="revisao">Em revisão</option><option value="rascunho">Rascunho</option><option value="arquivado">Arquivado</option></select><label for="evento-fonte">Fonte da informação (opcional)</label><input id="evento-fonte" placeholder="Ex.: Prefeitura, Planalto, instituição responsável"><label for="evento-link">Link de inscrição/informações (opcional)</label><input id="evento-link" type="url" placeholder="https://..."><button class="botao" type="submit">Publicar no Sinaliza+</button><p class="mensagem-interprete" id="mensagem-admin-evento" role="status" aria-live="polite"></p></form></section>
<section class="referencia" id="mensagens-contato"><h2>Mensagens recebidas — Fale conosco</h2><p>Mensagens enviadas pelo formulário de contato do site.</p><div id="admin-mensagens-contato" class="lista-interpretes"><p class="lista-vazia">Carregando mensagens…</p></div></section>
<section class="referencia"><h2>Trazer cadastros antigos deste navegador</h2><p>Se você já tinha eventos ou intérpretes salvos neste navegador antes da atualização, use este botão uma vez para copiá-los para o MySQL. Os registros já existentes no banco não serão duplicados.</p><button class="botao botao-claro" type="button" id="importar-local">Importar dados antigos deste navegador</button><p id="mensagem-importar-local" role="status" aria-live="polite"></p></section>
<section class="referencia" id="gestao-interpretes">
<h2>Controle de intérpretes cadastrados</h2>
<p>Área restrita para análise de segurança. O administrador pode visualizar os cadastros, aprovar, reprovar, bloquear/desbloquear e corrigir dados profissionais. Senhas nunca são exibidas.</p>
<div id="admin-interpretes" class="lista-interpretes"></div>
</section>
<section class="referencia"><h2>Conteúdos publicados</h2><div id="admin-eventos" class="lista-interpretes"></div></section>

</main>
<div class="admin-modal" id="modal-editar-interprete" hidden role="dialog" aria-modal="true" aria-labelledby="titulo-editar-interprete">
  <div class="admin-modal-conteudo"><button type="button" id="fechar-edicao-interprete" class="admin-modal-fechar" aria-label="Fechar">×</button><h2 id="titulo-editar-interprete">Editar cadastro de intérprete</h2><p>Atualize os dados profissionais no formulário abaixo.</p>
    <form id="form-editar-interprete" class="form-interprete">
      <input type="hidden" id="edit-interprete-index">
      <label for="edit-interprete-nome">Nome completo</label><input id="edit-interprete-nome" required maxlength="120">
      <label for="edit-interprete-email">E-mail</label><input id="edit-interprete-email" type="email" required maxlength="190">
      <label for="edit-interprete-telefone">Telefone</label><input id="edit-interprete-telefone" required maxlength="30">
      <label for="edit-interprete-cidade">Cidade/região</label><input id="edit-interprete-cidade" required maxlength="120">
      <label for="edit-interprete-atuacao">Área de atuação</label><input id="edit-interprete-atuacao" required maxlength="255">
      <label for="edit-interprete-certificacao">Formação/certificação</label><input id="edit-interprete-certificacao" maxlength="255">
      <label for="edit-interprete-modalidade">Modalidade</label><select id="edit-interprete-modalidade"><option>Presencial</option><option>Online</option><option>Presencial e online</option></select>
      <label for="edit-interprete-disponibilidade">Disponibilidade</label><input id="edit-interprete-disponibilidade" maxlength="255">
      <div class="admin-modal-acoes"><button type="button" class="botao botao-claro" id="cancelar-edicao-interprete">Cancelar</button><button type="submit" class="botao">Salvar alterações</button></div><p id="mensagem-editar-interprete" role="status"></p>
    </form>
  </div>
</div>
<footer class="rodape">Sinaliza+ <span>Administração de conteúdo.</span></footer><script src="../html/js/Acessibilidade.js"></script><script src="../html/js/Admin.js"></script>
    <!-- VLibras global: disponível em todas as telas do Sinaliza+ -->
    <div vw class="enabled" aria-label="VLibras - tradução para Libras">
        <div vw-access-button class="active"></div>
        <div vw-plugin-wrapper>
            <div class="vw-plugin-top-wrapper"></div>
        </div>
    </div>
    <script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
    <script>window.addEventListener('load', function(){ if (window.VLibras) new window.VLibras.Widget('https://vlibras.gov.br/app'); });</script>
</body></html>
