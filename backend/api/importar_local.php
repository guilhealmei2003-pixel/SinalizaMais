<?php
require __DIR__.'/../bootstrap.php';
require_once __DIR__.'/../admin_auth.php';
require_once __DIR__.'/../interprete_auth.php';
if(($_SERVER['REQUEST_METHOD']??'')!=='POST')jsonResponse(['ok'=>false,'erro'=>'Método não permitido'],405);
sinalizaAdminExigirApi(true);
$d=body();$eventos=$d['eventos']??[];$interpretes=$d['interpretes']??[];
if(!is_array($eventos)||!is_array($interpretes)||count($eventos)>150||count($interpretes)>150)jsonResponse(['ok'=>false,'erro'=>'Limite de importação excedido'],422);
$e=0;$i=0;
try{
 $pdo->beginTransaction();
 $checkEvent=$pdo->prepare('SELECT id FROM eventos_admin WHERE titulo=? AND data_evento=? AND local_evento=? LIMIT 1');
 $addEvent=$pdo->prepare('INSERT INTO eventos_admin(titulo,tipo,local_evento,data_evento,descricao,status,fonte,link) VALUES(?,?,?,?,?,?,?,?)');
 foreach($eventos as $v){
  if(!is_array($v)||empty($v['titulo'])||empty($v['local'])||empty($v['data'])||empty($v['descricao']))continue;
  if(!preg_match('/^\d{4}-\d{2}-\d{2}$/',(string)$v['data']))continue;
  $titulo=substr((string)$v['titulo'],0,180);$local=substr((string)$v['local'],0,255);
  $checkEvent->execute([$titulo,$v['data'],$local]);if($checkEvent->fetch())continue;
  $status=in_array($v['status']??'publicado',['publicado','rascunho','revisao','arquivado'],true)?$v['status']:'publicado';
  $link=(string)($v['link']??'');if($link&&!filter_var($link,FILTER_VALIDATE_URL))$link='';
  $addEvent->execute([$titulo,substr((string)($v['tipo']??'Evento'),0,60),$local,$v['data'],(string)$v['descricao'],$status,substr((string)($v['fonte']??''),0,255),substr($link,0,500)]);$e++;
 }
 $exists=$pdo->prepare('SELECT id FROM interpretes WHERE email=? LIMIT 1');
 $add=$pdo->prepare("INSERT INTO interpretes(nome,email,senha_hash,telefone,cidade,atuacao,disponibilidade,certificacao,modalidade,foto_data,status,ativo,motivo_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)");
 foreach($interpretes as $v){
  if(!is_array($v))continue;
  $email=strtolower(trim((string)($v['email']??'')));
  if(!filter_var($email,FILTER_VALIDATE_EMAIL)||empty($v['nome'])||empty($v['salt'])||empty($v['passwordHash']))continue;
  $salt=base64_decode((string)$v['salt'],true);$hashed=base64_decode((string)$v['passwordHash'],true);
  $round=(int)($v['iterations']??210000);
  if($salt===false||strlen($salt)!==16||$hashed===false||strlen($hashed)!==32||$round<100000||$round>500000)continue;
  $exists->execute([$email]);if($exists->fetch())continue;
  $legacy='legacy$'.$round.'$'.$v['salt'].'$'.$v['passwordHash'];
  $status=in_array($v['status']??'pendente',['pendente','aprovado','reprovado','bloqueado'],true)?$v['status']:'pendente';
  $foto=interpreteFoto($v['foto_url']??null);
  $mode=in_array($v['modalidade']??'Presencial',['Presencial','Online','Presencial e online'],true)?$v['modalidade']:'Presencial';
  $add->execute([substr((string)$v['nome'],0,120),$email,$legacy,substr((string)($v['telefone']??''),0,30),substr((string)($v['cidade']??''),0,120),substr((string)($v['atuacao']??''),0,255),substr((string)($v['disponibilidade']??''),0,255),substr((string)($v['certificacao']??''),0,255),$mode,$foto,$status,$status==='aprovado'?1:0,substr((string)($v['motivo_status']??''),0,500)]);$i++;
 }
 $pdo->commit();jsonResponse(['ok'=>true,'eventos_importados'=>$e,'interpretes_importados'=>$i]);
}catch(Throwable $ex){if($pdo->inTransaction())$pdo->rollBack();throw $ex;}
