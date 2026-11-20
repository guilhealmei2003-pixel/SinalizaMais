<?php
require __DIR__.'/../bootstrap.php';
require_once __DIR__.'/../admin_auth.php';
$method=$_SERVER['REQUEST_METHOD']??'GET';
if($method==='GET'){
 $admin=($_GET['admin']??'')==='1';
 if($admin) sinalizaAdminExigirApi(false);
 $where=$admin?'':"WHERE status='publicado'";
 $stmt=$pdo->query("SELECT id,titulo,tipo,local_evento AS local,data_evento AS data,descricao,status,fonte,link,publicado_em FROM eventos_admin $where ORDER BY publicado_em DESC,id DESC");
 jsonResponse(['ok'=>true,'eventos'=>$stmt->fetchAll()]);
}
sinalizaAdminExigirApi(true);
if($method==='POST'){
 $d=body();requireFields($d,['titulo','tipo','local','data','descricao']);
 if(!preg_match('/^\d{4}-\d{2}-\d{2}$/',(string)$d['data'])) jsonResponse(['ok'=>false,'erro'=>'Data inválida'],422);
 $status=$d['status']??'publicado';
 if(!in_array($status,['publicado','rascunho','revisao','arquivado'],true)) jsonResponse(['ok'=>false,'erro'=>'Status inválido'],422);
 $link=trim((string)($d['link']??''));
 if($link && (!filter_var($link,FILTER_VALIDATE_URL)||!in_array(strtolower(parse_url($link,PHP_URL_SCHEME)),['http','https'],true))) jsonResponse(['ok'=>false,'erro'=>'Link inválido'],422);
 $stmt=$pdo->prepare('INSERT INTO eventos_admin(titulo,tipo,local_evento,data_evento,descricao,status,fonte,link) VALUES(?,?,?,?,?,?,?,?)');
 $stmt->execute([trim($d['titulo']),trim($d['tipo']),trim($d['local']),$d['data'],trim($d['descricao']),$status,trim((string)($d['fonte']??'')),$link]);
 jsonResponse(['ok'=>true,'id'=>(int)$pdo->lastInsertId()],201);
}
if($method==='DELETE'){
 $d=body();$id=filter_var($d['id']??null,FILTER_VALIDATE_INT);
 if(!$id)jsonResponse(['ok'=>false,'erro'=>'Identificador inválido'],422);
 $st=$pdo->prepare('DELETE FROM eventos_admin WHERE id=?');$st->execute([$id]);jsonResponse(['ok'=>true]);
}
jsonResponse(['ok'=>false,'erro'=>'Método não permitido'],405);
