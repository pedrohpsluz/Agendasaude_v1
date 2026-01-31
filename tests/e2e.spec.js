import { test, expect } from '@playwright/test';

// Dados de teste
const testUser = {
  nome: 'Dr. João Silva',
  email: `teste${Date.now()}@exemplo.com`, // Email único para cada execução
  senha: 'SenhaSegura123!',
  cpfCnpj: '12345678901',
  telefone: '(19) 99999-9999',
};

const profileData = {
  nomeComercial: 'Clínica João Silva',
  crm: 'CRM 123456-SP',
  bio: 'Psicólogo especializado em terapia cognitivo-comportamental com mais de 10 anos de experiência.',
  instagram: '@drjoaosilva',
  site: 'https://drjoaosilva.com.br',
  celularCorporativo: '(19) 98888-8888',
  convenios: ['Unimed', 'Bradesco Saúde', 'Amil'],
  especialidades: ['Ansiedade', 'Depressão', 'Terapia de Casal'],
  intervaloConsultas: '15',
  local: {
    nome: 'Consultório Centro',
    endereco: 'Rua das Flores, 123 - Sala 45',
    cep: '13010-000',
    cidade: 'Campinas',
  },
  politicas: {
    cancelamento: {
      prazoMinimo: '48',
      percentualMulta: '30',
    },
    reagendamento: {
      prazoMinimo: '24',
      limiteReagendamentos: '3',
    },
    faltas: {
      percentualCobranca: '50',
      toleranciaAtraso: '10',
    },
  },
};

