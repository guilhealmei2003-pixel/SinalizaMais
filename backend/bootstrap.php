<?php
declare(strict_types=1);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
function jsonResponse(array $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
set_exception_handler(function(Throwable $e): void {
    error_log('Sinaliza+ API: ' . $e->getMessage());
    jsonResponse(['ok'=>false,'erro'=>'Erro interno no servidor.'], 500);
});
$configFile = __DIR__ . '/config.local.php';
if (!is_file($configFile)) jsonResponse(['ok'=>false,'erro'=>'Configuração MySQL não encontrada.'], 500);
$config = require $configFile;
try {
    $pdo = new PDO(
        "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4",
        $config['db_user'], $config['db_pass'],
        [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES=>false]
    );
} catch(Throwable $e) {
    error_log('Sinaliza+ MySQL: ' . $e->getMessage());
    jsonResponse(['ok'=>false,'erro'=>'Não foi possível conectar ao MySQL.'], 500);
}
function body(): array {
    $raw = file_get_contents('php://input');
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
        $data = json_decode($raw, true);
        if (!is_array($data)) jsonResponse(['ok'=>false,'erro'=>'JSON inválido.'], 400);
        return $data;
    }
    return $_POST;
}
function requireFields(array $data, array $fields): void {
    foreach ($fields as $f) {
        if (!isset($data[$f]) || !is_scalar($data[$f]) || trim((string)$data[$f]) === '') {
            jsonResponse(['ok'=>false,'erro'=>"Campo obrigatório: {$f}"], 422);
        }
    }
}
