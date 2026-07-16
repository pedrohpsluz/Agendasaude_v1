import { supabase } from './supabaseClient';

// ==================== SIGN UP (CADASTRO) ====================
export async function signUp({ nome, email, senha, cpfCnpj, telefone }) {
  try {
    console.log('📝 Iniciando cadastro para:', email);

    // Criar usuário no Supabase Auth.
    // NOTA: o registro correspondente na tabela public.users é criado
    // AUTOMATICAMENTE pelo trigger `trg_on_auth_user_created` (schema v5),
    // que lê nome/cpf_cnpj/telefone de user_metadata abaixo. Por isso NÃO
    // fazemos mais um insert manual aqui — fazíamos antes, e isso gerava um
    // erro silencioso de chave primária duplicada a cada cadastro (o
    // trigger já tinha inserido a linha um instante antes).
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: senha,
      options: {
        data: {
          nome: nome,
          cpf_cnpj: cpfCnpj,
          telefone: telefone,
        },
      },
    });

    if (authError) {
      console.error('❌ Erro no auth.signUp:', authError);
      throw authError;
    }

    console.log('✅ Usuário criado no Auth (trigger cuida da tabela users):', authData);

    return {
      success: true,
      userId: authData.user?.id,
      user: authData.user,
      session: authData.session,
    };
  } catch (error) {
    console.error('💥 Erro no signUp:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao criar conta',
    };
  }
}

// ==================== SIGN IN (LOGIN) ====================
export async function signIn({ email, senha }) {
  try {
    console.log('🔐 Iniciando login para:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
    });

    if (error) {
      console.error('❌ Erro no signIn:', error);
      throw error;
    }

    console.log('✅ Login realizado com sucesso:', data);

    // Rede de segurança: se por algum motivo o trigger não tiver criado a
    // linha em public.users (ex.: usuário criado antes do trigger existir,
    // como pode ser o caso de cadastros feitos no schema antigo), criamos
    // aqui. Em uso normal, isso não deve disparar.
    if (data.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!userData) {
        console.log('⚠️ Usuário não encontrado na tabela users, criando (fallback)...');

        const { error: insertError } = await supabase.from('users').insert([
          {
            id: data.user.id,
            nome: data.user.user_metadata?.nome || '',
            email: data.user.email,
            telefone: data.user.user_metadata?.telefone || '',
            cpf_cnpj: data.user.user_metadata?.cpf_cnpj || '',
          },
        ]);

        if (insertError) {
          console.error('❌ Erro ao criar usuário na tabela users (fallback):', insertError);
        } else {
          console.log('✅ Usuário criado na tabela users (fallback)');
        }
      } else {
        console.log('✅ Usuário encontrado na tabela users:', userData);
      }
    }

    return {
      success: true,
      userId: data.user?.id,
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    console.error('💥 Erro no signIn:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao fazer login',
    };
  }
}

// ==================== SIGN OUT (LOGOUT) ====================
export async function signOut() {
  try {
    console.log('👋 Fazendo logout...');

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ Erro no signOut:', error);
      throw error;
    }

    console.log('✅ Logout realizado com sucesso');

    return { success: true };
  } catch (error) {
    console.error('💥 Erro no signOut:', error);
    return {
      success: false,
      error: error.message || 'Erro ao fazer logout',
    };
  }
}

// ==================== GET CURRENT USER ====================
export async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Erro ao obter sessão:', error);
      throw error;
    }

    if (!session) {
      return { success: false, user: null };
    }

    return {
      success: true,
      userId: session.user.id,
      user: session.user,
      session: session,
    };
  } catch (error) {
    console.error('💥 Erro ao obter usuário atual:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ==================== CHECK AUTH STATE ====================
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔔 Auth state changed:', event);
    callback(event, session);
  });
}
