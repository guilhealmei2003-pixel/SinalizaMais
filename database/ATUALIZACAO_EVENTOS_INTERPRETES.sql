-- Selecione antes seu banco de dados no phpMyAdmin (InfinityFree).
-- Executar uma vez no banco existente. Não apaga tabelas nem registros.
CREATE TABLE IF NOT EXISTS eventos_admin (
 id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 titulo VARCHAR(180) NOT NULL,
 tipo VARCHAR(60) NOT NULL,
 local_evento VARCHAR(255) NOT NULL,
 data_evento DATE NOT NULL,
 descricao TEXT NOT NULL,
 status ENUM('rascunho','revisao','publicado','arquivado') NOT NULL DEFAULT 'publicado',
 fonte VARCHAR(255) NULL,
 link VARCHAR(500) NULL,
 publicado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 INDEX idx_eventos_data (status,data_evento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Adiciona a coluna para armazenar imagem comprimida (Data URL) de intérprete.
-- Se já executou esta linha anteriormente, NÃO execute novamente.
ALTER TABLE interpretes ADD COLUMN foto_data MEDIUMTEXT NULL;
