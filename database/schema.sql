CREATE DATABASE IF NOT EXISTS sinaliza_plus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sinaliza_plus;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interpretes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  telefone VARCHAR(30) NOT NULL,
  cidade VARCHAR(120) NOT NULL,
  atuacao VARCHAR(255) NOT NULL,
  disponibilidade VARCHAR(255) NOT NULL,
  certificacao VARCHAR(255) NULL,
  modalidade ENUM('Presencial','Online','Presencial e online') DEFAULT 'Presencial',
  foto_url VARCHAR(500) NULL,
  foto_data MEDIUMTEXT NULL,
  ativo TINYINT(1) DEFAULT 1,
  status ENUM('pendente','aprovado','reprovado','bloqueado') DEFAULT 'pendente',
  motivo_status VARCHAR(500) NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS administradores (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  nome VARCHAR(120) NOT NULL,
  ativo TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS conteudos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(180) NOT NULL,
  tipo ENUM('noticia','curso','emprego','evento','atualizacao') NOT NULL,
  descricao TEXT NOT NULL,
  local_evento VARCHAR(255) NULL,
  data_evento DATE NULL,
  fonte VARCHAR(255) NULL,
  url_fonte VARCHAR(500) NULL,
  status ENUM('rascunho','revisao','publicado','arquivado') DEFAULT 'rascunho',
  autor_id INT UNSIGNED NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_conteudo_admin FOREIGN KEY (autor_id) REFERENCES administradores(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS solicitacoes_interprete (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  interprete_id INT UNSIGNED NOT NULL,
  nome_solicitante VARCHAR(120) NOT NULL,
  email_solicitante VARCHAR(190) NOT NULL,
  data_atendimento DATETIME NOT NULL,
  modalidade ENUM('Presencial','Online') NOT NULL,
  local_atendimento VARCHAR(255) NULL,
  mensagem TEXT NOT NULL,
  status ENUM('pendente','aceita','recusada','concluida') DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (interprete_id) REFERENCES interpretes(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS mensagens_contato (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  assunto VARCHAR(120) NOT NULL,
  mensagem TEXT NOT NULL,
  status ENUM('nova','lida','respondida','arquivada') DEFAULT 'nova',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mensagens_status_data (status, criado_em)
);

CREATE TABLE IF NOT EXISTS eventos_admin (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(180) NOT NULL, tipo VARCHAR(60) NOT NULL, local_evento VARCHAR(255) NOT NULL, data_evento DATE NOT NULL, descricao TEXT NOT NULL, status ENUM('rascunho','revisao','publicado','arquivado') DEFAULT 'publicado', fonte VARCHAR(255), link VARCHAR(500), publicado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
