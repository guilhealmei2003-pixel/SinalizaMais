<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../admin_auth.php';

// Endpoint de administração: sessão PHP e token CSRF obrigatórios.
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    jsonResponse(['ok'=>false,'erro'=>'Método não permitido.'],405);
}
sinalizaAdminExigirApi(true);
$body = body();
$id = filter_var($body['id'] ?? null, FILTER_VALIDATE_INT);
if (!$id) jsonResponse(['ok'=>false,'erro'=>'ID do intérprete inválido.'],422);

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $stmt=$pdo->prepare('DELETE FROM interpretes WHERE id=?');
    $stmt->execute([$id]);
    jsonResponse(['ok'=>$stmt->rowCount()>0]);
}

$status=$body['status'] ?? null;
$allowed=['pendente','aprovado','reprovado','bloqueado'];
if (!in_array($status,$allowed,true)) jsonResponse(['ok'=>false,'erro'=>'Status inválido.'],422);
$ativo = $status === 'aprovado' ? 1 : 0;
$motivo = trim((string)($body['motivo_status'] ?? ''));
$stmt=$pdo->prepare('UPDATE interpretes SET status=?, ativo=?, motivo_status=? WHERE id=?');
$stmt->execute([$status,$ativo,$motivo ?: null,$id]);
jsonResponse(['ok'=>true,'id'=>$id,'status'=>$status,'ativo'=>$ativo]);
