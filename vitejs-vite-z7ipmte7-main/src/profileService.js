import { supabase } from './supabaseClient';

// ============================================================================
// MAPEAMENTO DE NOMES — este arquivo foi escrito originalmente contra tabelas
// 'professional_convenios', 'professional_especialidades', etc. O schema v5
// real usa nomes mais simples ('convenios', 'especialidades'...), já que o
// vínculo com o profissional é feito via coluna professional_id, sem precisar
// prefixar o nome da tabela. Ajustado abaixo.
// ============================================================================

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
          intervaloConsultas: '10',
          locais: [],
          precos: [],
          politicas: politicasDefault(),
        },
      };
    }

    // Profissional existe - combinar dados de ambas as tabelas e buscar dados relacionados

    // 3. Buscar convênios (tabela: convenios)
    const { data: conveniosData, error: conveniosError } = await supabase
      .from('convenios')
      .select('nome')
      .eq('professional_id', professional.id);

    if (conveniosError) {
      console.error('❌ Erro ao buscar convênios:', conveniosError);
    }

    const convenios = conveniosData ? conveniosData.map((c) => c.nome) : [];

    // 4. Buscar especialidades (tabela: especialidades)
    const { data: especialidadesData, error: especialidadesError } = await supabase
      .from('especialidades')
      .select('nome')
      .eq('professional_id', professional.id);

    if (especialidadesError) {
      console.error('❌ Erro ao buscar especialidades:', especialidadesError);
    }

    const especialidades = especialidadesData ? especialidadesData.map((e) => e.nome) : [];

    // 5. Buscar locais (tabela: locais)
    const { data: locaisData, error: locaisError } = await supabase
      .from('locais')
      .select('*')
      .eq('professional_id', professional.id);

    if (locaisError) {
      console.error('❌ Erro ao buscar locais:', locaisError);
    }

    const locais = locaisData || [];

    // 6. Buscar políticas (tabela: politicas — nomes de coluna do schema v5)
    const { data: politicasData, error: politicasError } = await supabase
      .from('politicas')
      .select('*')
      .eq('professional_id', professional.id)
      .maybeSingle();

    if (politicasError) {
      console.error('❌ Erro ao buscar políticas:', politicasError);
    }

    const politicas = politicasData
      ? {
          cancelamento: {
            prazoMinimo: politicasData.prazo_cancelamento_horas ?? '24',
            cobraMulta: politicasData.cobra_multa_cancelamento ?? false,
            percentualMulta: politicasData.percentual_multa_cancelamento ?? '50',
            permiteCancelamento: politicasData.permite_cancelamento ?? true,
          },
          reagendamento: {
            permitido: politicasData.permite_reagendamento ?? true,
            prazoMinimo: politicasData.prazo_reagendamento_horas ?? '12',
            limiteReagendamentos: politicasData.limite_reagendamentos ?? '2',
          },
          faltas: {
            cobraFalta: politicasData.cobra_falta ?? false,
            percentualCobranca: politicasData.percentual_cobranca_falta ?? '100',
            toleranciaAtraso: politicasData.tolerancia_atraso_minutos ?? '15',
          },
        }
      : politicasDefault();

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
        intervaloConsultas: professional.intervalo_consultas ?? '10',
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

function politicasDefault() {
  return {
    cancelamento: {
      prazoMinimo: '24',
      cobraMulta: false,
      percentualMulta: '50',
      permiteCancelamento: true,
    },
    reagendamento: {
      permitido: true,
      prazoMinimo: '12',
      limiteReagendamentos: '2',
    },
    faltas: {
      cobraFalta: false,
      percentualCobranca: '100',
      toleranciaAtraso: '15',
    },
  };
}

