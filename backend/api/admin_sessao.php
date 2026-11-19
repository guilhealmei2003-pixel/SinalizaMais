<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../admin_auth.php';
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    header('Allow: GET');
    jsonResponse(['ok'=>false, 'erro'=>'Utilize o acesso administrativo reservado.'], 405);
}
sinalizaAdminHeaders();
jsonResponse(['ok'=>true, 'autenticado'=>sinalizaAdminAutenticado()]);
