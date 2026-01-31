import { supabase } from './supabaseClient';

// ==================== CARREGAR DADOS ====================
export async function loadProfessionalData(userId) {
  try {
    if (!userId) {
      return { success: false, error: 'ID de usuário não fornecido' };
    }

    console.log('🔍 Buscando dados para userId:', userId);

    // 1. Buscar dados do profissional
    const { data: professional, error: profError } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profError) {
      console.error('❌ Erro ao buscar profissional:', profError);
      return { success: false, error: profError.message };
    }

    console.log('📋 Profissional encontrado:', professional ? 'SIM' : 'NÃO');

    // 2. Buscar dados básicos da tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('nome, email, telefone, cpf_cnpj')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError);
    }

    console.log('📋 Dados do usuário:', userData);

    // Se não existe profissional ainda, retornar dados básicos
    if (!professional) {
      return {
        success: true,
        professionalId: null,
        data: {
          pessoais: {
            nome: userData?.nome || '',
            nomeComercial: '',
            email: userData?.email || '',
            telefone: userData?.telefone || '',
            celularCorporativo: '',
            instagram: '',
            site: '',
            cpfCnpj: userData?.cpf_cnpj || '',
            crm: '',
            areaSaude: 'Psicólogo',
            bio: '',
            formaAtendimento: 'Online e Presencial',
            convenios: [],
          },
          especialidades: [],
          locais: [],
          precos: [],
          politicas: {
            cancelamento: {
              prazoMinimo: '24',
              cobraMulta: true,
              percentualMulta: '50',
              permiteCancelamento: true,
            },
            reagendamento: {
              permitido: true,
              prazoMinimo: '12',
              limiteReagendamentos: '2',
            },
            faltas: {
              cobraFalta: true,
              percentualCobranca: '100',
              toleranciaAtraso: '15',
            },
          },
        },
      };
    }

    // Profissional existe - buscar dados relacionados

    // 3. Buscar convênios (com planos em JSON)
    const { data: conveniosData, error: conveniosError } = await supabase
      .from('professional_convenios')
      .select('*')
      .eq('professional_id', professional.id);

    if (conveniosError) {
      console.error('❌ Erro ao buscar convênios:', conveniosError);
    }

    const convenios = conveniosData
      ? conveniosData.map((c) => ({
          nome: c.nome,
          planos: c.planos || [],
        }))
      : [];

    // 4. Buscar especialidades
    const { data: especialidadesData, error: especialidadesError } = await supabase
      .from('professional_especialidades')
      .select('*')
      .eq('professional_id', professional.id);

    if (especialidadesError) {
      console.error('❌ Erro ao buscar especialidades:', especialidadesError);
    }

    const especialidades = especialidadesData
      ? especialidadesData.map((e) => ({
          nome: e.nome,
          duracao: e.duracao || '50',
          formaAtendimento: e.forma_atendimento || 'Presencial',
          convenios: e.convenios || [],
        }))
      : [];

    // 5. Buscar locais
    const { data: locaisData, error: locaisError } = await supabase
      .from('professional_locais')
      .select('*')
      .eq('professional_id', professional.id);

    if (locaisError) {
      console.error('❌ Erro ao buscar locais:', locaisError);
    }

    const locais = locaisData
      ? locaisData.map((l) => ({
          id: l.id,
          nome: l.nome,
          endereco: l.endereco || '',
          cep: l.cep || '',
          cidade: l.cidade || '',
          especialidades: l.especialidades || [],
          horarios: l.horarios || [],
        }))
      : [];

    // 6. Buscar preços
    const { data: precosData, error: precosError } = await supabase
      .from('professional_precos')
      .select('*')
      .eq('professional_id', professional.id);

    if (precosError) {
      console.error('❌ Erro ao buscar preços:', precosError);
    }

    const precos = precosData
      ? precosData.map((p) => ({
          local: p.local || '',
          especialidade: p.especialidade || '',
          valor: p.valor || '',
          formasPagamento: p.formas_pagamento || [],
          cobrancaNoAgendamento: p.cobranca_no_agendamento || false,
          percentualAdiantado: p.percentual_adiantado || '50',
          dadosBancarios: p.dados_bancarios || {
            banco: '',
            agencia: '',
            conta: '',
            tipoConta: 'Corrente',
            chavePix: '',
          },
        }))
      : [];

    // 7. Buscar políticas
    const { data: politicasData, error: politicasError } = await supabase
      .from('professional_politicas')
      .select('*')
      .eq('professional_id', professional.id)
      .maybeSingle();

    if (politicasError) {
      console.error('❌ Erro ao buscar políticas:', politicasError);
    }

    const politicas = politicasData
      ? {
          cancelamento: {
            prazoMinimo: politicasData.cancelamento_prazo_minimo || '24',
            cobraMulta: politicasData.cancelamento_cobra_multa ?? true,
            percentualMulta: politicasData.cancelamento_percentual_multa || '50',
            permiteCancelamento: politicasData.cancelamento_permitido ?? true,
          },
          reagendamento: {
            permitido: politicasData.reagendamento_permitido ?? true,
            prazoMinimo: politicasData.reagendamento_prazo_minimo || '12',
            limiteReagendamentos: politicasData.reagendamento_limite || '2',
          },
          faltas: {
            cobraFalta: politicasData.faltas_cobra ?? true,
            percentualCobranca: politicasData.faltas_percentual_cobranca || '100',
            toleranciaAtraso: politicasData.faltas_tolerancia_atraso || '15',
          },
        }
      : {
          cancelamento: {
            prazoMinimo: '24',
            cobraMulta: true,
            percentualMulta: '50',
            permiteCancelamento: true,
          },
          reagendamento: {
            permitido: true,
            prazoMinimo: '12',
            limiteReagendamentos: '2',
          },
          faltas: {
            cobraFalta: true,
            percentualCobranca: '100',
            toleranciaAtraso: '15',
          },
        };

    const pessoais = {
      nome: userData?.nome || professional.nome || '',
      nomeComercial: professional.nome_comercial || '',
      email: userData?.email || '',
      telefone: userData?.telefone || '',
      celularCorporativo: professional.celular_corporativo || '',
      instagram: professional.instagram || '',
      site: professional.site || '',
      cpfCnpj: userData?.cpf_cnpj || '',
      crm: professional.crm_crp_cro || '',
      areaSaude: professional.area_saude || 'Psicólogo',
      bio: professional.bio || '',
      formaAtendimento: professional.forma_atendimento || 'Online e Presencial',
      convenios: convenios,
    };

    return {
      success: true,
      professionalId: professional.id,
      data: {
        pessoais,
        especialidades: especialidades,
        intervaloConsultas: professional.intervalo_consultas || '10',
        locais: locais,
        precos: precos,
        politicas: politicas,
      },
    };
  } catch (error) {
    console.error('💥 Erro ao carregar dados:', error);
    return { success: false, error: error.message };
  }
}

