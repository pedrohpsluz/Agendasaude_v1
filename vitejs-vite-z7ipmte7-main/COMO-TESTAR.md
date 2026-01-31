# 🚀 Como Testar a Aplicação - Passo a Passo

## ✅ Verificação Automática

Execute o script de verificação para confirmar que tudo está implementado:

```bash
./verificar-implementacao.sh
```

**Resultado esperado:** 35/35 verificações passadas ✅

---

## 📋 Opção 1: Testes Manuais (RECOMENDADO para primeira vez)

### Passo 1: Instalar Node.js
Se ainda não tem instalado:
1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (Long Term Support)
3. Execute o instalador e siga as instruções
4. Reinicie o terminal

Verifique a instalação:
```bash
node --version   # Deve mostrar v18.x.x ou superior
npm --version    # Deve mostrar 9.x.x ou superior
```

### Passo 2: Instalar Dependências
```bash
npm install
```

Aguarde a instalação (pode levar alguns minutos).

### Passo 3: Iniciar o Servidor
```bash
npm run dev
```

Você verá algo como:
```
VITE v7.3.0  ready in 500 ms

➜  Local:   http://localhost:5173/
```

### Passo 4: Abrir no Navegador
Acesse: **http://localhost:5173**

### Passo 5: Seguir o Roteiro de Teste

#### 5.1 - Cadastro
1. Clique em **"Cadastrar"**
2. Preencha:
   - Nome: "Dr. João Silva"
   - Email: "seu-email@teste.com"
   - Senha: "SenhaSegura123!"
   - CPF/CNPJ: "12345678901"
   - Telefone: "(19) 99999-9999"
3. Clique em **"Cadastrar"**
4. ✅ Deve redirecionar para página de perfil

#### 5.2 - Dados Pessoais
1. Na aba **"Dados Pessoais"**, preencha:
   - Nome Comercial: "Clínica João Silva"
   - CRM/CRP/CRO: "CRM 123456-SP"
   - Bio: "Psicólogo especializado em TCC..."
   - Instagram: "@drjoaosilva"
   - Site: "https://drjoaosilva.com.br"

2. Adicione convênios:
   - Digite "Unimed" → Clique "Adicionar"
   - Digite "Bradesco Saúde" → Clique "Adicionar"
   - Digite "Amil" → Clique "Adicionar"

3. Clique em **"Salvar"**
4. ✅ Abra o console (F12) e verifique: "✅ Convênios salvos com sucesso!"

#### 5.3 - Especialidades
1. Clique na aba **"Áreas de Atuação"**
2. Adicione:
   - "Ansiedade"
   - "Depressão"
   - "Terapia de Casal"
3. Configure intervalo: "15 minutos"
4. Clique em **"Salvar"**
5. ✅ Console: "✅ Especialidades salvas com sucesso!"

#### 5.4 - Locais de Atendimento
1. Clique na aba **"Locais de Atendimento"**
2. Clique **"Adicionar Local"**
3. Preencha:
   - Nome: "Consultório Centro"
   - Endereço: "Rua das Flores, 123 - Sala 45"
   - CEP: "13010-000"
   - Cidade: "Campinas"
4. Clique em **"Salvar"**
5. ✅ Console: "✅ Locais salvos com sucesso!"

#### 5.5 - Políticas
1. Clique na aba **"Políticas"**
2. Configure:
   - Cancelamento: 48 horas, multa 30%
   - Reagendamento: permitido, 24 horas, limite 3
   - Faltas: cobra 50%, tolerância 10 min
3. Clique em **"Salvar"**
4. ✅ Console: "✅ Políticas salvas com sucesso!"

#### 5.6 - Teste de Persistência
1. **Recarregue a página (F5)**
2. ✅ Verifique se todos os dados foram mantidos
3. ✅ Console deve mostrar: "📋 Dados carregados com sucesso!"

#### 5.7 - Teste de Logout/Login
1. Clique em **"Sair"** (botão de logout)
2. Faça login novamente com o mesmo email/senha
3. ✅ Todos os dados devem ser carregados
4. ✅ Navegue por todas as abas e confirme os dados

### Console do Navegador (F12)

Durante os testes, monitore o console:

