# Documentação de Testes - Agenda Saúde

## Visão Geral

Este documento descreve os testes implementados para a aplicação Agenda Saúde, incluindo testes automatizados e manuais.

## Funcionalidades Implementadas

### 1. Sistema de Autenticação
- **Cadastro de Usuário** ([authService.js:4-62](src/authService.js#L4-L62))
  - Criação de usuário no Supabase Auth
  - Inserção de dados na tabela `users`
  - Validação de email e senha

- **Login** ([authService.js:65-128](src/authService.js#L65-L128))
  - Autenticação com email e senha
  - Criação automática de registro na tabela `users` se não existir
  - Gerenciamento de sessão

- **Logout** ([authService.js:131-152](src/authService.js#L131-L152))
  - Encerramento de sessão
  - Limpeza de dados locais

### 2. Perfil Profissional

#### Dados Pessoais ([profileService.js:138-236](src/profileService.js#L138-L236))
- Nome, Email, Telefone, CPF/CNPJ
- Nome Comercial, CRM/CRP/CRO
- Bio, Instagram, Site
- Celular Corporativo
- Área de Saúde
- Forma de Atendimento

#### Convênios ([profileService.js:238-282](src/profileService.js#L238-L282))
- Adição de múltiplos convênios
- Remoção de convênios
- Persistência na tabela `professional_convenios`

#### Especialidades ([profileService.js:284-349](src/profileService.js#L284-L349))
- Adição de especialidades
- Configuração de intervalo entre consultas
- Persistência na tabela `professional_especialidades`

#### Locais de Atendimento ([profileService.js:351-400](src/profileService.js#L351-L400))
- Nome do local
- Endereço completo
- CEP e Cidade
- Especialidades por local (campo disponível)
- Horários de atendimento (campo disponível)
- Persistência na tabela `professional_locais`

#### Políticas ([profileService.js:402-469](src/profileService.js#L402-L469))
- **Cancelamento:**
  - Prazo mínimo (horas)
  - Cobrança de multa (sim/não)
  - Percentual da multa
  - Permite cancelamento (sim/não)

- **Reagendamento:**
  - Permitido (sim/não)
  - Prazo mínimo (horas)
  - Limite de reagendamentos

- **Faltas:**
  - Cobrança de falta (sim/não)
  - Percentual de cobrança
  - Tolerância de atraso (minutos)

- Persistência na tabela `professional_politicas`

### 3. Carregamento de Dados ([profileService.js:4-135](src/profileService.js#L4-L135))
- Carrega dados pessoais do usuário
- Carrega dados do profissional
- Carrega convênios associados
- Carrega especialidades
- Carrega locais de atendimento
- Carrega políticas configuradas

## Testes Automatizados (Playwright)

### Configuração

1. Instalar dependências:
```bash
npm install
npx playwright install
```

2. Executar testes:
```bash
# Executar todos os testes
npm test

# Executar com interface visual
npm run test:ui

# Executar com navegador visível
npm run test:headed

# Ver relatório dos testes
npm run test:report
```

### Casos de Teste

#### Teste 1: Carregamento da Página Inicial
- **Objetivo:** Verificar se a landing page carrega corretamente
- **Passos:**
  1. Acessar URL base
  2. Verificar título da página
  3. Verificar elementos principais visíveis
- **Resultado Esperado:** Página carrega com todos os elementos

#### Teste 2: Cadastro de Novo Usuário
- **Objetivo:** Criar uma nova conta de usuário
- **Passos:**
  1. Clicar em "Cadastrar"
  2. Preencher nome, email, senha, CPF/CNPJ, telefone
  3. Submeter formulário
  4. Verificar redirecionamento para perfil
- **Resultado Esperado:** Usuário criado e logado automaticamente

#### Teste 3: Preenchimento de Dados Pessoais
- **Objetivo:** Preencher e salvar dados do perfil profissional
- **Passos:**
  1. Fazer login
  2. Preencher Nome Comercial, CRM, Bio, Instagram, Site
  3. Adicionar convênios
  4. Salvar dados
- **Resultado Esperado:** Dados salvos com sucesso

#### Teste 4: Adição de Especialidades
- **Objetivo:** Adicionar especialidades profissionais
- **Passos:**
  1. Fazer login
  2. Navegar para aba "Áreas de Atuação"
  3. Adicionar especialidades
  4. Configurar intervalo de consultas
  5. Salvar
- **Resultado Esperado:** Especialidades salvas corretamente

#### Teste 5: Adição de Local de Atendimento
- **Objetivo:** Cadastrar local de atendimento
- **Passos:**
  1. Fazer login
  2. Navegar para "Locais de Atendimento"
  3. Adicionar local com nome, endereço, CEP, cidade
  4. Salvar
- **Resultado Esperado:** Local cadastrado com sucesso

#### Teste 6: Configuração de Políticas
- **Objetivo:** Configurar políticas de cancelamento e reagendamento
- **Passos:**
  1. Fazer login
  2. Navegar para aba "Políticas"
  3. Configurar políticas de cancelamento
  4. Configurar políticas de reagendamento
  5. Configurar políticas de faltas
  6. Salvar
- **Resultado Esperado:** Políticas configuradas e salvas

#### Teste 7: Alteração de Dados
- **Objetivo:** Modificar dados e verificar persistência
- **Passos:**
  1. Fazer login
  2. Alterar campo Bio
  3. Salvar
  4. Recarregar página
  5. Verificar se alteração foi mantida
- **Resultado Esperado:** Alterações persistidas corretamente

#### Teste 8: Logout e Persistência
- **Objetivo:** Verificar persistência após logout/login
- **Passos:**
  1. Fazer login
  2. Fazer logout
  3. Fazer login novamente
  4. Verificar se dados foram carregados
- **Resultado Esperado:** Todos os dados carregados corretamente

#### Teste 9: Verificação de Convênios
- **Objetivo:** Confirmar que convênios foram salvos
- **Passos:**
  1. Fazer login
  2. Verificar presença de todos os convênios adicionados
- **Resultado Esperado:** Todos os convênios visíveis

#### Teste 10: Verificação de Especialidades
- **Objetivo:** Confirmar que especialidades foram salvas
- **Passos:**
  1. Fazer login
  2. Navegar para "Áreas de Atuação"
  3. Verificar presença de todas as especialidades
- **Resultado Esperado:** Todas as especialidades visíveis

## Testes Manuais

### Pré-requisitos
1. Node.js instalado (https://nodejs.org/)
2. Navegador moderno (Chrome, Firefox, Edge)
3. Acesso à internet (para Supabase)

### Configuração do Ambiente

1. Instalar dependências:
```bash
npm install
```

2. Iniciar servidor de desenvolvimento:
```bash
npm run dev
```

3. Acessar aplicação:
- URL: http://localhost:5173

### Roteiro de Testes Manuais

#### 1. Teste de Cadastro

**Objetivo:** Criar uma nova conta de usuário

**Passos:**
1. Acessar http://localhost:5173
2. Clicar no botão "Cadastrar"
3. Preencher o formulário:
   - Nome: "Dr. João Silva"
   - Email: "seu-email@exemplo.com"
   - Senha: "SenhaSegura123!"
   - CPF/CNPJ: "12345678901"
   - Telefone: "(19) 99999-9999"
4. Clicar em "Cadastrar"

**Resultado Esperado:**
- Redirecionamento para página de perfil
- Mensagem de sucesso no console do navegador (F12)
- Usuário logado automaticamente

**Como Verificar:**
- Abrir DevTools (F12) → Console
- Procurar por: "✅ Usuário criado no Auth"
- Verificar presença de "✅ Dados inseridos na tabela users"

---

#### 2. Teste de Login

**Objetivo:** Fazer login com usuário existente

**Passos:**
1. Se estiver logado, fazer logout primeiro
2. Clicar em "Login"
3. Preencher:
   - Email: email cadastrado anteriormente
   - Senha: senha cadastrada
4. Clicar em "Entrar"

**Resultado Esperado:**
- Redirecionamento para perfil
- Dados do usuário carregados

**Como Verificar:**
- Console: "✅ Login realizado com sucesso"
- Console: "✅ Usuário encontrado na tabela users"

---

#### 3. Teste de Preenchimento de Perfil

**Objetivo:** Preencher todos os dados do perfil profissional

**Passos:**
1. Fazer login
2. Na aba "Dados Pessoais", preencher:
   - Nome Comercial: "Clínica João Silva"
   - CRM/CRP/CRO: "CRM 123456-SP"
   - Celular Corporativo: "(19) 98888-8888"
   - Instagram: "@drjoaosilva"
   - Site: "https://drjoaosilva.com.br"
   - Bio: "Psicólogo especializado em TCC..."
   - Área de Saúde: Selecionar "Psicólogo"
   - Forma de Atendimento: Selecionar "Online e Presencial"

3. Adicionar Convênios:
   - Digitar "Unimed" e clicar "Adicionar"
   - Digitar "Bradesco Saúde" e clicar "Adicionar"
   - Digitar "Amil" e clicar "Adicionar"

4. Clicar em "Salvar"

**Resultado Esperado:**
- Console: "💾 Salvando dados pessoais"
- Console: "✅ Convênios salvos com sucesso!"
- Mensagem de sucesso na tela

**Como Verificar:**
- Recarregar página (F5)
- Verificar se todos os dados foram mantidos
- Console deve mostrar: "📋 Dados carregados com sucesso!"

---

#### 4. Teste de Especialidades

**Objetivo:** Adicionar especialidades profissionais

**Passos:**
1. Clicar na aba "Áreas de Atuação"
2. Adicionar especialidades:
   - Digitar "Ansiedade" e clicar "Adicionar"
   - Digitar "Depressão" e clicar "Adicionar"
   - Digitar "Terapia de Casal" e clicar "Adicionar"
3. Configurar intervalo entre consultas: "15 minutos"
4. Clicar em "Salvar"

**Resultado Esperado:**
- Console: "✅ Especialidades salvas com sucesso!"
- Console: "✅ Intervalo de consultas atualizado!"

**Como Verificar:**
- Mudar de aba e voltar
- Verificar se especialidades continuam visíveis
- Verificar intervalo de consultas mantido

---

#### 5. Teste de Locais de Atendimento

**Objetivo:** Cadastrar local de atendimento

**Passos:**
1. Clicar na aba "Locais de Atendimento"
2. Clicar em "Adicionar Local"
3. Preencher:
   - Nome do Local: "Consultório Centro"
   - Endereço: "Rua das Flores, 123 - Sala 45"
   - CEP: "13010-000"
   - Cidade: "Campinas"
4. Clicar em "Salvar"

**Resultado Esperado:**
- Console: "✅ Locais salvos com sucesso!"

**Como Verificar:**
- Recarregar página
- Verificar se local continua cadastrado
- Console: "📍 Carregando locais"

---

#### 6. Teste de Políticas

**Objetivo:** Configurar políticas de cancelamento e reagendamento

**Passos:**
1. Clicar na aba "Políticas"
2. Configurar Cancelamento:
   - Prazo mínimo: "48 horas"
   - Marcar "Cobra multa"
   - Percentual da multa: "30%"
3. Configurar Reagendamento:
   - Marcar "Permitido"
   - Prazo mínimo: "24 horas"
   - Limite de reagendamentos: "3"
4. Configurar Faltas:
   - Marcar "Cobra falta"
   - Percentual de cobrança: "50%"
   - Tolerância de atraso: "10 minutos"
5. Clicar em "Salvar"

**Resultado Esperado:**
- Console: "✅ Políticas salvas com sucesso!" ou "✅ Políticas atualizadas com sucesso!"

**Como Verificar:**
- Recarregar página
- Verificar se todas as configurações foram mantidas

---

#### 7. Teste de Alteração de Dados

**Objetivo:** Modificar dados já salvos

**Passos:**
1. Ir para aba "Dados Pessoais"
2. Alterar Bio para: "Bio atualizada - Especialista em saúde mental"
3. Alterar Nome Comercial
4. Remover um convênio (clicar no X)
5. Adicionar novo convênio
6. Clicar em "Salvar"
7. Recarregar página (F5)

**Resultado Esperado:**
- Todas as alterações mantidas após reload
- Console mostra carregamento correto dos dados

**Como Verificar:**
- Verificar cada campo alterado
- Verificar que convênio removido não aparece
- Verificar que novo convênio aparece

---

#### 8. Teste de Logout e Persistência

**Objetivo:** Verificar se dados persistem após logout

**Passos:**
1. Estando logado com dados preenchidos
2. Clicar em "Sair" ou botão de logout
3. Verificar redirecionamento para landing page
4. Fazer login novamente
5. Verificar se todos os dados foram carregados

**Resultado Esperado:**
- Todos os dados carregados corretamente:
  - Dados pessoais
  - Convênios
  - Especialidades
  - Locais
  - Políticas

**Como Verificar:**
- Navegar por todas as abas
- Console mostra carregamento de cada seção:
  - "📝 Carregando dados pessoais"
  - "🏥 Carregando especialidades"
  - "📍 Carregando locais"
  - "📋 Carregando políticas"

---

#### 9. Teste de Remoção de Dados

**Objetivo:** Verificar remoção de especialidades, convênios e locais

**Passos:**
1. Remover uma especialidade (clicar no X)
2. Remover um convênio
3. Remover um local de atendimento
4. Salvar
5. Recarregar página

**Resultado Esperado:**
- Itens removidos não aparecem mais
- Console confirma salvamento

---

#### 10. Teste de Múltiplos Locais

**Objetivo:** Adicionar vários locais de atendimento

**Passos:**
1. Ir para "Locais de Atendimento"
2. Adicionar 3 locais diferentes
3. Salvar
4. Recarregar
5. Verificar se todos os locais foram salvos

**Resultado Esperado:**
- Todos os locais aparecem após reload
- Cada local mantém seus dados individuais

---

## Estrutura do Banco de Dados (Supabase)

### Tabelas Criadas/Utilizadas

1. **users**
   - id (PK, UUID)
   - nome
   - email
   - telefone
   - cpf_cnpj
   - created_at

2. **professionals**
   - id (PK, auto-increment)
   - user_id (FK → users.id)
   - nome_comercial
   - crm_crp_cro
   - celular_corporativo
   - instagram
   - site
   - area_saude
   - bio
   - forma_atendimento
   - intervalo_consultas

3. **professional_convenios**
   - id (PK, auto-increment)
   - professional_id (FK → professionals.id)
   - nome

4. **professional_especialidades**
   - id (PK, auto-increment)
   - professional_id (FK → professionals.id)
   - nome

5. **professional_locais**
   - id (PK, auto-increment)
   - professional_id (FK → professionals.id)
   - nome
   - endereco
   - cep
   - cidade
   - especialidades (JSONB)
   - horarios (JSONB)

6. **professional_politicas**
   - id (PK, auto-increment)
   - professional_id (FK → professionals.id)
   - cancelamento_prazo_minimo
   - cancelamento_cobra_multa
   - cancelamento_percentual_multa
   - cancelamento_permitido
   - reagendamento_permitido
   - reagendamento_prazo_minimo
   - reagendamento_limite
   - faltas_cobra
   - faltas_percentual_cobranca
   - faltas_tolerancia_atraso

## Troubleshooting

### Erro: "npm: command not found"
**Solução:** Instale o Node.js de https://nodejs.org/

### Erro: "Cannot find module @playwright/test"
**Solução:** Execute `npm install` e depois `npx playwright install`

### Erro no Supabase: "Invalid API key"
**Solução:** Verifique as credenciais em [supabaseClient.js](src/supabaseClient.js)

### Dados não salvam
**Solução:**
1. Abra o console (F12)
2. Verifique erros em vermelho
3. Verifique se as tabelas existem no Supabase
4. Verifique permissões RLS (Row Level Security) no Supabase

### Testes falham no Playwright
**Solução:**
1. Verifique se o servidor dev está rodando (`npm run dev`)
2. Verifique seletores no teste
3. Aumente timeouts se necessário
4. Execute com `--headed` para ver o navegador

## Melhorias Futuras

- [ ] Testes de validação de formulários
- [ ] Testes de upload de imagens
- [ ] Testes de horários de atendimento
- [ ] Testes de integração com calendário
- [ ] Testes de performance
- [ ] Testes de acessibilidade
- [ ] Testes de responsividade mobile
- [ ] CI/CD com GitHub Actions

## Contato e Suporte

Para reportar bugs ou sugerir melhorias, abra uma issue no repositório do projeto.
