<?php
require __DIR__.'/../bootstrap.php';require_once __DIR__.'/../admin_auth.php';
$method=$_SERVER['REQUEST_METHOD']??'GET';
sinalizaAdminExigirApi($method!=='GET');
if($method==='GET'){
 $st=$pdo->query('SELECT id,nome,email,telefone,cidade,atuacao,disponibilidade,certificacao,modalidade,COALESCE(foto_data,foto_url) AS foto_url,ativo,status,motivo_status,criado_em,atualizado_em AS status_atualizado_em FROM interpretes ORDER BY criado_em DESC');
 jsonResponse(['ok'=>true,'interpretes'=>$st->fetchAll()]);
}
$d=body();$id=filter_var($d['id']??null,FILTER_VALIDATE_INT);if(!$id)jsonResponse(['ok'=>false,'erro'=>'ID inválido'],422);
if($method==='DELETE'){$st=$pdo->prepare('DELETE FROM interpretes WHERE id=?');$st->execute([$id]);jsonResponse(['ok'=>true]);}
if($method==='PATCH'){
 if(isset($d['status'])){
  if(!in_array($d['status'],['pendente','aprovado','reprovado','bloqueado'],true))jsonResponse(['ok'=>false,'erro'=>'Status inválido'],422);
  $st=$pdo->prepare('UPDATE interpretes SET status=?,ativo=?,motivo_status=? WHERE id=?');$st->execute([$d['status'],$d['status']==='aprovado'?1:0,trim((string)($d['motivo_status']??'')),$id]);
 }else{
  requireFields($d,['nome','email','telefone','cidade','atuacao','disponibilidade']);
  if(!filter_var($d['email'],FILTER_VALIDATE_EMAIL))jsonResponse(['ok'=>false,'erro'=>'E-mail inválido'],422);
  $st=$pdo->prepare('UPDATE interpretes SET nome=?,email=?,telefone=?,cidade=?,atuacao=?,certificacao=?,modalidade=?,disponibilidade=? WHERE id=?');
  try{$st->execute([trim($d['nome']),strtolower(trim($d['email'])),trim($d['telefone']),trim($d['cidade']),trim($d['atuacao']),trim((string)($d['certificacao']??'')),$d['modalidade']??'Presencial',trim($d['disponibilidade']),$id]);}catch(PDOException $e){if(($e->errorInfo[1]??null)==1062)jsonResponse(['ok'=>false,'erro'=>'E-mail já utilizado'],409);throw $e;}
 }
 jsonResponse(['ok'=>true]);
}
jsonResponse(['ok'=>false,'erro'=>'Método não permitido'],405);
