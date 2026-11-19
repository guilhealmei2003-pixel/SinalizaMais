<?php
declare(strict_types=1);
require_once __DIR__ . '/../backend/admin_auth.php';
sinalizaAdminHeaders();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit;
}
if (!sinalizaAdminAutenticado() || !sinalizaAdminCsrfValido($_POST['csrf'] ?? null)) {
    http_response_code(403);
    exit('Solicitação inválida.');
}
sinalizaAdminSair();
header('Location: /admin/', true, 303);
exit;
