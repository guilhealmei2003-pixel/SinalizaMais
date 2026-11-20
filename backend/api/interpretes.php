<?php
require __DIR__.'/../bootstrap.php';
require_once __DIR__.'/../interprete_auth.php';
$method=$_SERVER['REQUEST_METHOD']??'GET';
if($method==='GET'){
 $st=$pdo->query("SELECT id,nome,email,telefone,cidade,atuacao,disponibilidade,certificacao,modalidade,COALESCE(foto_data,foto_url) AS foto_url,ativo,status FROM interpretes WHERE ativo=1 AND status='aprovado' ORDER BY nome");
 jsonResponse(['ok'=>true,'interpretes'=>$st->fetchAll()]);
}
if($method==='POST'){
 interpreteMesmoSite();$d=body();requireFields($d,['nome','email','senha','telefone','cidade','atuacao','disponibilidade']);
 $email=strtolower(trim($d['email']));if(!filter_var($email,FILTER_VALIDATE_EMAIL))jsonResponse(['ok'=>false,'erro'=>'E-mail inválido'],422);
 if(strlen($d['senha'])<8)jsonResponse(['ok'=>false,'erro'=>'A senha precisa ter pelo menos 8 caracteres'],422);
 $foto=interpreteFoto($d['foto_url']??null);
 try{
  $st=$pdo->prepare("INSERT INTO interpretes(nome,email,senha_hash,telefone,cidade,atuacao,disponibilidade,certificacao,modalidade,foto_data,status,ativo) VALUES(?,?,?,?,?,?,?,?,?,?,'pendente',0)");
  $st->execute([trim($d['nome']),$email,password_hash($d['senha'],PASSWORD_DEFAULT),trim($d['telefone']),trim($d['cidade']),trim($d['atuacao']),trim($d['disponibilidade']),trim((string)($d['certificacao']??'')),$d['modalidade']??'Presencial',$foto]);
  jsonResponse(['ok'=>true,'id'=>(int)$pdo->lastInsertId()],201);
 }catch(PDOException $e){if(($e->errorInfo[1]??null)==1062)jsonResponse(['ok'=>false,'erro'=>'E-mail já cadastrado'],409);throw $e;}
}
jsonResponse(['ok'=>false,'erro'=>'Método não permitido'],405);
