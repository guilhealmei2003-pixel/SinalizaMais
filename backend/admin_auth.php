<?php
/**
 * Sessão e controle de acesso exclusivos da equipe Sinaliza+.
 * Carregado apenas no servidor. Não incluir este arquivo em JavaScript ou HTML público.
 */
declare(strict_types=1);

define('SINALIZA_ADMIN_EMAIL', getenv('SINALIZA_ADMIN_EMAIL') ?: '');
// Hash SHA-256 herdado da versão original; a senha original continua válida.
// Recomenda-se trocar por password_hash() ao definir novas credenciais.
define('SINALIZA_ADMIN_LEGACY_HASH', getenv('SINALIZA_ADMIN_LEGACY_HASH') ?: '');

function sinalizaAdminSession(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    $https = (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off')
        || (($_SERVER['SERVER_PORT'] ?? null) === '443');
    session_name('SINALIZA_ADMINSESSID');
    session_set_cookie_params([
        'lifetime' => 0, 'path' => '/', 'secure' => $https,
        'httponly' => true, 'samesite' => 'Lax',
    ]);
    session_start();
}

function sinalizaAdminAutenticado(): bool {
    sinalizaAdminSession();
    return ($_SESSION['sinaliza_admin_autenticado'] ?? false) === true;
}

function sinalizaAdminCsrf(): string {
    sinalizaAdminSession();
    if (empty($_SESSION['sinaliza_admin_csrf'])) {
        $_SESSION['sinaliza_admin_csrf'] = bin2hex(random_bytes(32));
    }
    return (string)$_SESSION['sinaliza_admin_csrf'];
}

function sinalizaAdminCsrfValido(?string $token): bool {
    return is_string($token) && hash_equals(sinalizaAdminCsrf(), $token);
}

function sinalizaAdminLogar(string $email, string $senha): bool {
    sinalizaAdminSession();
    $agora = time();
    if (($_SESSION['sinaliza_admin_bloqueado_ate'] ?? 0) > $agora) return false;
    $emailOk = hash_equals(SINALIZA_ADMIN_EMAIL, strtolower(trim($email)));
    $senhaOk = hash_equals(SINALIZA_ADMIN_LEGACY_HASH, hash('sha256', $senha));
    if (!$emailOk || !$senhaOk) {
        $_SESSION['sinaliza_admin_erros'] = (int)($_SESSION['sinaliza_admin_erros'] ?? 0) + 1;
        if ($_SESSION['sinaliza_admin_erros'] >= 5) {
            $_SESSION['sinaliza_admin_bloqueado_ate'] = $agora + 15 * 60;
            $_SESSION['sinaliza_admin_erros'] = 0;
        }
        return false;
    }
    session_regenerate_id(true);
    $_SESSION['sinaliza_admin_autenticado'] = true;
    unset($_SESSION['sinaliza_admin_erros'], $_SESSION['sinaliza_admin_bloqueado_ate']);
    $_SESSION['sinaliza_admin_csrf'] = bin2hex(random_bytes(32));
    return true;
}

function sinalizaAdminSair(): void {
    sinalizaAdminSession();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 42000, 'path' => $params['path'],
            'domain' => $params['domain'], 'secure' => $params['secure'],
            'httponly' => $params['httponly'], 'samesite' => $params['samesite'] ?? 'Lax',
        ]);
    }
    session_destroy();
}

function sinalizaAdminHeaders(): void {
    header('Cache-Control: private, no-store, max-age=0');
    header('Pragma: no-cache');
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: same-origin');
}

function sinalizaAdminExigirPagina(): void {
    sinalizaAdminHeaders();
    if (!sinalizaAdminAutenticado()) {
        header('Location: /admin/', true, 302);
        exit;
    }
}

function sinalizaAdminExigirApi(bool $mutacao = false): void {
    if (!sinalizaAdminAutenticado()) {
        jsonResponse(['ok'=>false, 'erro'=>'Acesso administrativo necessário.'], 401);
    }
    if ($mutacao && !sinalizaAdminCsrfValido($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null)) {
        jsonResponse(['ok'=>false, 'erro'=>'Verificação de segurança inválida. Atualize a página e tente novamente.'], 403);
    }
}
