<?php
require __DIR__.'/../bootstrap.php';require_once __DIR__.'/../interprete_auth.php';
$method=$_SERVER['REQUEST_METHOD']??'GET';
if($method==='POST'){
 interpreteMesmoSite();$d=body();requireFields($d,['email','senha']);
 $st=$pdo->prepare('SELECT id,senha_hash FROM interpretes WHERE email=?');$st->execute([strtolower(trim($d['email']))]);$u=$st->fetch();
 if(!$u||!interpreteSenhaValida($d['senha'],$u['senha_hash']))jsonResponse(['ok'=>false,'erro'=>'E-mail ou senha incorretos'],401);
 interpreteSession();session_regenerate_id(true);$_SESSION['interprete_id']=(int)$u['id'];
 jsonResponse(['ok'=>true,'interprete'=>interpreteCampos($pdo,(int)$u['id'])]);
}
if($method==='DELETE'){
 interpreteMesmoSite();interpreteSession();$_SESSION=[];session_destroy();jsonResponse(['ok'=>true]);
}
if($method==='GET'){
 $id=interpreteExigir();$u=interpreteCampos($pdo,$id);if(!$u)jsonResponse(['ok'=>false,'erro'=>'Cadastro não encontrado'],404);
 jsonResponse(['ok'=>true,'interprete'=>$u]);
}
if($method==='PATCH'){
 interpreteMesmoSite();$id=interpreteExigir();$old=interpreteCampos($pdo,$id);
 if(!$old||$old['status']==='bloqueado')jsonResponse(['ok'=>false,'erro'=>'Edição indisponível'],403);
 $d=body();requireFields($d,['telefone','cidade','atuacao','disponibilidade']);$foto=interpreteFoto($d['foto_url']??null);
 $revisao=$old['status']==='reprovado';
 $st=$pdo->prepare("UPDATE interpretes SET telefone=?,cidade=?,atuacao=?,disponibilidade=?,modalidade=?,certificacao=?,foto_data=COALESCE(?,foto_data),status=IF(?=1,'pendente',status),ativo=IF(?=1,0,ativo),motivo_status=IF(?=1,'Dados atualizados pelo intérprete. Aguardando nova análise administrativa.',motivo_status) WHERE id=?");
 $st->execute([trim($d['telefone']),trim($d['cidade']),trim($d['atuacao']),trim($d['disponibilidade']),$d['modalidade']??'Presencial',trim((string)($d['certificacao']??'')),$foto,(int)$revisao,(int)$revisao,(int)$revisao,$id]);
 jsonResponse(['ok'=>true,'interprete'=>interpreteCampos($pdo,$id)]);
}
jsonResponse(['ok'=>false,'erro'=>'Método não permitido'],405);
