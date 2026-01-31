-- ==========================================
-- SCHEMA DO BANCO DE DADOS - AGENDA SAÚDE
-- ==========================================
-- Este arquivo contém o schema completo para criar as tabelas necessárias no Supabase
-- Execute este SQL no SQL Editor do Supabase

-- ==========================================
-- PASSO 1: DELETAR TABELAS EXISTENTES (se necessário)
-- ==========================================
-- Descomente as linhas abaixo se precisar recriar as tabelas do zero

-- DROP TABLE IF EXISTS professional_precos CASCADE;
-- DROP TABLE IF EXISTS professional_politicas CASCADE;
-- DROP TABLE IF EXISTS professional_locais CASCADE;
-- DROP TABLE IF EXISTS professional_especialidades CASCADE;
-- DROP TABLE IF EXISTS professional_convenios CASCADE;
-- DROP TABLE IF EXISTS professionals CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP VIEW IF EXISTS vw_professional_complete;

-- ==========================================
-- PASSO 2: CRIAR TABELAS
-- ==========================================

-- 1. TABELA: users
-- Armazena dados básicos dos usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  telefone TEXT DEFAULT '',
  cpf_cnpj TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA: professionals
-- Armazena dados profissionais estendidos
CREATE TABLE IF NOT EXISTS professionals (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome_comercial TEXT DEFAULT '',
  crm_crp_cro TEXT DEFAULT '',
  celular_corporativo TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  site TEXT DEFAULT '',
  area_saude TEXT DEFAULT 'Psicólogo',
  bio TEXT DEFAULT '',
  forma_atendimento TEXT DEFAULT 'Online e Presencial',
  intervalo_consultas TEXT DEFAULT '10',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. TABELA: professional_convenios
-- Armazena convênios aceitos pelo profissional (com planos)
CREATE TABLE IF NOT EXISTS professional_convenios (
  id BIGSERIAL PRIMARY KEY,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  planos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA: professional_especialidades
-- Armazena especialidades do profissional (com detalhes)
CREATE TABLE IF NOT EXISTS professional_especialidades (
  id BIGSERIAL PRIMARY KEY,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  duracao TEXT DEFAULT '50',
  forma_atendimento TEXT DEFAULT 'Presencial',
  convenios JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA: professional_locais
-- Armazena locais de atendimento
CREATE TABLE IF NOT EXISTS professional_locais (
  id BIGSERIAL PRIMARY KEY,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  endereco TEXT DEFAULT '',
  cep TEXT DEFAULT '',
  cidade TEXT DEFAULT '',
  especialidades JSONB DEFAULT '[]'::jsonb,
  horarios JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA: professional_precos
-- Armazena configurações de preços
CREATE TABLE IF NOT EXISTS professional_precos (
  id BIGSERIAL PRIMARY KEY,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  local TEXT DEFAULT '',
  especialidade TEXT DEFAULT '',
  valor TEXT DEFAULT '',
  formas_pagamento JSONB DEFAULT '[]'::jsonb,
  cobranca_no_agendamento BOOLEAN DEFAULT false,
  percentual_adiantado TEXT DEFAULT '50',
  dados_bancarios JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA: professional_politicas
-- Armazena políticas de cancelamento, reagendamento e faltas
CREATE TABLE IF NOT EXISTS professional_politicas (
  id BIGSERIAL PRIMARY KEY,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  -- Políticas de Cancelamento
  cancelamento_prazo_minimo TEXT DEFAULT '24',
  cancelamento_cobra_multa BOOLEAN DEFAULT true,
  cancelamento_percentual_multa TEXT DEFAULT '50',
  cancelamento_permitido BOOLEAN DEFAULT true,
  -- Políticas de Reagendamento
  reagendamento_permitido BOOLEAN DEFAULT true,
  reagendamento_prazo_minimo TEXT DEFAULT '12',
  reagendamento_limite TEXT DEFAULT '2',
  -- Políticas de Faltas
  faltas_cobra BOOLEAN DEFAULT true,
  faltas_percentual_cobranca TEXT DEFAULT '100',
  faltas_tolerancia_atraso TEXT DEFAULT '15',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professional_id)
);

-- ==========================================
-- PASSO 3: CRIAR ÍNDICES PARA PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_convenios_professional_id ON professional_convenios(professional_id);
CREATE INDEX IF NOT EXISTS idx_especialidades_professional_id ON professional_especialidades(professional_id);
CREATE INDEX IF NOT EXISTS idx_locais_professional_id ON professional_locais(professional_id);
CREATE INDEX IF NOT EXISTS idx_precos_professional_id ON professional_precos(professional_id);
CREATE INDEX IF NOT EXISTS idx_politicas_professional_id ON professional_politicas(professional_id);

-- ==========================================
-- PASSO 4: CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_locais ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_precos ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_politicas ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLÍTICAS PARA TABELA USERS
-- ==========================================

DROP POLICY IF EXISTS "Users podem ver seus próprios dados" ON users;
CREATE POLICY "Users podem ver seus próprios dados" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users podem inserir seus próprios dados" ON users;
CREATE POLICY "Users podem inserir seus próprios dados" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users podem atualizar seus próprios dados" ON users;
CREATE POLICY "Users podem atualizar seus próprios dados" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- POLÍTICAS PARA TABELA PROFESSIONALS
-- ==========================================

DROP POLICY IF EXISTS "Profissionais podem ver seus próprios dados" ON professionals;
CREATE POLICY "Profissionais podem ver seus próprios dados" ON professionals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Profissionais podem inserir seus próprios dados" ON professionals;
CREATE POLICY "Profissionais podem inserir seus próprios dados" ON professionals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Profissionais podem atualizar seus próprios dados" ON professionals;
CREATE POLICY "Profissionais podem atualizar seus próprios dados" ON professionals
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Profissionais podem deletar seus próprios dados" ON professionals;
CREATE POLICY "Profissionais podem deletar seus próprios dados" ON professionals
  FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- POLÍTICAS PARA TABELAS RELACIONADAS
-- ==========================================

-- Helper function para verificar se o usuário é dono do professional
CREATE OR REPLACE FUNCTION is_owner_of_professional(prof_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM professionals
    WHERE professionals.id = prof_id
    AND professionals.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para professional_convenios
DROP POLICY IF EXISTS "Ver próprios convênios" ON professional_convenios;
CREATE POLICY "Ver próprios convênios" ON professional_convenios
  FOR SELECT USING (is_owner_of_professional(professional_id));

DROP POLICY IF EXISTS "Inserir próprios convênios" ON professional_convenios;
CREATE POLICY "Inserir próprios convênios" ON professional_convenios
  FOR INSERT WITH CHECK (is_owner_of_professional(professional_id));

DROP POLICY IF EXISTS "Atualizar próprios convênios" ON professional_convenios;
CREATE POLICY "Atualizar próprios convênios" ON professional_convenios
  FOR UPDATE USING (is_owner_of_professional(professional_id));

DROP POLICY IF EXISTS "Deletar próprios convênios" ON professional_convenios;
CREATE POLICY "Deletar próprios convênios" ON professional_convenios
  FOR DELETE USING (is_owner_of_professional(professional_id));

-- Políticas para professional_especialidades
DROP POLICY IF EXISTS "Ver próprias especialidades" ON professional_especialidades;
CREATE POLICY "Ver próprias especialidades" ON professional_especialidades
  FOR SELECT USING (is_owner_of_professional(professional_id));

DROP POLICY IF EXISTS "Inserir próprias especialidades" ON professional_especialidades;
CREATE POLICY "Inserir próprias especialidades" ON professional_especialidades
  FOR INSERT WITH CHECK (is_owner_of_professional(professional_id));

DROP POLICY IF EXISTS "Atualizar próprias especialidades" ON professional_especialidades;
CREATE POLICY "Atualizar próprias especialidades" ON professional_especialidades
  FOR UPDATE USING (is_owner_of_professional(professional_id));

DROP POLICY IF EXISTS "Deletar próprias especialidades" ON professional_especialidades;
CREATE POLICY "Deletar próprias especialidades" ON professional_especialidades
  FOR DELETE USING (is_owner_of_professional(professional_id));

-- Políticas para professional_locais
DROP POLICY IF EXISTS "Ver próprios locais" ON professional_locais;
CREATE POLICY "Ver próprios locais" ON professional_locais
  FOR SELECT USING (is_owner_of_professional(professional_id));

DROP POLICY IF EXISTS "Inserir próprios locais" ON professional_locais;
CREATE POLICY "Inserir próprios locais" ON professional_locais
  FOR INSERT WITH CHECK (is_owner_of_professional(professional_id));

DROP POLICY IF EXISTS "Atualizar próprios locais" ON professional_locais;
CREATE POLICY "Atualizar próprios locais" ON professional_locais
  FOR UPDATE USING (is_owner_of_professional(professional_id));

DROP POLICY IF EXISTS "Deletar próprios locais" ON professional_locais;
CREATE POLICY "Deletar próprios locais" ON professional_locais
  FOR DELETE USING (is_owner_of_professional(professional_id));

-- Políticas para professional_precos
DROP POLICY IF EXISTS "Ver próprios preços" ON professional_precos;
CREATE POLICY "Ver próprios preços" ON professional_precos
  FOR SELECT USING (is_owner_of_professional(professional_id));

DROP POLICY IF EXISTS "Inserir próprios preços" ON professional_precos;
CREATE POLICY "Inserir próprios preços" ON professional_precos
  FOR INSERT WITH CHECK (is_owner_of_professional(professional_id));

DROP POLICY IF EXISTS "Atualizar próprios preços" ON professional_precos;
CREATE POLICY "Atualizar próprios preços" ON professional_precos
  FOR UPDATE USING (is_owner_of_professional(professional_id));

DROP POLICY IF EXISTS "Deletar próprios preços" ON professional_precos;
CREATE POLICY "Deletar próprios preços" ON professional_precos
  FOR DELETE USING (is_owner_of_professional(professional_id));

-- Políticas para professional_politicas
DROP POLICY IF EXISTS "Ver próprias políticas" ON professional_politicas;
CREATE POLICY "Ver próprias políticas" ON professional_politicas
  FOR SELECT USING (is_owner_of_professional(professional_id));

DROP POLICY IF EXISTS "Inserir próprias políticas" ON professional_politicas;
CREATE POLICY "Inserir próprias políticas" ON professional_politicas
  FOR INSERT WITH CHECK (is_owner_of_professional(professional_id));

DROP POLICY IF EXISTS "Atualizar próprias políticas" ON professional_politicas;
CREATE POLICY "Atualizar próprias políticas" ON professional_politicas
  FOR UPDATE USING (is_owner_of_professional(professional_id));

DROP POLICY IF EXISTS "Deletar próprias políticas" ON professional_politicas;
CREATE POLICY "Deletar próprias políticas" ON professional_politicas
  FOR DELETE USING (is_owner_of_professional(professional_id));

-- ==========================================
-- PASSO 5: TRIGGERS PARA ATUALIZAR updated_at
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_professionals_updated_at ON professionals;
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_politicas_updated_at ON professional_politicas;
CREATE TRIGGER update_politicas_updated_at BEFORE UPDATE ON professional_politicas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- PASSO 6: VIEW PARA DADOS COMPLETOS (OPCIONAL)
-- ==========================================

DROP VIEW IF EXISTS vw_professional_complete;
CREATE OR REPLACE VIEW vw_professional_complete AS
SELECT
  p.*,
  u.nome as user_nome,
  u.email,
  u.telefone,
  u.cpf_cnpj,
  COALESCE(
    (SELECT json_agg(json_build_object('nome', nome, 'planos', planos))
     FROM professional_convenios WHERE professional_id = p.id),
    '[]'::json
  ) as convenios,
  COALESCE(
    (SELECT json_agg(json_build_object('nome', nome, 'duracao', duracao, 'forma_atendimento', forma_atendimento, 'convenios', convenios))
     FROM professional_especialidades WHERE professional_id = p.id),
    '[]'::json
  ) as especialidades,
  COALESCE(
    (SELECT json_agg(row_to_json(professional_locais.*))
     FROM professional_locais WHERE professional_id = p.id),
    '[]'::json
  ) as locais,
  COALESCE(
    (SELECT json_agg(row_to_json(professional_precos.*))
     FROM professional_precos WHERE professional_id = p.id),
    '[]'::json
  ) as precos
FROM professionals p
JOIN users u ON u.id = p.user_id;

-- ==========================================
-- COMENTÁRIOS NAS TABELAS
-- ==========================================

COMMENT ON TABLE users IS 'Dados básicos de todos os usuários do sistema';
COMMENT ON TABLE professionals IS 'Dados profissionais estendidos dos prestadores de serviço';
COMMENT ON TABLE professional_convenios IS 'Convênios médicos aceitos por cada profissional, com planos';
COMMENT ON TABLE professional_especialidades IS 'Especialidades profissionais com duração e forma de atendimento';
COMMENT ON TABLE professional_locais IS 'Locais físicos de atendimento';
COMMENT ON TABLE professional_precos IS 'Configurações de preços e formas de pagamento';
COMMENT ON TABLE professional_politicas IS 'Políticas de cancelamento, reagendamento e faltas';

-- ==========================================
-- FIM DO SCHEMA
-- ==========================================
-- Após executar este script, todas as tabelas estarão prontas para uso!
