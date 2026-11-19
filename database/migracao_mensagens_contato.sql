-- Execute este script no banco de dados do Sinaliza+ já existente.
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
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
