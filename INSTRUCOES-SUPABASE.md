# Instruções para Configurar o Supabase - AgendaSaúde

## Resumo das Alterações Necessárias

O código está preparado para salvar **43 campos** distribuídos em **7 tabelas**:

| Tabela | Campos | Status |
|--------|--------|--------|
| users | 5 campos | Precisa recriar |
| professionals | 10 campos | Precisa recriar |
| professional_convenios | 3 campos | Precisa recriar |
| professional_especialidades | 5 campos | Precisa recriar |
| professional_locais | 7 campos | Precisa recriar |
| professional_precos | 8 campos | **NOVA TABELA** |
| professional_politicas | 11 campos | Precisa recriar |

---

## PASSO 1: Acessar o SQL Editor do Supabase

1. Acesse seu projeto no Supabase: https://supabase.com/dashboard
2. No menu lateral, clique em **SQL Editor** (ícone de código)
3. Clique em **New query**

---

## PASSO 2: Deletar Tabelas Existentes

**ATENÇÃO**: Este passo vai APAGAR todos os dados existentes. Se você tem dados importantes, faça backup primeiro!

Execute este SQL:

```sql
-- DELETAR TABELAS EXISTENTES (na ordem correta por foreign keys)
DROP TABLE IF EXISTS professional_precos CASCADE;
DROP TABLE IF EXISTS professional_politicas CASCADE;
DROP TABLE IF EXISTS professional_locais CASCADE;
DROP TABLE IF EXISTS professional_especialidades CASCADE;
DROP TABLE IF EXISTS professional_convenios CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP VIEW IF EXISTS vw_professional_complete;

-- Deletar função helper se existir
DROP FUNCTION IF EXISTS is_owner_of_professional(BIGINT);
DROP FUNCTION IF EXISTS update_updated_at_column();
```

Clique em **Run** para executar.

---

## PASSO 3: Criar as Tabelas

Copie e execute o SQL abaixo (ou use o arquivo `database-schema.sql` do projeto):

```sql
-- ==========================================
-- 1. TABELA: users
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  telefone TEXT DEFAULT '',
  cpf_cnpj TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. TABELA: professionals
-- ==========================================
CREATE TABLE professionals (
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

-- ==========================================
-- 3. TABELA: professional_convenios
-- ==========================================
CREATE TABLE professional_convenios (
  id BIGSERIAL PRIMARY KEY,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  planos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. TABELA: professional_especialidades
-- ==========================================
CREATE TABLE professional_especialidades (
  id BIGSERIAL PRIMARY KEY,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  duracao TEXT DEFAULT '50',
  forma_atendimento TEXT DEFAULT 'Presencial',
  convenios JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. TABELA: professional_locais
-- ==========================================
CREATE TABLE professional_locais (
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

-- ==========================================
-- 6. TABELA: professional_precos (NOVA)
-- ==========================================
CREATE TABLE professional_precos (
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

-- ==========================================
-- 7. TABELA: professional_politicas
-- ==========================================
CREATE TABLE professional_politicas (
  id BIGSERIAL PRIMARY KEY,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  cancelamento_prazo_minimo TEXT DEFAULT '24',
  cancelamento_cobra_multa BOOLEAN DEFAULT true,
  cancelamento_percentual_multa TEXT DEFAULT '50',
  cancelamento_permitido BOOLEAN DEFAULT true,
  reagendamento_permitido BOOLEAN DEFAULT true,
  reagendamento_prazo_minimo TEXT DEFAULT '12',
  reagendamento_limite TEXT DEFAULT '2',
  faltas_cobra BOOLEAN DEFAULT true,
  faltas_percentual_cobranca TEXT DEFAULT '100',
  faltas_tolerancia_atraso TEXT DEFAULT '15',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professional_id)
);
```

---

## PASSO 4: Criar Índices

```sql
-- Índices para melhor performance
CREATE INDEX idx_professionals_user_id ON professionals(user_id);
CREATE INDEX idx_convenios_professional_id ON professional_convenios(professional_id);
CREATE INDEX idx_especialidades_professional_id ON professional_especialidades(professional_id);
CREATE INDEX idx_locais_professional_id ON professional_locais(professional_id);
CREATE INDEX idx_precos_professional_id ON professional_precos(professional_id);
CREATE INDEX idx_politicas_professional_id ON professional_politicas(professional_id);
```

---

## PASSO 5: Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_locais ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_precos ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_politicas ENABLE ROW LEVEL SECURITY;

