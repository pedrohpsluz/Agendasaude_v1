#!/bin/bash

# ==================================================
# SCRIPT DE VERIFICAÇÃO - IMPLEMENTAÇÃO COMPLETA
# ==================================================

echo "🔍 Verificando implementação da Agenda Saúde..."
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de verificações
PASS=0
FAIL=0

# Função para verificar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ $1${NC}"
        ((FAIL++))
    fi
}

# ==================================================
# 1. VERIFICAR ARQUIVOS CRIADOS
# ==================================================
echo "📁 Verificando arquivos criados..."

test -f "tests/e2e.spec.js"
check "Arquivo de testes E2E existe"

test -f "playwright.config.js"
check "Configuração do Playwright existe"

test -f "TESTES.md"
check "Documentação de testes existe"

test -f "GUIA-RAPIDO.md"
check "Guia rápido existe"

test -f "database-schema.sql"
check "Schema SQL existe"

test -f "CHECKLIST-VERIFICACAO.md"
check "Checklist de verificação existe"

echo ""

# ==================================================
# 2. VERIFICAR FUNÇÕES IMPLEMENTADAS
# ==================================================
echo "🔧 Verificando funções implementadas..."

grep -q "export async function saveConvenios" src/profileService.js
check "Função saveConvenios implementada"

grep -q "export async function saveEspecialidades" src/profileService.js
check "Função saveEspecialidades implementada"

grep -q "export async function saveLocais" src/profileService.js
check "Função saveLocais implementada"

grep -q "export async function savePoliticas" src/profileService.js
check "Função savePoliticas implementada"

echo ""

# ==================================================
# 3. VERIFICAR CARREGAMENTO DE DADOS
# ==================================================
echo "📥 Verificando carregamento de dados..."

grep -q "professional_convenios" src/profileService.js
check "Carregamento de convênios implementado"

grep -q "professional_especialidades" src/profileService.js
check "Carregamento de especialidades implementado"

grep -q "professional_locais" src/profileService.js
check "Carregamento de locais implementado"

grep -q "professional_politicas" src/profileService.js
check "Carregamento de políticas implementado"

echo ""

# ==================================================
# 4. VERIFICAR PACKAGE.JSON
# ==================================================
echo "📦 Verificando package.json..."

grep -q "@playwright/test" package.json
check "Playwright adicionado às dependências"

grep -q "\"test\":" package.json
check "Script de teste adicionado"

grep -q "\"test:ui\":" package.json
check "Script test:ui adicionado"

grep -q "\"test:headed\":" package.json
check "Script test:headed adicionado"

grep -q "\"test:report\":" package.json
check "Script test:report adicionado"

echo ""

# ==================================================
# 5. VERIFICAR ESTRUTURA DE TESTES
# ==================================================
echo "🧪 Verificando estrutura de testes..."

grep -q "Deve carregar a página inicial" tests/e2e.spec.js
check "Teste 1: Carregamento da página"

grep -q "Deve realizar cadastro" tests/e2e.spec.js
check "Teste 2: Cadastro de usuário"

grep -q "Deve preencher dados pessoais" tests/e2e.spec.js
check "Teste 3: Dados pessoais"

grep -q "Deve adicionar especialidades" tests/e2e.spec.js
check "Teste 4: Especialidades"

grep -q "Deve adicionar local de atendimento" tests/e2e.spec.js
check "Teste 5: Locais"

grep -q "Deve configurar políticas" tests/e2e.spec.js
check "Teste 6: Políticas"

grep -q "Deve alterar dados salvos" tests/e2e.spec.js
check "Teste 7: Alteração de dados"

grep -q "Deve fazer logout" tests/e2e.spec.js
check "Teste 8: Logout e persistência"

grep -q "Verificar todos os convênios" tests/e2e.spec.js
check "Teste 9: Verificação de convênios"

grep -q "Verificar todas as especialidades" tests/e2e.spec.js
check "Teste 10: Verificação de especialidades"

echo ""

# ==================================================
# 6. VERIFICAR TRATAMENTO DE ERROS
# ==================================================
echo "🛡️ Verificando tratamento de erros..."

grep -q "try {" src/profileService.js
check "Blocos try-catch implementados"

grep -q "catch (error)" src/profileService.js
check "Tratamento de erros implementado"

grep -q "console.error" src/profileService.js
check "Logs de erro implementados"

echo ""

# ==================================================
# 7. VERIFICAR LOGS DE DEBUG
# ==================================================
echo "📝 Verificando logs de debug..."

grep -q "Salvando" src/profileService.js
check "Logs de salvamento implementados"

grep -q "sucesso" src/profileService.js
check "Logs de sucesso implementados"

grep -q "console.error" src/profileService.js
check "Logs de erro implementados"

echo ""

# ==================================================
# RESUMO
# ==================================================
echo "=================================================="
echo "RESUMO DA VERIFICAÇÃO"
echo "=================================================="
echo -e "${GREEN}✅ Verificações passadas: $PASS${NC}"

if [ $FAIL -gt 0 ]; then
    echo -e "${RED}❌ Verificações falhas: $FAIL${NC}"
    echo ""
    echo -e "${YELLOW}⚠️ Algumas verificações falharam. Revise os itens acima.${NC}"
    exit 1
else
    echo -e "${GREEN}❌ Verificações falhas: 0${NC}"
    echo ""
    echo -e "${GREEN}🎉 TODAS AS VERIFICAÇÕES PASSARAM!${NC}"
    echo ""
    echo "📋 Próximos passos:"
    echo "  1. Instale as dependências: npm install"
    echo "  2. Instale o Playwright: npx playwright install"
    echo "  3. Execute os testes: npm test"
    echo "  4. OU inicie o servidor: npm run dev"
    echo ""
    echo "📚 Consulte a documentação:"
    echo "  - GUIA-RAPIDO.md - Guia de início rápido"
    echo "  - TESTES.md - Documentação completa"
    echo "  - CHECKLIST-VERIFICACAO.md - Status da implementação"
    echo ""
fi

exit 0