// ==================== SALVAR DADOS PESSOAIS ====================
export async function saveProfessionalData(userId, pessoais) {
  try {
    if (!userId) {
      throw new Error('ID de usuário não fornecido');
    }

    console.log('💾 Salvando dados pessoais para userId:', userId);

    const { data: existingProf } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('🔍 Profissional existente:', existingProf ? 'SIM' : 'NÃO');

    const professionalData = {
      user_id: userId,
    };

    if (pessoais.nomeComercial) professionalData.nome_comercial = pessoais.nomeComercial;
    if (pessoais.crm) professionalData.crm_crp_cro = pessoais.crm;
    if (pessoais.celularCorporativo) professionalData.celular_corporativo = pessoais.celularCorporativo;
    if (pessoais.instagram) professionalData.instagram = pessoais.instagram;
    if (pessoais.site) professionalData.site = pessoais.site;
    if (pessoais.areaSaude) professionalData.area_saude = pessoais.areaSaude;
    if (pessoais.bio) professionalData.bio = pessoais.bio;
    if (pessoais.formaAtendimento) professionalData.forma_atendimento = pessoais.formaAtendimento;

    console.log('📦 Dados a salvar:', professionalData);

    let professionalId;

    if (existingProf) {
      console.log('🔄 Atualizando registro existente...');

      const { error: updateError } = await supabase
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
      console.log('➕ Criando novo registro...');

      const { data: newProf, error: insertError } = await supabase
        .from('professionals')
        .insert([professionalData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao inserir:', insertError);
        console.error('💡 Se o erro mencionar uma coluna, ela não existe na tabela');
        throw insertError;
      }

      professionalId = newProf.id;
      console.log('✅ Criado com sucesso!');
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

    const { error: deleteError } = await supabase
      .from('convenios')
      .delete()
      .eq('professional_id', professionalId);

    if (deleteError) {
      console.error('❌ Erro ao deletar convênios antigos:', deleteError);
      throw deleteError;
    }

    if (convenios && convenios.length > 0) {
      const conveniosData = convenios.map((convenio) => ({
        professional_id: professionalId,
        nome: convenio,
      }));

      const { error: insertError } = await supabase.from('convenios').insert(conveniosData);

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

// ==================== SALVAR ESPECIALIDADES ====================
export async function saveEspecialidades(professionalId, especialidades, intervaloConsultas) {
  try {
    if (!professionalId) {
      throw new Error('ID do profissional não fornecido');
    }

    console.log('💾 Salvando especialidades para professionalId:', professionalId);

    const { error: deleteError } = await supabase
      .from('especialidades')
      .delete()
      .eq('professional_id', professionalId);

    if (deleteError) {
      console.error('❌ Erro ao deletar especialidades antigas:', deleteError);
      throw deleteError;
    }

    if (especialidades && especialidades.length > 0) {
      // A tabela `especialidades` exige `duracao` (NOT NULL). A tela atual só
      // coleta o nome da especialidade, então aplicamos 50 min como padrão
      // até existir um campo de duração por especialidade na UI (item para
      // a Fase 5 — telas do profissional).
      const DURACAO_PADRAO_MINUTOS = 50;

      const especialidadesData = especialidades.map((especialidade) => ({
        professional_id: professionalId,
        nome: especialidade,
        duracao: DURACAO_PADRAO_MINUTOS,
      }));

      const { error: insertError } = await supabase.from('especialidades').insert(especialidadesData);

      if (insertError) {
        console.error('❌ Erro ao inserir especialidades:', insertError);
        throw insertError;
      }

      console.log('✅ Especialidades salvas com sucesso! (duração padrão: 50min — ajustar depois na UI)');
    }

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

// ==================== SALVAR LOCAIS ====================
export async function saveLocais(professionalId, locais) {
  try {
    if (!professionalId) {
      throw new Error('ID do profissional não fornecido');
    }

    console.log('💾 Salvando locais para professionalId:', professionalId);

    const { error: deleteError } = await supabase
      .from('locais')
      .delete()
      .eq('professional_id', professionalId);

    if (deleteError) {
      console.error('❌ Erro ao deletar locais antigos:', deleteError);
      throw deleteError;
    }

    if (locais && locais.length > 0) {
      // A tabela `locais` do schema v5 tem: nome, endereco, cidade, cep.
      // Os campos `especialidades` e `horarios` que a UI envia por local
      // NÃO são colunas de `locais` — são relacionamentos:
      //   - horarios: tabela própria `horarios` (local_id, dia_semana,
      //     hora_inicio, hora_fim...) — grava-se abaixo, um local por vez.
      //   - especialidades por local: ainda não existe uma tabela de
      //     ligação (locais <-> especialidades) no schema v5. Fica como
      //     decisão pendente para a Fase 5 (provavelmente uma tabela
      //     `locais_especialidades` de junção). Por ora, esse vínculo não
      //     é persistido — não há perda de dados crítica no MVP, já que
      //     um profissional pequeno tende a atender a mesma especialidade
      //     em todos os locais.
      const locaisData = locais.map((local) => ({
        professional_id: professionalId,
        nome: local.nome || '',
        endereco: local.endereco || '',
        cidade: local.cidade || '',
        cep: local.cep || '',
      }));

      const { data: insertedLocais, error: insertError } = await supabase
        .from('locais')
        .insert(locaisData)
        .select();

      if (insertError) {
        console.error('❌ Erro ao inserir locais:', insertError);
        throw insertError;
      }

      console.log('✅ Locais salvos com sucesso!');

      // Gravar horarios de cada local na tabela própria `horarios`
      for (let i = 0; i < locais.length; i++) {
        const localOriginal = locais[i];
        const localInserido = insertedLocais[i];

        if (localOriginal.horarios && localOriginal.horarios.length > 0 && localInserido) {
          const horariosData = localOriginal.horarios.map((h) => ({
            local_id: localInserido.id,
            dia_semana: h.diaSemana,
            hora_inicio: h.horaInicio,
            hora_fim: h.horaFim,
            almoco_inicio: h.almocoInicio || null,
            almoco_fim: h.almocoFim || null,
          }));

          const { error: horariosError } = await supabase.from('horarios').insert(horariosData);

          if (horariosError) {
            console.error('❌ Erro ao inserir horários do local:', horariosError);
            // não interrompe o fluxo — local já foi salvo
          }
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('💥 Erro ao salvar locais:', error);
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

    const { data: existingPoliticas } = await supabase
      .from('politicas')
      .select('id')
      .eq('professional_id', professionalId)
      .maybeSingle();

    // Nomes de coluna conforme o schema v5 (public.politicas)
    const politicasData = {
      professional_id: professionalId,
      permite_cancelamento: politicas.cancelamento?.permiteCancelamento ?? true,
      prazo_cancelamento_horas: politicas.cancelamento?.prazoMinimo ?? 24,
      cobra_multa_cancelamento: politicas.cancelamento?.cobraMulta ?? false,
      percentual_multa_cancelamento: politicas.cancelamento?.percentualMulta ?? 50,
      permite_reagendamento: politicas.reagendamento?.permitido ?? true,
      prazo_reagendamento_horas: politicas.reagendamento?.prazoMinimo ?? 12,
      limite_reagendamentos: politicas.reagendamento?.limiteReagendamentos ?? 2,
      cobra_falta: politicas.faltas?.cobraFalta ?? false,
      percentual_cobranca_falta: politicas.faltas?.percentualCobranca ?? 100,
      tolerancia_atraso_minutos: politicas.faltas?.toleranciaAtraso ?? 15,
    };

    if (existingPoliticas) {
      console.log('🔄 Atualizando políticas existentes...');

      const { error: updateError } = await supabase
        .from('politicas')
        .update(politicasData)
        .eq('id', existingPoliticas.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar políticas:', updateError);
        throw updateError;
      }

      console.log('✅ Políticas atualizadas com sucesso!');
    } else {
      console.log('➕ Criando novo registro de políticas...');

      const { error: insertError } = await supabase.from('politicas').insert([politicasData]);

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