-- Função helper para verificar propriedade
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

-- ==========================================
-- POLÍTICAS PARA USERS
-- ==========================================
CREATE POLICY "Users podem ver seus próprios dados" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users podem inserir seus próprios dados" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users podem atualizar seus próprios dados" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- POLÍTICAS PARA PROFESSIONALS
-- ==========================================
CREATE POLICY "Profissionais podem ver seus próprios dados" ON professionals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Profissionais podem inserir seus próprios dados" ON professionals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Profissionais podem atualizar seus próprios dados" ON professionals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Profissionais podem deletar seus próprios dados" ON professionals
  FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- POLÍTICAS PARA CONVENIOS
-- ==========================================
CREATE POLICY "Ver próprios convênios" ON professional_convenios
  FOR SELECT USING (is_owner_of_professional(professional_id));

CREATE POLICY "Inserir próprios convênios" ON professional_convenios
  FOR INSERT WITH CHECK (is_owner_of_professional(professional_id));

CREATE POLICY "Atualizar próprios convênios" ON professional_convenios
  FOR UPDATE USING (is_owner_of_professional(professional_id));

CREATE POLICY "Deletar próprios convênios" ON professional_convenios
  FOR DELETE USING (is_owner_of_professional(professional_id));

-- ==========================================
-- POLÍTICAS PARA ESPECIALIDADES
-- ==========================================
CREATE POLICY "Ver próprias especialidades" ON professional_especialidades
  FOR SELECT USING (is_owner_of_professional(professional_id));

CREATE POLICY "Inserir próprias especialidades" ON professional_especialidades
  FOR INSERT WITH CHECK (is_owner_of_professional(professional_id));

CREATE POLICY "Atualizar próprias especialidades" ON professional_especialidades
  FOR UPDATE USING (is_owner_of_professional(professional_id));

CREATE POLICY "Deletar próprias especialidades" ON professional_especialidades
  FOR DELETE USING (is_owner_of_professional(professional_id));

-- ==========================================
-- POLÍTICAS PARA LOCAIS
-- ==========================================
CREATE POLICY "Ver próprios locais" ON professional_locais
  FOR SELECT USING (is_owner_of_professional(professional_id));

CREATE POLICY "Inserir próprios locais" ON professional_locais
  FOR INSERT WITH CHECK (is_owner_of_professional(professional_id));

CREATE POLICY "Atualizar próprios locais" ON professional_locais
  FOR UPDATE USING (is_owner_of_professional(professional_id));

CREATE POLICY "Deletar próprios locais" ON professional_locais
  FOR DELETE USING (is_owner_of_professional(professional_id));

-- ==========================================
-- POLÍTICAS PARA PREÇOS
-- ==========================================
CREATE POLICY "Ver próprios preços" ON professional_precos
  FOR SELECT USING (is_owner_of_professional(professional_id));

CREATE POLICY "Inserir próprios preços" ON professional_precos
  FOR INSERT WITH CHECK (is_owner_of_professional(professional_id));

CREATE POLICY "Atualizar próprios preços" ON professional_precos
  FOR UPDATE USING (is_owner_of_professional(professional_id));

CREATE POLICY "Deletar próprios preços" ON professional_precos
  FOR DELETE USING (is_owner_of_professional(professional_id));

-- ==========================================
-- POLÍTICAS PARA POLITICAS
-- ==========================================
CREATE POLICY "Ver próprias políticas" ON professional_politicas
  FOR SELECT USING (is_owner_of_professional(professional_id));

CREATE POLICY "Inserir próprias políticas" ON professional_politicas
  FOR INSERT WITH CHECK (is_owner_of_professional(professional_id));

CREATE POLICY "Atualizar próprias políticas" ON professional_politicas
  FOR UPDATE USING (is_owner_of_professional(professional_id));

CREATE POLICY "Deletar próprias políticas" ON professional_politicas
  FOR DELETE USING (is_owner_of_professional(professional_id));
```

---

## PASSO 6: Criar Triggers para updated_at

```sql
-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_politicas_updated_at BEFORE UPDATE ON professional_politicas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## VERIFICAÇÃO FINAL

Após executar todos os passos, você deve ter estas tabelas no Supabase:

