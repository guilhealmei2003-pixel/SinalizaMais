<?php
function interpreteSession():void {
 if(session_status()===PHP_SESSION_ACTIVE)return;
 ini_set('session.use_strict_mode','1');ini_set('session.use_only_cookies','1');
 $https=(!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off')||($_SERVER['SERVER_PORT']??'')==='443';
 session_name('SINALIZA_INTERPRETE');
 session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>$https,'httponly'=>true,'samesite'=>'Lax']);session_start();
}
function interpreteExigir():int { interpreteSession();$id=(int)($_SESSION['interprete_id']??0);if(!$id)jsonResponse(['ok'=>false,'erro'=>'Faça login para continuar'],401);return $id; }
function interpreteMesmoSite():void {
 $origin=$_SERVER['HTTP_ORIGIN']??'';
 if($origin){$host=parse_url($origin,PHP_URL_HOST);if(!$host||strcasecmp($host,$_SERVER['HTTP_HOST']??'')!==0 && strcasecmp($host,explode(':',$_SERVER['HTTP_HOST']??'')[0])!==0)jsonResponse(['ok'=>false,'erro'=>'Origem não autorizada'],403);}
}
function interpreteCampos(PDO $pdo,int $id):array {
 $st=$pdo->prepare('SELECT id,nome,email,telefone,cidade,atuacao,disponibilidade,certificacao,modalidade,COALESCE(foto_data,foto_url) AS foto_url,ativo,status,motivo_status,criado_em,atualizado_em AS status_atualizado_em FROM interpretes WHERE id=?');
 $st->execute([$id]);return $st->fetch()?:[];
}
function interpreteFoto($value):?string {
 if($value===null||$value==='')return null;
 if(!is_string($value)||strlen($value)>650000||!preg_match('~^data:image/jpeg;base64,([a-zA-Z0-9+/=]+)$~',$value,$m)||strlen(base64_decode($m[1],true)?:'')>400000)jsonResponse(['ok'=>false,'erro'=>'Foto inválida ou muito grande'],422);
 return $value;
}

function interpreteSenhaValida(string $senha,string $hash):bool {
 if(strncmp($hash,'legacy$',7)!==0)return password_verify($senha,$hash);
 $parts=explode('$',$hash);if(count($parts)!==4)return false;
 $round=(int)$parts[1];$salt=base64_decode($parts[2],true);
 if($round<100000||$round>500000||$salt===false||strlen($salt)!==16)return false;
 $candidate=base64_encode(hash_pbkdf2('sha256',$senha,$salt,$round,32,true));
 return hash_equals($parts[3],$candidate);
}
