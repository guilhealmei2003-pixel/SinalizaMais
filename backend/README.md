# Sinaliza+ — Backend preparado para evolução

Esta pasta é o estágio servidor do projeto. O protótipo atual continua funcionando com armazenamento local para a apresentação do TCC.

## Requisitos
- XAMPP/WAMP ou PHP 8+
- MySQL/MariaDB

## Instalação
1. Crie o banco executando `database/schema.sql` no phpMyAdmin.
2. Copie `backend/config.php` para `backend/config.local.php`.
3. Ajuste usuário e senha do MySQL.
4. Coloque o projeto em `htdocs`.
5. Teste `backend/api/health.php` pelo navegador.

## Segurança
A versão de produção deve usar HTTPS, sessão de servidor, CSRF, controle de acesso, rate limiting, validação no servidor e logs. Nunca coloque senha administrativa ou segredo de banco no JavaScript.


## Controle administrativo de intérpretes

O fluxo profissional prevê aprovação antes da publicação: novos intérpretes entram como `pendente`. O administrador deve revisar os dados e pode aprovar, reprovar, bloquear/desbloquear ou excluir cadastros. Senhas nunca devem ser exibidas ao administrador.

No protótipo HTML/JS, esse controle funciona localmente para demonstração da banca. Na versão com PHP/MySQL, o endpoint `api/interpretes_admin.php` representa as ações administrativas, mas **a autenticação/autorização do administrador deve ser implementada no servidor antes de produção** (sessão segura ou token, HTTPS, CSRF, rate limiting e logs).
