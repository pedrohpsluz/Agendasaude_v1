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

    // 2. Buscar dados básicos da tabela users (email, telefone, cpf_cnpj, nome)
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

    // Profissional existe - combinar dados de ambas as tabelas e buscar dados relacionados

    // 3. Buscar convênios
    const { data: conveniosData, error: conveniosError } = await supabase
      .from('professional_convenios')
      .select('nome')
      .eq('professional_id', professional.id);

    if (conveniosError) {
      console.error('❌ Erro ao buscar convênios:', conveniosError);
    }

    const convenios = conveniosData ? conveniosData.map((c) => c.nome) : [];

    // 4. Buscar especialidades
    const { data: especialidadesData, error: especialidadesError } = await supabase
      .from('professional_especialidades')
      .select('nome')
      .eq('professional_id', professional.id);

    if (especialidadesError) {
      console.error('❌ Erro ao buscar especialidades:', especialidadesError);
    }

    const especialidades = especialidadesData ? especialidadesData.map((e) => e.nome) : [];

    // 5. Buscar locais
    const { data: locaisData, error: locaisError } = await supabase
      .from('professional_locais')
      .select('*')
      .eq('professional_id', professional.id);

    if (locaisError) {
      console.error('❌ Erro ao buscar locais:', locaisError);
    }

    const locais = locaisData || [];

    // 6. Buscar políticas
    const { data: politicasData, error: politicasError } = await supabase
      .from('professional_politicas')
      .select('*')
      .eq('professional_id', professional.id)
      .maybeSingle();

    if (politicasError) {
      console.error('❌ Erro ao buscar políticas:', politicasError);
    }

    const politicas = politicasData ? {
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
    } : {
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
      nome: userData?.nome || '',
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
        precos: [],
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

    // Verificar se já existe
    const { data: existingProf } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('🔍 Profissional existente:', existingProf ? 'SIM' : 'NÃO');

    // Preparar dados APENAS com campos que existem na tabela
    const professionalData = {
      user_id: userId,
    };

    // Adicionar campos opcionais APENAS se tiverem valor
    if (pessoais.nomeComercial) {
      professionalData.nome_comercial = pessoais.nomeComercial;
    }
    if (pessoais.crm) {
      professionalData.crm_crp_cro = pessoais.crm;
    }
    if (pessoais.celularCorporativo) {
      professionalData.celular_corporativo = pessoais.celularCorporativo;
    }
    if (pessoais.instagram) {
      professionalData.instagram = pessoais.instagram;
    }
    if (pessoais.site) {
      professionalData.site = pessoais.site;
    }
    if (pessoais.areaSaude) {
      professionalData.area_saude = pessoais.areaSaude;
    }
    if (pessoais.bio) {
      professionalData.bio = pessoais.bio;
    }
    if (pessoais.formaAtendimento) {
      professionalData.forma_atendimento = pessoais.formaAtendimento;
    }

    console.log('📦 Dados a salvar:', professionalData);
    console.log('📋 Campos:', Object.keys(professionalData));

    let professionalId;

    if (existingProf) {
      // ATUALIZAR
      console.log('🔄 Atualizando registro existente...');

      const { data: updatedData, error: updateError } = await supabase
        .from('professionals')
        .update(professionalData)
        .eq('id', existingProf.id)
        .select();

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
        console.error(
          '💡 Se o erro mencionar uma coluna, ela não existe na tabela'
        );
        throw insertError;
      }

      professionalId = newProf.id;
      console.log('✅ Criado com sucesso!');
      console.log('📄 Registro:', newProf);
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
      const conveniosData = convenios.map((convenio) => ({
        professional_id: professionalId,
        nome: convenio,
      }));

      const { error: insertError } = await supabase
        .from('professional_convenios')
        .insert(conveniosData);

      if (insertError) {
        console.error('❌ Erro ao inserir convênios:', insertError);
        throw insertError;
      }

      console.log('✅ Convênios salvos com sucesso!');
    }

    return { success: true };
  } catch (error) {
    console.error('💥 Erro ao salvar convênios:', error);
    return { success: false, error: error.message };
  }
}

export async function saveEspecialidades(
  professionalId,
  especialidades,
  intervaloConsultas
) {
  try {
    if (!professionalId) {
      throw new Error('ID do profissional não fornecido');
    }

    console.log('💾 Salvando especialidades para professionalId:', professionalId);
    console.log('📋 Especialidades:', especialidades);
    console.log('⏱️ Intervalo consultas:', intervaloConsultas);

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
      const especialidadesData = especialidades.map((especialidade) => ({
        professional_id: professionalId,
        nome: especialidade,
      }));

      const { error: insertError } = await supabase
        .from('professional_especialidades')
        .insert(especialidadesData);

      if (insertError) {
        console.error('❌ Erro ao inserir especialidades:', insertError);
        throw insertError;
      }

      console.log('✅ Especialidades salvas com sucesso!');
    }

    // 3. Atualizar intervalo de consultas no registro do profissional (se fornecido)
    if (intervaloConsultas) {
      const { error: updateError } = await supabase
        .from('professionals')
        .update({ intervalo_consultas: intervaloConsultas })
        .eq('id', professionalId);

      if (updateError) {
        console.error('❌ Erro ao atualizar intervalo de consultas:', updateError);
        throw updateError;
      }

      console.log('✅ Intervalo de consultas atualizado!');
    }

    return { success: true };
  } catch (error) {
    console.error('💥 Erro ao salvar especialidades:', error);
    return { success: false, error: error.message };
  }
}

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
      const locaisData = locais.map((local) => ({
        professional_id: professionalId,
        nome: local.nome || '',
        endereco: local.endereco || '',
        cep: local.cep || '',
        cidade: local.cidade || '',
        especialidades: local.especialidades || [],
        horarios: local.horarios || [],
      }));

      const { error: insertError } = await supabase
        .from('professional_locais')
        .insert(locaisData);

      if (insertError) {
        console.error('❌ Erro ao inserir locais:', insertError);
        throw insertError;
      }

      console.log('✅ Locais salvos com sucesso!');
    }

    return { success: true };
  } catch (error) {
    console.error('💥 Erro ao salvar locais:', error);
    return { success: false, error: error.message };
  }
}

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
