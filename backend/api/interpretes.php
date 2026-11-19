<?php
require __DIR__.'/../bootstrap.php';
$data=body();
if($_SERVER['REQUEST_METHOD']==='POST'){
 requireFields($data,['nome','email','senha','telefone','cidade','atuacao','disponibilidade']);
 $email=strtolower(trim($data['email']));
 if(!filter_var($email,FILTER_VALIDATE_EMAIL)) jsonResponse(['ok'=>false,'erro'=>'E-mail inválido'],422);
 if(strlen((string)$data['senha'])<8) jsonResponse(['ok'=>false,'erro'=>'A senha precisa ter pelo menos 8 caracteres'],422);
 try{
  $stmt=$pdo->prepare('INSERT INTO interpretes(nome,email,senha_hash,telefone,cidade,atuacao,disponibilidade,certificacao,modalidade,foto_url) VALUES(?,?,?,?,?,?,?,?,?,?)');
  $stmt->execute([trim($data['nome']),$email,password_hash($data['senha'],PASSWORD_DEFAULT),trim($data['telefone']),trim($data['cidade']),trim($data['atuacao']),trim($data['disponibilidade']),$data['certificacao']??null,$data['modalidade']??'Presencial',$data['foto_url']??null]);
  jsonResponse(['ok'=>true,'id'=>(int)$pdo->lastInsertId()],201);
 }catch(PDOException $e){ if((int)$e->errorInfo[1]===1062) jsonResponse(['ok'=>false,'erro'=>'E-mail já cadastrado'],409); jsonResponse(['ok'=>false,'erro'=>'Não foi possível cadastrar intérprete'],500); }
}
if($_SERVER['REQUEST_METHOD']==='GET'){
 $stmt=$pdo->query("SELECT id,nome,email,telefone,cidade,atuacao,disponibilidade,certificacao,modalidade,foto_url,ativo,status,motivo_status,criado_em FROM interpretes WHERE ativo=1 AND status='aprovado' ORDER BY nome");
 jsonResponse(['ok'=>true,'interpretes'=>$stmt->fetchAll()]);
}
jsonResponse(['ok'=>false,'erro'=>'Método não permitido'],405);