// ==================== SALVAR DADOS PESSOAIS ====================
export async function saveProfessionalData(userId, pessoais) {
  try {
    if (!userId) {
      throw new Error('ID de usuário não fornecido');
    }

    console.log('💾 Salvando dados pessoais para userId:', userId);
    console.log('📦 Dados recebidos:', pessoais);

    // 1. Atualizar dados na tabela users
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        nome: pessoais.nome || '',
        telefone: pessoais.telefone || '',
        cpf_cnpj: pessoais.cpfCnpj || '',
      })
      .eq('id', userId);

    if (userUpdateError) {
      console.error('⚠️ Erro ao atualizar usuário:', userUpdateError);
      // Continuar mesmo com erro, pois pode ser problema de RLS
    }

    // 2. Verificar se já existe registro em professionals
    const { data: existingProf } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('🔍 Profissional existente:', existingProf ? 'SIM' : 'NÃO');

    // Preparar dados do profissional
    const professionalData = {
      user_id: userId,
      nome_comercial: pessoais.nomeComercial || '',
      crm_crp_cro: pessoais.crm || '',
      celular_corporativo: pessoais.celularCorporativo || '',
      instagram: pessoais.instagram || '',
      site: pessoais.site || '',
      area_saude: pessoais.areaSaude || 'Psicólogo',
      bio: pessoais.bio || '',
      forma_atendimento: pessoais.formaAtendimento || 'Online e Presencial',
    };

    console.log('📦 Dados do profissional a salvar:', professionalData);

    let professionalId;

    if (existingProf) {
      // ATUALIZAR
      console.log('🔄 Atualizando registro existente...');

      const { error: updateError } = await supabase
        .from('professionals')
        .update(professionalData)
        .eq('id', existingProf.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar:', updateError);
        throw updateError;
      }

      professionalId = existingProf.id;
      console.log('✅ Atualizado com sucesso!');
    } else {
      // INSERIR
      console.log('➕ Criando novo registro...');

      const { data: newProf, error: insertError } = await supabase
        .from('professionals')
        .insert([professionalData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao inserir:', insertError);
        throw insertError;
      }

      professionalId = newProf.id;
      console.log('✅ Criado com sucesso! ID:', professionalId);
    }

    return { success: true, professionalId };
  } catch (error) {
    console.error('💥 Erro ao salvar:', error);
    return { success: false, error: error.message };
  }
}