**Mensagens de Sucesso (✅):**
- ✅ Usuário criado no Auth
- ✅ Dados inseridos na tabela users
- ✅ Login realizado com sucesso
- ✅ Convênios salvos com sucesso!
- ✅ Especialidades salvas com sucesso!
- ✅ Locais salvos com sucesso!
- ✅ Políticas salvas/atualizadas com sucesso!

**Mensagens de Erro (❌):**
Se aparecer algum erro, consulte [TESTES.md](TESTES.md) seção Troubleshooting.

---

## 🤖 Opção 2: Testes Automatizados

### Passo 1: Instalar Playwright
```bash
npm install
npx playwright install
```

### Passo 2: Executar Testes

#### Modo Headless (sem ver navegador)
```bash
npm test
```

#### Modo UI (interface visual - RECOMENDADO)
```bash
npm run test:ui
```

#### Modo Headed (ver navegador executando)
```bash
npm run test:headed
```

#### Ver Relatório
```bash
npm run test:report
```

### O que os testes cobrem:
1. ✅ Carregamento da página inicial
2. ✅ Cadastro de novo usuário
3. ✅ Preenchimento de dados pessoais + convênios
4. ✅ Adição de especialidades
5. ✅ Adição de locais
6. ✅ Configuração de políticas
7. ✅ Alteração e persistência de dados
8. ✅ Logout e novo login
9. ✅ Verificação de convênios salvos
10. ✅ Verificação de especialidades salvas

---

## 📊 Checklist de Verificação

Use este checklist durante os testes:

### Funcionalidades Básicas
- [ ] Cadastro funciona
- [ ] Login funciona
- [ ] Logout funciona

### Dados Pessoais
- [ ] Salva nome comercial
- [ ] Salva CRM/CRP/CRO
- [ ] Salva bio
- [ ] Salva Instagram e Site
- [ ] Salva convênios
- [ ] Convênios carregam após reload

### Especialidades
- [ ] Adiciona especialidades
- [ ] Remove especialidades
- [ ] Salva intervalo de consultas
- [ ] Especialidades carregam após reload

### Locais
- [ ] Adiciona locais
- [ ] Remove locais
- [ ] Salva todos os campos (nome, endereço, CEP, cidade)
- [ ] Locais carregam após reload

### Políticas
- [ ] Salva políticas de cancelamento
- [ ] Salva políticas de reagendamento
- [ ] Salva políticas de faltas
- [ ] Políticas carregam após reload

### Persistência
- [ ] Dados mantidos após reload (F5)
- [ ] Dados mantidos após logout/login
- [ ] Alterações são salvas corretamente

---

## 🐛 Problemas Comuns

### "npm: command not found"
**Solução:** Instale o Node.js (ver Passo 1)

### "Cannot find module"
**Solução:** Execute `npm install` novamente

### "Port 5173 is already in use"
**Solução:**
```bash
npm run dev -- --port 3000
```

### Dados não salvam
**Solução:**
1. Abra o console (F12)
2. Veja o erro exato
3. Verifique se as tabelas existem no Supabase
4. Execute o [database-schema.sql](database-schema.sql) no Supabase

### Testes Playwright falham
**Solução:**
1. Certifique-se que `npm run dev` está rodando
2. Execute com `npm run test:headed` para ver o que acontece
3. Verifique os seletores no [tests/e2e.spec.js](tests/e2e.spec.js)

---

## 📚 Documentação Completa

- **[GUIA-RAPIDO.md](GUIA-RAPIDO.md)** - Início rápido (3 minutos)
- **[TESTES.md](TESTES.md)** - Documentação completa de testes
- **[CHECKLIST-VERIFICACAO.md](CHECKLIST-VERIFICACAO.md)** - Status da implementação
- **[database-schema.sql](database-schema.sql)** - Schema do banco de dados

---

## ✨ Resumo

**Implementação:** ✅ 100% Completa
**Testes:** ✅ 10 testes automatizados
**Documentação:** ✅ Completa
**Verificações:** ✅ 35/35 passadas

**Pronto para testar!** 🚀

Qualquer dúvida, consulte a documentação ou verifique o console do navegador (F12).
