import { supabase } from './supabaseClient';

// ==================== SIGN UP (CADASTRO) ====================
export async function signUp({ nome, email, senha, cpfCnpj, telefone }) {
  try {
    console.log('📝 Iniciando cadastro para:', email);

    // 1. Criar usuário no Supabase Auth
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

    console.log('✅ Usuário criado no Auth:', authData);

    // 2. Inserir dados na tabela users usando upsert para evitar conflitos
    if (authData.user) {
      // Usar upsert para caso já exista um registro (ex: trigger automático)
      const { error: insertError } = await supabase.from('users').upsert(
        {
          id: authData.user.id,
          nome: nome,
          email: email,
          telefone: telefone,
          cpf_cnpj: cpfCnpj,
        },
        {
          onConflict: 'id',
          ignoreDuplicates: false, // Atualizar se já existir
        }
      );

      if (insertError) {
        console.error('⚠️ Erro ao inserir/atualizar na tabela users:', insertError);
        // Não vamos fazer throw aqui pois o usuário já foi criado no Auth
        // O usuário poderá atualizar seus dados depois na página de perfil
      } else {
        console.log('✅ Dados inseridos/atualizados na tabela users');
      }
    }

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

    // Fazer login no Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
    });

    if (error) {
      console.error('❌ Erro no signIn:', error);
      throw error;
    }

    console.log('✅ Login realizado com sucesso:', data);

    // Verificar se o usuário existe na tabela users
    if (data.user) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle(); // Usar maybeSingle() ao invés de single()

      if (!userData) {
        // Usuário não existe na tabela users, vamos criar usando upsert
        console.log('⚠️ Usuário não encontrado na tabela users, criando...');

        const { error: insertError } = await supabase.from('users').upsert(
          {
            id: data.user.id,
            nome: data.user.user_metadata?.nome || '',
            email: data.user.email,
            telefone: data.user.user_metadata?.telefone || '',
            cpf_cnpj: data.user.user_metadata?.cpf_cnpj || '',
          },
          {
            onConflict: 'id',
            ignoreDuplicates: false,
          }
        );

        if (insertError) {
          console.error('❌ Erro ao criar usuário na tabela users:', insertError);
        } else {
          console.log('✅ Usuário criado na tabela users');
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

// ==================== SIGN IN WITH GOOGLE ====================
export async function signInWithGoogle() {
  try {
    console.log('🔐 Iniciando login com Google...');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('❌ Erro no login com Google:', error);
      throw error;
    }

    console.log('✅ Redirecionando para Google...', data);

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('💥 Erro no signInWithGoogle:', error);
    return {
      success: false,
      error: error.message || 'Erro ao fazer login com Google',
    };
  }
}
