<?php
declare(strict_types=1);

// API de contato do Sinaliza+.
// Este arquivo deve ficar em /htdocs/backend/api/contato.php.
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../admin_auth.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    if ($method === 'POST') {
        $data = body();
        requireFields($data, ['nome', 'email', 'assunto', 'mensagem']);

        $nome = trim((string) $data['nome']);
        $email = trim((string) $data['email']);
        $assunto = trim((string) $data['assunto']);
        $mensagem = trim((string) $data['mensagem']);

        if (mb_strlen($nome) > 120 || mb_strlen($email) > 190 ||
            mb_strlen($assunto) > 120 || mb_strlen($mensagem) > 5000) {
            jsonResponse(['ok' => false, 'erro' => 'Um ou mais campos ultrapassaram o limite permitido.'], 422);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['ok' => false, 'erro' => 'Informe um e-mail válido.'], 422);
        }

        $stmt = $pdo->prepare(
            "INSERT INTO mensagens_contato (nome, email, assunto, mensagem, status)
             VALUES (?, ?, ?, ?, 'nova')"
        );
        $stmt->execute([$nome, $email, $assunto, $mensagem]);
        jsonResponse(['ok' => true, 'mensagem' => 'Mensagem enviada com sucesso.'], 201);
    }

    // Consultas e alterações exigem sessão administrativa autenticada.
    if ($method === 'GET' || $method === 'PATCH') {
        sinalizaAdminExigirApi($method === 'PATCH');
    }

    if ($method === 'GET') {
        $stmt = $pdo->query(
            'SELECT id, nome, email, assunto, mensagem, status, criado_em
             FROM mensagens_contato ORDER BY criado_em DESC LIMIT 300'
        );
        jsonResponse(['ok' => true, 'mensagens' => $stmt->fetchAll()]);
    }

    if ($method === 'PATCH') {
        $data = body();
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        $status = $data['status'] ?? '';
        if (!$id || !in_array($status, ['nova', 'lida', 'respondida', 'arquivada'], true)) {
            jsonResponse(['ok' => false, 'erro' => 'Dados inválidos.'], 422);
        }
        $stmt = $pdo->prepare('UPDATE mensagens_contato SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);
        jsonResponse(['ok' => true, 'mensagem' => 'Status atualizado com sucesso.']);
    }

    jsonResponse(['ok' => false, 'erro' => 'Método não permitido.'], 405);
} catch (Throwable $e) {
    // Não revelar senhas, SQL ou detalhes internos ao navegador.
    error_log('Sinaliza+ contato.php: ' . $e->getMessage());
    jsonResponse(['ok' => false, 'erro' => 'Não foi possível processar a solicitação. Tente novamente.'], 500);
}