// ==================== SALVAR CONVÊNIOS ====================
export async function saveConvenios(professionalId, convenios) {
  try {
    if (!professionalId) {
      throw new Error('ID do profissional não fornecido');
    }

    console.log('💾 Salvando convênios para professionalId:', professionalId);
    console.log('📋 Convênios:', convenios);

    // 1. Deletar convênios existentes
    const { error: deleteError } = await supabase
      .from('professional_convenios')
      .delete()
      .eq('professional_id', professionalId);

    if (deleteError) {
      console.error('❌ Erro ao deletar convênios antigos:', deleteError);
      throw deleteError;
    }

    // 2. Inserir novos convênios (se houver)
    if (convenios && convenios.length > 0) {
      // Filtrar convênios vazios
      const conveniosValidos = convenios.filter((c) => c.nome && c.nome.trim() !== '');

      if (conveniosValidos.length > 0) {
        const conveniosData = conveniosValidos.map((convenio) => ({
          professional_id: professionalId,
          nome: convenio.nome,
          planos: convenio.planos || [],
        }));

        console.log('📦 Dados de convênios a inserir:', conveniosData);

        const { error: insertError } = await supabase
          .from('professional_convenios')
          .insert(conveniosData);

        if (insertError) {
          console.error('❌ Erro ao inserir convênios:', insertError);
          throw insertError;
        }

        console.log('✅ Convênios salvos com sucesso!');
      }
    }

    return { success: true };
  } catch (error) {
    console.error('💥 Erro ao salvar convênios:', error);
    return { success: false, error: error.message };
  }
}

// ==================== SALVAR ESPECIALIDADES ====================
export async function saveEspecialidades(professionalId, especialidades, intervaloConsultas) {
  try {
    if (!professionalId) {
      throw new Error('ID do profissional não fornecido');
    }

    console.log('💾 Salvando especialidades para professionalId:', professionalId);
    console.log('📋 Especialidades:', especialidades);

    // 1. Deletar especialidades existentes
    const { error: deleteError } = await supabase
      .from('professional_especialidades')
      .delete()
      .eq('professional_id', professionalId);

    if (deleteError) {
      console.error('❌ Erro ao deletar especialidades antigas:', deleteError);
      throw deleteError;
    }

    // 2. Inserir novas especialidades (se houver)
    if (especialidades && especialidades.length > 0) {
      // Filtrar especialidades vazias
      const especialidadesValidas = especialidades.filter(
        (e) => e.nome && e.nome.trim() !== ''
      );

      if (especialidadesValidas.length > 0) {
        const especialidadesData = especialidadesValidas.map((esp) => ({
          professional_id: professionalId,
          nome: esp.nome,
          duracao: esp.duracao || '50',
          forma_atendimento: esp.formaAtendimento || 'Presencial',
          convenios: esp.convenios || [],
        }));

        console.log('📦 Dados de especialidades a inserir:', especialidadesData);

        const { error: insertError } = await supabase
          .from('professional_especialidades')
          .insert(especialidadesData);

        if (insertError) {
          console.error('❌ Erro ao inserir especialidades:', insertError);
          throw insertError;
        }

        console.log('✅ Especialidades salvas com sucesso!');
      }
    }

    // 3. Atualizar intervalo de consultas no registro do profissional
    if (intervaloConsultas) {
      const { error: updateError } = await supabase
        .from('professionals')
        .update({ intervalo_consultas: intervaloConsultas })
        .eq('id', professionalId);

      if (updateError) {
        console.error('❌ Erro ao atualizar intervalo de consultas:', updateError);
      } else {
        console.log('✅ Intervalo de consultas atualizado!');
      }
    }

    return { success: true };
  } catch (error) {
    console.error('💥 Erro ao salvar especialidades:', error);
    return { success: false, error: error.message };
  }
}

// ==================== SALVAR LOCAIS ====================
export async function saveLocais(professionalId, locais) {
  try {
    if (!professionalId) {
      throw new Error('ID do profissional não fornecido');
    }

    console.log('💾 Salvando locais para professionalId:', professionalId);
    console.log('📋 Locais:', locais);

    // 1. Deletar locais existentes
    const { error: deleteError } = await supabase
      .from('professional_locais')
      .delete()
      .eq('professional_id', professionalId);

    if (deleteError) {
      console.error('❌ Erro ao deletar locais antigos:', deleteError);
      throw deleteError;
    }

    // 2. Inserir novos locais (se houver)
    if (locais && locais.length > 0) {
      // Filtrar locais vazios
      const locaisValidos = locais.filter((l) => l.nome && l.nome.trim() !== '');

      if (locaisValidos.length > 0) {
        const locaisData = locaisValidos.map((local) => ({
          professional_id: professionalId,
          nome: local.nome,
          endereco: local.endereco || '',
          cep: local.cep || '',
          cidade: local.cidade || '',
          especialidades: local.especialidades || [],
          horarios: local.horarios || [],
        }));

        console.log('📦 Dados de locais a inserir:', locaisData);

        const { error: insertError } = await supabase
          .from('professional_locais')
          .insert(locaisData);

        if (insertError) {
          console.error('❌ Erro ao inserir locais:', insertError);
          throw insertError;
        }

        console.log('✅ Locais salvos com sucesso!');
      }
    }

    return { success: true };
  } catch (error) {
    console.error('💥 Erro ao salvar locais:', error);
    return { success: false, error: error.message };
  }
}

