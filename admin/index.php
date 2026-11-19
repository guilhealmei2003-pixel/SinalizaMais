<?php
declare(strict_types=1);
require_once __DIR__ . '/../backend/admin_auth.php';
sinalizaAdminHeaders();
if (sinalizaAdminAutenticado()) {
    header('Location: /admin/painel.php', true, 302);
    exit;
}
$erro = '';
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    if (!sinalizaAdminCsrfValido($_POST['csrf'] ?? null)) {
        $erro = 'Sessão expirada. Atualize a página e tente novamente.';
    } elseif (sinalizaAdminLogar((string)($_POST['email'] ?? ''), (string)($_POST['senha'] ?? ''))) {
        header('Location: /admin/painel.php', true, 303);
        exit;
    } else {
        $erro = 'E-mail ou senha incorretos, ou acesso temporariamente bloqueado.';
    }
}
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Área Administrativa | Sinaliza+</title><link rel="shortcut icon" href="../html/ico/Sinaliza+.png" type="image/png"><link rel="stylesheet" href="../html/css/Conteudo.css"><link rel="stylesheet" href="../html/css/Acessibilidade.css"></head>
<body>
<header class="pagina-topo"><a class="voltar" href="../html/Sinaliza.html">← Voltar ao início</a><span class="selo">ACESSO RESTRITO</span><h1>Área Administrativa</h1><p>Gerenciamento de conteúdos, eventos, shows e atualizações do Sinaliza+.</p></header>
<main class="conteudo"><section class="referencia"><h2>Login administrativo</h2><p>Esta área é exclusiva para administradores autorizados a atualizar a plataforma.</p><form id="form-admin-login" class="form-interprete" method="post" action="/admin/">
<input type="hidden" name="csrf" value="<?= htmlspecialchars(sinalizaAdminCsrf(), ENT_QUOTES, 'UTF-8') ?>"><label for="admin-email">E-mail administrativo</label><input id="admin-email" name="email" type="email" autocomplete="username" placeholder="E-mail autorizado" required><label for="admin-senha">Senha</label><div class="campo-senha"><input id="admin-senha" name="senha" type="password" autocomplete="current-password" placeholder="Senha administrativa" required><button class="mostrar-senha" type="button" data-toggle-password="admin-senha">Mostrar</button></div><button class="botao" type="submit">Entrar na administração</button><p class="mensagem-interprete <?= $erro !== '' ? 'erro' : '' ?>" id="mensagem-admin" role="status" aria-live="polite"><?= htmlspecialchars($erro, ENT_QUOTES, 'UTF-8') ?></p></form></section><section class="referencia"><h2>Acesso exclusivo</h2><p>Área destinada à equipe responsável pelo gerenciamento e atualização das informações publicadas no Sinaliza+.</p><p>O acesso é protegido por credenciais administrativas e permite organizar eventos, shows, cursos, palestras e outras atualizações da plataforma.</p></section></main>
<footer class="rodape">Sinaliza+ <span>Área administrativa restrita.</span></footer><script src="../html/js/Acessibilidade.js"></script><script src="../html/js/AdminLogin.js"></script>
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
