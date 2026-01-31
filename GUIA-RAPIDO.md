# Guia Rápido - Testar a Aplicação

## Início Rápido (3 passos)

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar Aplicação
```bash
npm run dev
```

A aplicação estará disponível em: http://localhost:5173

### 3. Testar Manualmente

Abra http://localhost:5173 no navegador e siga:

1. **Cadastrar** → Preencha o formulário → Clique "Cadastrar"
2. **Perfil** → Preencha seus dados → Adicione convênios → Clique "Salvar"
3. **Áreas de Atuação** → Adicione especialidades → Clique "Salvar"
4. **Locais** → Adicione local → Clique "Salvar"
5. **Políticas** → Configure políticas → Clique "Salvar"
6. **Recarregue a página (F5)** → Verifique se dados foram mantidos

## Testes Automatizados

### Instalar Playwright
```bash
npx playwright install
```

### Executar Testes
```bash
# Todos os testes
npm test

# Com interface visual
npm run test:ui

# Ver navegador executando
npm run test:headed

# Ver relatório
npm run test:report
```

## Checklist de Testes Manuais

- [ ] Cadastro funciona
- [ ] Login funciona
- [ ] Dados pessoais salvam
- [ ] Convênios salvam
- [ ] Especialidades salvam
- [ ] Locais salvam
- [ ] Políticas salvam
- [ ] Dados persistem após reload
- [ ] Logout funciona
- [ ] Login carrega dados salvos

## Console do Navegador (F12)

Mensagens esperadas após salvar:
- ✅ "Dados salvos com sucesso"
- ✅ "Convênios salvos com sucesso!"
- ✅ "Especialidades salvas com sucesso!"
- ✅ "Locais salvos com sucesso!"
- ✅ "Políticas salvas com sucesso!"

Se aparecer ❌, verifique o erro e consulte [TESTES.md](TESTES.md) para troubleshooting.

## Funcionalidades Implementadas

### ✅ Completas
- [x] Cadastro de usuário
- [x] Login/Logout
- [x] Dados pessoais do profissional
- [x] Convênios (adicionar, remover, salvar, carregar)
- [x] Especialidades (adicionar, remover, salvar, carregar)
- [x] Locais de atendimento (adicionar, remover, salvar, carregar)
- [x] Políticas de cancelamento/reagendamento (salvar, carregar)
- [x] Persistência de dados
- [x] Carregamento de dados após login

### 📝 Arquivos Modificados

#### Implementações
- [profileService.js](src/profileService.js) - Funções completas de salvar/carregar
  - `saveConvenios()` - Linha 238
  - `saveEspecialidades()` - Linha 284
  - `saveLocais()` - Linha 351
  - `savePoliticas()` - Linha 402
  - `loadProfessionalData()` - Atualizada linha 4

#### Testes
- [playwright.config.js](playwright.config.js) - Configuração Playwright
- [tests/e2e.spec.js](tests/e2e.spec.js) - 10 testes automatizados
- [package.json](package.json) - Scripts de teste adicionados

#### Documentação
- [TESTES.md](TESTES.md) - Documentação completa
- [GUIA-RAPIDO.md](GUIA-RAPIDO.md) - Este arquivo

## Problemas Comuns

### Erro: "npm: command not found"
→ Instale Node.js: https://nodejs.org/

### Servidor não inicia
→ Verifique se porta 5173 está livre
→ Tente: `npm run dev -- --port 3000`

### Dados não salvam
→ Abra console (F12) e veja o erro
→ Verifique conexão com Supabase
→ Consulte [TESTES.md](TESTES.md) seção Troubleshooting

### Testes automatizados falham
→ Certifique-se que servidor está rodando
→ Execute: `npm run test:headed` para ver o que acontece

## Próximos Passos

Após testar, você pode:
1. Implementar funcionalidades adicionais
2. Melhorar a UI/UX
3. Adicionar validações de formulário
4. Implementar sistema de agendamento
5. Adicionar funcionalidade de horários por local

Para mais detalhes, consulte [TESTES.md](TESTES.md)
