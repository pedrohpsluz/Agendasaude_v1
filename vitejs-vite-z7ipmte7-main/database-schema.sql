-- ==========================================
-- SCHEMA DO BANCO DE DADOS - AGENDA SAÚDE
-- ==========================================
-- Este arquivo contém o schema completo para criar as tabelas necessárias no Supabase

-- 1. TABELA: users
-- Armazena dados básicos dos usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  cpf_cnpj TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA: professionals
-- Armazena dados profissionais estendidos
CREATE TABLE IF NOT EXISTS professionals (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome_comercial TEXT,
  crm_crp_cro TEXT,
  celular_corporativo TEXT,
  instagram TEXT,
  site TEXT,
  area_saude TEXT DEFAULT 'Psicólogo',
  bio TEXT,
  forma_atendimento TEXT DEFAULT 'Online e Presencial',
  intervalo_consultas TEXT DEFAULT '10',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. TABELA: professional_convenios
-- Armazena convênios aceitos pelo profissional
CREATE TABLE IF NOT EXISTS professional_convenios (
  id BIGSERIAL PRIMARY KEY,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA: professional_especialidades
-- Armazena especialidades do profissional
CREATE TABLE IF NOT EXISTS professional_especialidades (
  id BIGSERIAL PRIMARY KEY,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA: professional_locais
-- Armazena locais de atendimento
CREATE TABLE IF NOT EXISTS professional_locais (
  id BIGSERIAL PRIMARY KEY,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  endereco TEXT,
  cep TEXT,
  cidade TEXT,
  especialidades JSONB DEFAULT '[]'::jsonb,
  horarios JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA: professional_politicas
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
-- ÍNDICES PARA MELHOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_convenios_professional_id ON professional_convenios(professional_id);
CREATE INDEX IF NOT EXISTS idx_especialidades_professional_id ON professional_especialidades(professional_id);
CREATE INDEX IF NOT EXISTS idx_locais_professional_id ON professional_locais(professional_id);
CREATE INDEX IF NOT EXISTS idx_politicas_professional_id ON professional_politicas(professional_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_locais ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_politicas ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela users
CREATE POLICY "Users podem ver seus próprios dados" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users podem inserir seus próprios dados" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users podem atualizar seus próprios dados" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para tabela professionals
CREATE POLICY "Profissionais podem ver seus próprios dados" ON professionals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Profissionais podem inserir seus próprios dados" ON professionals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Profissionais podem atualizar seus próprios dados" ON professionals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Profissionais podem deletar seus próprios dados" ON professionals
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para professional_convenios
CREATE POLICY "Ver próprios convênios" ON professional_convenios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_convenios.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Inserir próprios convênios" ON professional_convenios
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_convenios.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Deletar próprios convênios" ON professional_convenios
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_convenios.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

-- Políticas para professional_especialidades
CREATE POLICY "Ver próprias especialidades" ON professional_especialidades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_especialidades.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Inserir próprias especialidades" ON professional_especialidades
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_especialidades.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Deletar próprias especialidades" ON professional_especialidades
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_especialidades.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

-- Políticas para professional_locais
CREATE POLICY "Ver próprios locais" ON professional_locais
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_locais.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Inserir próprios locais" ON professional_locais
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_locais.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Deletar próprios locais" ON professional_locais
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_locais.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

-- Políticas para professional_politicas
CREATE POLICY "Ver próprias políticas" ON professional_politicas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_politicas.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Inserir próprias políticas" ON professional_politicas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_politicas.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Atualizar próprias políticas" ON professional_politicas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_politicas.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

-- ==========================================
-- TRIGGERS PARA ATUALIZAR updated_at
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_politicas_updated_at BEFORE UPDATE ON professional_politicas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- COMENTÁRIOS NAS TABELAS E COLUNAS
-- ==========================================

COMMENT ON TABLE users IS 'Dados básicos de todos os usuários do sistema';
COMMENT ON TABLE professionals IS 'Dados profissionais estendidos dos prestadores de serviço';
COMMENT ON TABLE professional_convenios IS 'Convênios médicos aceitos por cada profissional';
COMMENT ON TABLE professional_especialidades IS 'Especialidades profissionais de cada prestador';
COMMENT ON TABLE professional_locais IS 'Locais físicos de atendimento';
COMMENT ON TABLE professional_politicas IS 'Políticas de cancelamento, reagendamento e faltas';

-- ==========================================
-- VIEWS ÚTEIS (OPCIONAL)
-- ==========================================

-- View para ver dados completos do profissional
CREATE OR REPLACE VIEW vw_professional_complete AS
SELECT
  p.*,
  u.nome as user_nome,
  u.email,
  u.telefone,
  u.cpf_cnpj,
  COALESCE(
    (SELECT json_agg(nome) FROM professional_convenios WHERE professional_id = p.id),
    '[]'::json
  ) as convenios,
  COALESCE(
    (SELECT json_agg(nome) FROM professional_especialidades WHERE professional_id = p.id),
    '[]'::json
  ) as especialidades,
  COALESCE(
    (SELECT json_agg(row_to_json(professional_locais.*)) FROM professional_locais WHERE professional_id = p.id),
    '[]'::json
  ) as locais
FROM professionals p
JOIN users u ON u.id = p.user_id;

COMMENT ON VIEW vw_professional_complete IS 'View que combina dados do profissional com informações relacionadas';

-- ==========================================
-- DADOS DE EXEMPLO (OPCIONAL - COMENTADO)
-- ==========================================

/*
-- Exemplo de inserção de dados de teste
INSERT INTO users (id, nome, email, telefone, cpf_cnpj)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Substituir por UUID válido
  'Dr. João Silva',
  'joao@exemplo.com',
  '(19) 99999-9999',
  '12345678901'
);
*/

-- ==========================================
-- FIM DO SCHEMA
-- ==========================================