test.describe('Agenda Saúde - Testes E2E Completos', () => {
  test.describe.configure({ mode: 'serial' });

  test('1. Deve carregar a página inicial corretamente', async ({ page }) => {
    await page.goto('/');

    // Verificar se a página carregou
    await expect(page).toHaveTitle(/Vite \+ React/);

    // Verificar elementos da landing page
    await expect(page.locator('text=Agenda Saúde')).toBeVisible({ timeout: 10000 });
  });

  test('2. Deve realizar cadastro de novo usuário com sucesso', async ({ page }) => {
    await page.goto('/');

    // Clicar no botão de cadastro
    await page.click('text=Cadastrar', { timeout: 10000 });

    // Aguardar o formulário aparecer
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });

    // Preencher formulário de cadastro
    await page.fill('input[placeholder*="Nome"]', testUser.nome);
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.senha);
    await page.fill('input[placeholder*="CPF"]', testUser.cpfCnpj);
    await page.fill('input[placeholder*="Telefone"]', testUser.telefone);

    // Submeter formulário
    await page.click('button[type="submit"]');

    // Verificar redirecionamento para página de perfil
    await expect(page.locator('text=Perfil Profissional')).toBeVisible({ timeout: 15000 });

    console.log('✅ Cadastro realizado com sucesso!');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Senha:', testUser.senha);
  });

  test('3. Deve preencher dados pessoais do perfil', async ({ page }) => {
    await page.goto('/');

    // Fazer login primeiro
    await page.click('text=Login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.senha);
    await page.click('button[type="submit"]');

    // Aguardar carregar perfil
    await page.waitForSelector('text=Perfil Profissional', { timeout: 15000 });

    // Preencher dados pessoais
    await page.fill('input[placeholder*="Nome Comercial"]', profileData.nomeComercial);
    await page.fill('input[placeholder*="CRM"]', profileData.crm);
    await page.fill('textarea[placeholder*="Bio"]', profileData.bio);
    await page.fill('input[placeholder*="Instagram"]', profileData.instagram);
    await page.fill('input[placeholder*="Site"]', profileData.site);
    await page.fill('input[placeholder*="Celular Corporativo"]', profileData.celularCorporativo);

    // Adicionar convênios
    for (const convenio of profileData.convenios) {
      await page.fill('input[placeholder*="convenio"]', convenio);
      await page.click('button:has-text("Adicionar")');
      await page.waitForTimeout(500);
    }

    // Salvar dados pessoais
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(2000);

    console.log('✅ Dados pessoais preenchidos!');
  });

  test('4. Deve adicionar especialidades', async ({ page }) => {
    await page.goto('/');

    // Login
    await page.click('text=Login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.senha);
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Perfil Profissional', { timeout: 15000 });

    // Navegar para aba de especialidades
    await page.click('text=Áreas de Atuação');
    await page.waitForTimeout(1000);

    // Adicionar especialidades
    for (const especialidade of profileData.especialidades) {
      await page.fill('input[placeholder*="especialidade"]', especialidade);
      await page.click('button:has-text("Adicionar")');
      await page.waitForTimeout(500);
    }

    // Configurar intervalo de consultas
    await page.fill('input[placeholder*="Intervalo"]', profileData.intervaloConsultas);

    // Salvar
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(2000);

    console.log('✅ Especialidades adicionadas!');
  });

  test('5. Deve adicionar local de atendimento', async ({ page }) => {
    await page.goto('/');

    // Login
    await page.click('text=Login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.senha);
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Perfil Profissional', { timeout: 15000 });

    // Navegar para aba de locais
    await page.click('text=Locais de Atendimento');
    await page.waitForTimeout(1000);

    // Adicionar local
    await page.click('button:has-text("Adicionar Local")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="Nome do local"]', profileData.local.nome);
    await page.fill('input[placeholder*="Endereço"]', profileData.local.endereco);
    await page.fill('input[placeholder*="CEP"]', profileData.local.cep);
    await page.fill('input[placeholder*="Cidade"]', profileData.local.cidade);

    // Salvar
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(2000);

    console.log('✅ Local de atendimento adicionado!');
  });

  test('6. Deve configurar políticas de cancelamento e reagendamento', async ({ page }) => {
    await page.goto('/');

    // Login
    await page.click('text=Login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.senha);
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Perfil Profissional', { timeout: 15000 });

    // Navegar para aba de políticas
    await page.click('text=Políticas');
    await page.waitForTimeout(1000);

    // Configurar políticas de cancelamento
    const prazoMinimoCancelamento = page.locator('input[placeholder*="Prazo mínimo"]').first();
    await prazoMinimoCancelamento.fill(profileData.politicas.cancelamento.prazoMinimo);

    const percentualMulta = page.locator('input[placeholder*="Percentual"]').first();
    await percentualMulta.fill(profileData.politicas.cancelamento.percentualMulta);

    // Configurar políticas de reagendamento
    const prazoMinimoReagendamento = page.locator('input[placeholder*="Prazo mínimo"]').nth(1);
    await prazoMinimoReagendamento.fill(profileData.politicas.reagendamento.prazoMinimo);

    const limiteReagendamentos = page.locator('input[placeholder*="Limite"]');
    await limiteReagendamentos.fill(profileData.politicas.reagendamento.limiteReagendamentos);

    // Configurar políticas de faltas
    const percentualCobranca = page.locator('input[placeholder*="Percentual"]').nth(1);
    await percentualCobranca.fill(profileData.politicas.faltas.percentualCobranca);

    const toleranciaAtraso = page.locator('input[placeholder*="Tolerância"]');
    await toleranciaAtraso.fill(profileData.politicas.faltas.toleranciaAtraso);

    // Salvar
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(2000);

    console.log('✅ Políticas configuradas!');
  });

  test('7. Deve alterar dados salvos e persistir alterações', async ({ page }) => {
    await page.goto('/');

    // Login
    await page.click('text=Login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.senha);
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Perfil Profissional', { timeout: 15000 });

    // Alterar bio
    const newBio = 'Bio atualizada - Especialista em saúde mental e bem-estar.';
    const bioField = page.locator('textarea[placeholder*="Bio"]');
    await bioField.fill(newBio);

    // Salvar alteração
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(2000);

    // Recarregar página
    await page.reload();
    await page.waitForSelector('text=Perfil Profissional', { timeout: 15000 });

    // Verificar se a alteração foi persistida
    const bioAfterReload = await page.locator('textarea[placeholder*="Bio"]').inputValue();
    expect(bioAfterReload).toBe(newBio);

    console.log('✅ Alterações persistidas com sucesso!');
  });

  test('8. Deve fazer logout e verificar persistência após novo login', async ({ page }) => {
    await page.goto('/');

    // Login
    await page.click('text=Login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.senha);
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Perfil Profissional', { timeout: 15000 });

    // Fazer logout
    await page.click('button:has-text("Sair")');
    await page.waitForTimeout(1000);

    // Verificar redirecionamento para landing page
    await expect(page.locator('text=Agenda Saúde')).toBeVisible({ timeout: 10000 });

    // Fazer login novamente
    await page.click('text=Login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.senha);
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Perfil Profissional', { timeout: 15000 });

    // Verificar se os dados foram carregados
    await expect(page.locator(`text=${profileData.nomeComercial}`)).toBeVisible({ timeout: 5000 });

    console.log('✅ Dados persistidos após logout/login!');
  });

  test('9. Verificar todos os convênios salvos', async ({ page }) => {
    await page.goto('/');

    // Login
    await page.click('text=Login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.senha);
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Perfil Profissional', { timeout: 15000 });

    // Verificar se todos os convênios foram salvos
    for (const convenio of profileData.convenios) {
      await expect(page.locator(`text=${convenio}`)).toBeVisible({ timeout: 5000 });
    }

    console.log('✅ Todos os convênios foram salvos corretamente!');
  });

  test('10. Verificar todas as especialidades salvas', async ({ page }) => {
    await page.goto('/');

    // Login
    await page.click('text=Login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.senha);
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Perfil Profissional', { timeout: 15000 });

    // Navegar para aba de especialidades
    await page.click('text=Áreas de Atuação');
    await page.waitForTimeout(1000);

    // Verificar se todas as especialidades foram salvas
    for (const especialidade of profileData.especialidades) {
      await expect(page.locator(`text=${especialidade}`)).toBeVisible({ timeout: 5000 });
    }

    console.log('✅ Todas as especialidades foram salvas corretamente!');
  });
});
