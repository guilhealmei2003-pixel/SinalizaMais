<?php
require __DIR__.'/../bootstrap.php';
require_once __DIR__.'/../admin_auth.php';
if($_SERVER['REQUEST_METHOD']==='GET'){
 $stmt=$pdo->query("SELECT id,titulo,tipo,descricao,local_evento,data_evento,fonte,url_fonte,status,criado_em,atualizado_em FROM conteudos WHERE status='publicado' ORDER BY COALESCE(data_evento,DATE(criado_em)) DESC");
 jsonResponse(['ok'=>true,'conteudos'=>$stmt->fetchAll()]);
}
if($_SERVER['REQUEST_METHOD']==='POST'){
 sinalizaAdminExigirApi(true);
 $data=body(); requireFields($data,['titulo','tipo','descricao']);
 $allowed=['noticia','curso','emprego','evento','atualizacao']; if(!in_array($data['tipo'],$allowed,true)) jsonResponse(['ok'=>false,'erro'=>'Tipo inválido'],422);
 $status=in_array($data['status']??'rascunho',['rascunho','revisao','publicado','arquivado'],true)?$data['status']:'rascunho';
 $stmt=$pdo->prepare('INSERT INTO conteudos(titulo,tipo,descricao,local_evento,data_evento,fonte,url_fonte,status) VALUES(?,?,?,?,?,?,?,?)');
 $stmt->execute([trim($data['titulo']),$data['tipo'],trim($data['descricao']),$data['local_evento']??null,$data['data_evento']??null,$data['fonte']??null,$data['url_fonte']??null,$status]);
 jsonResponse(['ok'=>true,'id'=>(int)$pdo->lastInsertId()],201);
}
jsonResponse(['ok'=>false,'erro'=>'Método não permitido'],405);
