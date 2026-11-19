<?php
require __DIR__.'/../bootstrap.php';
$data=body();
if($_SERVER['REQUEST_METHOD']!=='POST') jsonResponse(['ok'=>false,'erro'=>'Método não permitido'],405);
requireFields($data,['nome','email','senha']);
$email=strtolower(trim($data['email']));
if(!filter_var($email,FILTER_VALIDATE_EMAIL)) jsonResponse(['ok'=>false,'erro'=>'E-mail inválido'],422);
if(strlen((string)$data['senha'])<8) jsonResponse(['ok'=>false,'erro'=>'A senha precisa ter pelo menos 8 caracteres'],422);
try{
 $stmt=$pdo->prepare('INSERT INTO usuarios(nome,email,senha_hash) VALUES(?,?,?)');
 $stmt->execute([trim($data['nome']),$email,password_hash($data['senha'],PASSWORD_DEFAULT)]);
 jsonResponse(['ok'=>true,'id'=>(int)$pdo->lastInsertId()],201);
}catch(PDOException $e){ if((int)$e->errorInfo[1]===1062) jsonResponse(['ok'=>false,'erro'=>'E-mail já cadastrado'],409); jsonResponse(['ok'=>false,'erro'=>'Não foi possível cadastrar usuário'],500); }