| Tabela | Colunas Principais |
|--------|-------------------|
| **users** | id, nome, email, telefone, cpf_cnpj |
| **professionals** | id, user_id, nome_comercial, crm_crp_cro, celular_corporativo, instagram, site, area_saude, bio, forma_atendimento, intervalo_consultas |
| **professional_convenios** | id, professional_id, nome, planos (JSONB) |
| **professional_especialidades** | id, professional_id, nome, duracao, forma_atendimento, convenios (JSONB) |
| **professional_locais** | id, professional_id, nome, endereco, cep, cidade, especialidades (JSONB), horarios (JSONB) |
| **professional_precos** | id, professional_id, local, especialidade, valor, formas_pagamento (JSONB), cobranca_no_agendamento, percentual_adiantado, dados_bancarios (JSONB) |
| **professional_politicas** | id, professional_id, cancelamento_*, reagendamento_*, faltas_* |

---

## Mapeamento de Campos: Aplicação → Banco de Dados

### Aba "Informações Pessoais"
| Campo na Aplicação | Tabela.Coluna |
|-------------------|---------------|
| Nome Completo | users.nome |
| Nome Comercial | professionals.nome_comercial |
| CPF/CNPJ | users.cpf_cnpj |
| CRM/CRP/CRO | professionals.crm_crp_cro |
| Email | (somente leitura - vem do auth) |
| Telefone/WhatsApp | users.telefone |
| Celular Corporativo | professionals.celular_corporativo |
| Instagram | professionals.instagram |
| Site | professionals.site |
| Área da Saúde | professionals.area_saude |
| Forma de Atendimento | professionals.forma_atendimento |
| Convênios (nome) | professional_convenios.nome |
| Convênios (planos) | professional_convenios.planos |
| Biografia | professionals.bio |

### Aba "Especialidade e Tempo de Consulta"
| Campo na Aplicação | Tabela.Coluna |
|-------------------|---------------|
| Nome da Especialidade | professional_especialidades.nome |
| Duração (minutos) | professional_especialidades.duracao |
| Forma de Atendimento | professional_especialidades.forma_atendimento |
| Intervalo entre Consultas | professionals.intervalo_consultas |

### Aba "Locais e Horários"
| Campo na Aplicação | Tabela.Coluna |
|-------------------|---------------|
| Nome do Local | professional_locais.nome |
| CEP | professional_locais.cep |
| Endereço Completo | professional_locais.endereco |
| Cidade | professional_locais.cidade |

### Aba "Preços e Pagamentos"
| Campo na Aplicação | Tabela.Coluna |
|-------------------|---------------|
| Local | professional_precos.local |
| Especialidade | professional_precos.especialidade |
| Valor da Consulta | professional_precos.valor |
| Formas de Pagamento | professional_precos.formas_pagamento |
| Cobrança no Agendamento | professional_precos.cobranca_no_agendamento |
| Percentual Adiantado | professional_precos.percentual_adiantado |
| Dados Bancários | professional_precos.dados_bancarios |

### Aba "Regras de Cancelamento, Reagendamento e Faltas"
| Campo na Aplicação | Tabela.Coluna |
|-------------------|---------------|
| Permitir Cancelamento | professional_politicas.cancelamento_permitido |
| Prazo Mínimo Cancelamento | professional_politicas.cancelamento_prazo_minimo |
| Cobrar Multa | professional_politicas.cancelamento_cobra_multa |
| Percentual da Multa | professional_politicas.cancelamento_percentual_multa |
| Permitir Reagendamento | professional_politicas.reagendamento_permitido |
| Prazo Mínimo Reagendamento | professional_politicas.reagendamento_prazo_minimo |
| Limite Reagendamentos | professional_politicas.reagendamento_limite |
| Cobrar por Faltas | professional_politicas.faltas_cobra |
| Percentual Cobrança | professional_politicas.faltas_percentual_cobranca |
| Tolerância de Atraso | professional_politicas.faltas_tolerancia_atraso |

---

## Solução de Problemas

### Erro: "violates row-level security policy"
- Verifique se o usuário está autenticado
- Verifique se as políticas RLS foram criadas corretamente

### Erro: "column X does not exist"
- Execute novamente o SQL de criação das tabelas
- Verifique se todas as colunas foram criadas

### Dados não aparecem após salvar
- Abra o Console do navegador (F12) e verifique os logs
- Procure por mensagens de erro no console

---

## Script Completo (Tudo em Um)

Para sua conveniência, o arquivo `database-schema.sql` na raiz do projeto contém **todo o SQL necessário** em um único arquivo. Você pode copiar e colar todo o conteúdo dele no SQL Editor do Supabase.