// ==================== SALVAR PREÇOS ====================
export async function savePrecos(professionalId, configuracoes) {
  try {
    if (!professionalId) {
      throw new Error('ID do profissional não fornecido');
    }

    console.log('💾 Salvando preços para professionalId:', professionalId);
    console.log('📋 Configurações:', configuracoes);

    // 1. Deletar preços existentes
    const { error: deleteError } = await supabase
      .from('professional_precos')
      .delete()
      .eq('professional_id', professionalId);

    if (deleteError) {
      console.error('❌ Erro ao deletar preços antigos:', deleteError);
      throw deleteError;
    }

    // 2. Inserir novos preços (se houver)
    if (configuracoes && configuracoes.length > 0) {
      // Filtrar configurações vazias
      const configuracoesValidas = configuracoes.filter(
        (c) => c.local && c.especialidade && c.valor
      );

      if (configuracoesValidas.length > 0) {
        const precosData = configuracoesValidas.map((config) => ({
          professional_id: professionalId,
          local: config.local,
          especialidade: config.especialidade,
          valor: config.valor,
          formas_pagamento: config.formasPagamento || [],
          cobranca_no_agendamento: config.cobrancaNoAgendamento || false,
          percentual_adiantado: config.percentualAdiantado || '50',
          dados_bancarios: config.dadosBancarios || {
            banco: '',
            agencia: '',
            conta: '',
            tipoConta: 'Corrente',
            chavePix: '',
          },
        }));

        console.log('📦 Dados de preços a inserir:', precosData);

        const { error: insertError } = await supabase
          .from('professional_precos')
          .insert(precosData);

        if (insertError) {
          console.error('❌ Erro ao inserir preços:', insertError);
          throw insertError;
        }

        console.log('✅ Preços salvos com sucesso!');
      }
    }

    return { success: true };
  } catch (error) {
    console.error('💥 Erro ao salvar preços:', error);
    return { success: false, error: error.message };
  }
}

// ==================== SALVAR POLÍTICAS ====================
export async function savePoliticas(professionalId, politicas) {
  try {
    if (!professionalId) {
      throw new Error('ID do profissional não fornecido');
    }

    console.log('💾 Salvando políticas para professionalId:', professionalId);
    console.log('📋 Políticas:', politicas);

    // 1. Verificar se já existe registro de políticas
    const { data: existingPoliticas } = await supabase
      .from('professional_politicas')
      .select('id')
      .eq('professional_id', professionalId)
      .maybeSingle();

    const politicasData = {
      professional_id: professionalId,
      // Políticas de cancelamento
      cancelamento_prazo_minimo: politicas.cancelamento?.prazoMinimo || '24',
      cancelamento_cobra_multa: politicas.cancelamento?.cobraMulta ?? true,
      cancelamento_percentual_multa: politicas.cancelamento?.percentualMulta || '50',
      cancelamento_permitido: politicas.cancelamento?.permiteCancelamento ?? true,
      // Políticas de reagendamento
      reagendamento_permitido: politicas.reagendamento?.permitido ?? true,
      reagendamento_prazo_minimo: politicas.reagendamento?.prazoMinimo || '12',
      reagendamento_limite: politicas.reagendamento?.limiteReagendamentos || '2',
      // Políticas de faltas
      faltas_cobra: politicas.faltas?.cobraFalta ?? true,
      faltas_percentual_cobranca: politicas.faltas?.percentualCobranca || '100',
      faltas_tolerancia_atraso: politicas.faltas?.toleranciaAtraso || '15',
    };

    console.log('📦 Dados de políticas:', politicasData);

    if (existingPoliticas) {
      // ATUALIZAR
      console.log('🔄 Atualizando políticas existentes...');

      const { error: updateError } = await supabase
        .from('professional_politicas')
        .update(politicasData)
        .eq('id', existingPoliticas.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar políticas:', updateError);
        throw updateError;
      }

      console.log('✅ Políticas atualizadas com sucesso!');
    } else {
      // INSERIR
      console.log('➕ Criando novo registro de políticas...');

      const { error: insertError } = await supabase
        .from('professional_politicas')
        .insert([politicasData]);

      if (insertError) {
        console.error('❌ Erro ao inserir políticas:', insertError);
        throw insertError;
      }

      console.log('✅ Políticas criadas com sucesso!');
    }

    return { success: true };
  } catch (error) {
    console.error('💥 Erro ao salvar políticas:', error);
    return { success: false, error: error.message };
  }
}
