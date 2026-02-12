import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  Calendar,
  Clock,
  CreditCard,
  Smartphone,
  CheckCircle,
  Users,
  TrendingUp,
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  MapPin,
  DollarSign,
  FileText,
  Upload,
  Plus,
  X,
  Save,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { signUp, signIn, signOut, signInWithGoogle } from './authService';
import {
  loadProfessionalData,
  saveProfessionalData,
  saveConvenios,
  saveEspecialidades,
  saveLocais,
  savePrecos,
  savePoliticas,
} from './profileService';

// Interfaces de tipos
interface Convenio {
  nome: string;
  planos: string[];
}

interface Especialidade {
  nome: string;
  duracao: string;
  formaAtendimento: string;
  convenios: string[];
}

interface HorarioLocal {
  dia: string;
  ativo: boolean;
  inicio: string;
  fim: string;
}

interface Local {
  id: number;
  nome: string;
  endereco: string;
  cidade: string;
  cep: string;
  especialidades: string[];
  horarios: HorarioLocal[];
}

// Dias da semana para seleção de horários
const DIAS_SEMANA = [
  { key: 'seg', nome: 'Segunda-feira' },
  { key: 'ter', nome: 'Terça-feira' },
  { key: 'qua', nome: 'Quarta-feira' },
  { key: 'qui', nome: 'Quinta-feira' },
  { key: 'sex', nome: 'Sexta-feira' },
  { key: 'sab', nome: 'Sábado' },
  { key: 'dom', nome: 'Domingo' },
];

// Interface para eventos da agenda
interface EventoAgenda {
  id: number;
  tipo: 'consulta' | 'ferias' | 'folga' | 'compromisso' | 'bloqueio';
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  horaInicio: string;
  horaFim: string;
  diaInteiro: boolean;
  cor: string;
}

// Tipos de eventos disponíveis
const TIPOS_EVENTO = [
  { id: 'consulta', nome: 'Consulta', cor: '#4F46E5' },
  { id: 'ferias', nome: 'Férias', cor: '#10B981' },
  { id: 'folga', nome: 'Folga', cor: '#F59E0B' },
  { id: 'compromisso', nome: 'Compromisso Pessoal', cor: '#EC4899' },
  { id: 'bloqueio', nome: 'Bloqueio de Horário', cor: '#6B7280' },
];

interface DadosBancarios {
  banco: string;
  agencia: string;
  conta: string;
  tipoConta: string;
  chavePix: string;
}

interface ConfiguracaoPreco {
  local: string;
  especialidade: string;
  valor: string;
  formasPagamento: string[];
  cobrancaNoAgendamento: boolean;
  percentualAdiantado: string;
  dadosBancarios: DadosBancarios;
}

interface Pessoais {
  nome: string;
  nomeComercial: string;
  email: string;
  telefone: string;
  celularCorporativo: string;
  instagram: string;
  site: string;
  cpfCnpj: string;
  crm: string;
  areaSaude: string;
  bio: string;
  formaAtendimento: string;
  convenios: Convenio[];
}

interface Areas {
  especialidades: Especialidade[];
  intervaloConsultas: string;
}

interface Precos {
  configuracoes: ConfiguracaoPreco[];
}

interface PageProps {
  setCurrentPage: (page: string) => void;
  setUserLoggedIn: (loggedIn: boolean) => void;
  setCurrentUserId: (id: string | null) => void;
}

interface ProfilePageProps {
  setCurrentPage: (page: string) => void;
  setUserLoggedIn: (loggedIn: boolean) => void;
  currentUserId: string | null;
  currentProfessionalId: string | null;
  setCurrentProfessionalId: (id: string | null) => void;
}

// Lista de convênios e seus planos disponíveis
const CONVENIOS_DISPONIVEIS: Record<string, string[]> = {
  'Particular': [],
  'Unimed': ['Unimed Nacional', 'Unimed Seguros', 'Unimed Fácil', 'Unimed Universitário', 'Unimed Básico'],
  'Bradesco Saúde': ['Top Nacional', 'Efetivo', 'Preferencial', 'Nacional Flex', 'Compulsório'],
  'Amil': ['Amil One Health', 'Amil 400', 'Amil 500', 'Amil 600', 'Amil 700', 'Amil Dental'],
  'SulAmérica': ['Especial 100', 'Executivo', 'Clássico', 'Prestige', 'Básico'],
  'NotreDame Intermédica': ['Smart 200', 'Smart 500', 'Advance', 'Premium', 'Ideal'],
  'Hapvida': ['Mix', 'Pleno', 'Max', 'Nacional', 'Sênior'],
  'Porto Seguro Saúde': ['Bronze', 'Prata', 'Ouro', 'Diamante', 'Empresarial'],
  'Golden Cross': ['Essencial', 'Especial', 'Superior', 'Sênior'],
  'Prevent Senior': ['Prev Senior', 'Bem Estar', 'Conforto', 'Premium'],
  'São Cristóvão': ['Leve', 'Ideal', 'Total', 'Especial'],
  'Care Plus': ['Master', 'Executivo', 'Soho', 'Personal'],
  'Cassi': ['Plano Associados', 'Plano Família', 'Cassi Essencial'],
  'Caixa Saúde': ['Básico', 'Especial', 'Executivo'],
  'Allianz Saúde': ['Blue', 'Classic', 'Premium', 'Black'],
  'Mediservice': ['Básico', 'Standard', 'Especial', 'Executivo'],
  'Omint': ['Omint Plus', 'Omint Class', 'Omint Gold'],
};

// Lista de especialidades por área de saúde
const ESPECIALIDADES_POR_AREA: Record<string, string[]> = {
  'Psicólogo': [
    'Psicologia Clínica',
    'Psicologia Hospitalar',
    'Neuropsicologia',
    'Psicologia Infantil',
    'Psicologia do Esporte',
    'Psicologia Organizacional',
    'Psicologia Jurídica',
    'Terapia Cognitivo-Comportamental (TCC)',
    'Psicanálise',
    'Terapia de Casal e Família',
    'Psicologia do Trânsito',
    'Avaliação Psicológica',
  ],
  'Médico': [
    'Clínico Geral',
    'Cardiologia',
    'Dermatologia',
    'Endocrinologia',
    'Gastroenterologia',
    'Geriatria',
    'Ginecologia',
    'Neurologia',
    'Oftalmologia',
    'Ortopedia',
    'Otorrinolaringologia',
    'Pediatria',
    'Pneumologia',
    'Reumatologia',
    'Urologia',
    'Medicina do Trabalho',
    'Medicina Esportiva',
    'Nutrologia',
  ],
  'Fisioterapeuta': [
    'Fisioterapia Ortopédica',
    'Fisioterapia Neurológica',
    'Fisioterapia Respiratória',
    'Fisioterapia Esportiva',
    'Fisioterapia Geriátrica',
    'Fisioterapia Pediátrica',
    'Fisioterapia Dermatofuncional',
    'Pilates Clínico',
    'RPG (Reeducação Postural Global)',
    'Acupuntura',
    'Quiropraxia',
    'Osteopatia',
  ],
  'Dentista': [
    'Clínico Geral',
    'Ortodontia',
    'Implantodontia',
    'Endodontia',
    'Periodontia',
    'Odontopediatria',
    'Prótese Dentária',
    'Cirurgia Bucomaxilofacial',
    'Estética Dental',
    'Harmonização Orofacial',
    'Dentística',
    'Radiologia Odontológica',
  ],
  'Psiquiatra': [
    'Psiquiatria Geral',
    'Psiquiatria Infantil',
    'Psiquiatria Geriátrica',
    'Psiquiatria Forense',
    'Dependência Química',
    'Transtornos de Ansiedade',
    'Transtornos do Humor',
    'Transtornos Alimentares',
    'TDAH',
    'Transtornos de Personalidade',
  ],
};

export default function AgendaSaudeApp() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [, setUserLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentProfessionalId, setCurrentProfessionalId] = useState<string | null>(null);

  // Verificar sessão ao carregar
  useEffect(() => {
    checkUserSession();

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth event:', event);

      if (event === 'SIGNED_IN' && session) {
        console.log('✅ Usuário logado:', session.user.email);

        // Verificar se o usuário existe na tabela users (importante para login com Google)
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!existingUser) {
          // Criar usuário na tabela users (login com Google)
          console.log('📝 Criando usuário na tabela users (Google login)...');
          const { error: insertError } = await supabase.from('users').insert([{
            id: session.user.id,
            nome: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
            email: session.user.email || '',
            telefone: session.user.user_metadata?.telefone || '',
            cpf_cnpj: session.user.user_metadata?.cpf_cnpj || '',
          }]);

          if (insertError) {
            console.error('⚠️ Erro ao criar usuário:', insertError);
          } else {
            console.log('✅ Usuário criado na tabela users');
          }
        }

        setUserLoggedIn(true);
        setCurrentUserId(session.user.id);
        setCurrentPage('profile');
        localStorage.setItem('profileTab', 'pessoais');
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 Usuário deslogado');
        setUserLoggedIn(false);
        setCurrentUserId(null);
        setCurrentProfessionalId(null);
        setCurrentPage('landing');
      } else if (event === 'USER_UPDATED') {
        console.log('🔄 Usuário atualizado');
        if (session) {
          setCurrentUserId(session.user.id);
        }
      }
    });

    // Cleanup
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkUserSession = async () => {
    try {
      console.log('🔍 Verificando sessão do usuário...');
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Erro ao verificar sessão:', error);
        return;
      }

      if (session) {
        console.log('✅ Sessão encontrada:', session.user.email);
        setUserLoggedIn(true);
        setCurrentUserId(session.user.id);
        setCurrentPage('profile');
      } else {
        console.log('ℹ️ Nenhuma sessão ativa');
      }
    } catch (error) {
      console.error('💥 Erro ao verificar sessão:', error);
    }
  };

  return (
    <>
      {currentPage === 'landing' && (
        <LandingPage
          setCurrentPage={setCurrentPage}
          setUserLoggedIn={setUserLoggedIn}
          setCurrentUserId={setCurrentUserId}
        />
      )}
      {currentPage === 'login' && (
        <LoginPage
          setCurrentPage={setCurrentPage}
          setUserLoggedIn={setUserLoggedIn}
          setCurrentUserId={setCurrentUserId}
        />
      )}
      {currentPage === 'profile' && (
        <ProfilePage
          setCurrentPage={setCurrentPage}
          setUserLoggedIn={setUserLoggedIn}
          currentUserId={currentUserId}
          currentProfessionalId={currentProfessionalId}
          setCurrentProfessionalId={setCurrentProfessionalId}
        />
      )}
    </>
  );
}

// ==================== FOOTER COMPONENT ====================
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="w-8 h-8 text-indigo-400" />
            <span className="text-xl font-bold">AgendaSaúde</span>
          </div>
          <p className="text-gray-400 text-center mb-8">
            Simplificando agendamentos para profissionais de saúde
          </p>

          <nav className="flex flex-wrap justify-center gap-6 text-gray-400">
            <a href="#" className="hover:text-white transition">
              Funcionalidades
            </a>
            <a href="#" className="hover:text-white transition">
              Sobre nós
            </a>
            <a href="#" className="hover:text-white transition">
              Blog
            </a>
            <a href="#" className="hover:text-white transition">
              Contato
            </a>
            <a href="#" className="hover:text-white transition">
              Termos de uso
            </a>
          </nav>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2026 AgendaSaúde. Todos os direitos reservados.</p>
          <p className="mt-2">Região de Campinas - SP</p>
        </div>
      </div>
    </footer>
  );
}

// ==================== LANDING PAGE ====================
function LandingPage({ setCurrentPage, setUserLoggedIn, setCurrentUserId }: PageProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpfCnpj: '',
    senha: '',
    confirmaSenha: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmaSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    setSubmitted(true);

    const result = await signUp({
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      cpfCnpj: formData.cpfCnpj,
      telefone: formData.telefone,
    });

    if (result.success) {
      alert(
        '✅ Cadastro realizado com sucesso! Verifique seu email para confirmar.'
      );
      setUserLoggedIn(true);
      setCurrentUserId(result.userId ?? null);
      setCurrentPage('profile');
      localStorage.setItem('profileTab', 'pessoais');
    } else {
      alert('❌ Erro no cadastro: ' + result.error);
      setSubmitted(false);
    }
  };

  const handleGoogleSignup = async () => {
    const result = await signInWithGoogle();
    if (!result.success) {
      alert('❌ Erro ao iniciar login com Google: ' + result.error);
    }
    // O redirecionamento é feito automaticamente pelo Supabase OAuth
    // O listener de auth state vai capturar o login quando o usuário voltar
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">
              AgendaSaúde
            </span>
          </div>
          <button
            onClick={() => setCurrentPage('login')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Entrar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Organize seus atendimentos, receba pagamentos e reduza faltas. Com
            uma interação automática e direta com seu cliente pelo WhatsApp.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
            A AgendaSaúde é uma plataforma simples e inteligente que automatiza
            agendamentos, confirmações e pagamentos para médicos e psicólogos.
            Menos mensagens, mais tempo para cuidar dos pacientes.
          </p>
          <div className="flex justify-center">
            <a
              href="#cadastro"
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
            >
              Começar Agora
            </a>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-10 text-white shadow-2xl">
            <h2 className="text-3xl font-bold mb-3 text-center">
              Principais Funcionalidades
            </h2>
            <p className="text-indigo-100 text-center mb-8 text-lg">
              Tudo que você precisa para otimizar seu atendimento
            </p>

            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="w-7 h-7 flex-shrink-0" />
                  <h3 className="text-xl font-semibold">
                    Agendamento via WhatsApp
                  </h3>
                </div>
                <p className="text-indigo-50 leading-relaxed pl-10">
                  Pacientes visualizam e agendam de forma automática o horário
                  disponível.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-7 h-7 flex-shrink-0" />
                  <h3 className="text-xl font-semibold">
                    Assistente Virtual de Atendimento
                  </h3>
                </div>
                <p className="text-indigo-50 leading-relaxed pl-10">
                  Um bot personalizado responde dúvidas, confirma consultas e
                  envia lembretes automáticos para os clientes.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-7 h-7 flex-shrink-0" />
                  <h3 className="text-xl font-semibold">
                    Pagamento Integrado (Opcional) - Receba por PIX ou Cartão
                  </h3>
                </div>
                <p className="text-indigo-50 leading-relaxed pl-10">
                  O sistema possibilita que ocorra o pagamento da consulta já no
                  agendamento. O que permite a retenção de uma parcela do valor
                  em caso de faltas não justificadas.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-7 h-7 flex-shrink-0" />
                  <h3 className="text-xl font-semibold">
                    Gestão de Horários e Bloqueios
                  </h3>
                </div>
                <p className="text-indigo-50 leading-relaxed pl-10">
                  Controle seus horários de atendimento, feriados e pausas de
                  forma simples e visual.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-7 h-7 flex-shrink-0" />
                  <h3 className="text-xl font-semibold">
                    Painel de Resultados
                  </h3>
                </div>
                <p className="text-indigo-50 leading-relaxed pl-10">
                  Acompanhe número de consultas, cancelamentos e receita em um
                  painel intuitivo.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-7 h-7 flex-shrink-0" />
                  <h3 className="text-xl font-semibold">
                    Perfil Profissional Completo
                  </h3>
                </div>
                <p className="text-indigo-50 leading-relaxed pl-10">
                  Adicione foto, endereço, CRM, especialidades e convênios
                  aceitos. Que poderão ser compartilhados quando clientes forem
                  procurar por profissionais do ramo da saúde.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Por que escolher a AgendaSaúde?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Clock className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Economize Tempo</h3>
              <p className="text-gray-600">
                Automatize agendamentos e reduza ligações e mensagens manuais
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Users className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Experiência do Cliente
              </h3>
              <p className="text-gray-600">
                Melhore a experiência do paciente com agendamentos rápidos e
                acessíveis
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <TrendingUp className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aumente o Faturamento
              </h3>
              <p className="text-gray-600">
                Melhore a eficiência da sua agenda e maior controle dos
                pagamentos
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Shield className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Reduza Perdas com Faltas
              </h3>
              <p className="text-gray-600">
                Com lembretes automáticos aos clientes e cobrança de multas por
                faltas (opcional e personalizável)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Investimento */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Sistema em Construção
          </h2>
          <p className="text-xl text-indigo-100 mb-12">
            Estamos desenvolvendo a AgendaSaúde e você pode fazer parte dos
            nossos primeiros usuários!
          </p>

          <div className="bg-white rounded-2xl p-12 shadow-2xl">
            <div className="mb-8">
              <div className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-full font-semibold text-lg mb-6">
                🎉 Acesso Gratuito Durante o Desenvolvimento
              </div>

              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Use gratuitamente e pague o valor que achar justo
              </h3>

              <p className="text-lg text-gray-600 mb-8">
                Como early adopter, você terá acesso completo à plataforma sem
                custos fixos. Depois de experimentar, você decide quanto vale
                para o seu negócio e contribui com o valor que considerar justo.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-left text-gray-700">
                  Sem taxas de implementação
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-left text-gray-700">Sem mensalidade fixa</p>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-left text-gray-700">
                  Todas as funcionalidades liberadas
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6 mb-8">
              <h4 className="font-semibold text-lg text-gray-900 mb-3">
                Benefícios de ser Early Adopter:
              </h4>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="text-indigo-600 mr-2">✓</span>
                  Influencie o desenvolvimento com seu feedback
                </li>
                <li className="flex items-center">
                  <span className="text-indigo-600 mr-2">✓</span>
                  Suporte prioritário durante toda a fase beta
                </li>
                <li className="flex items-center">
                  <span className="text-indigo-600 mr-2">✓</span>
                  Preços especiais quando oficializarmos os planos
                </li>
                <li className="flex items-center">
                  <span className="text-indigo-600 mr-2">✓</span>
                  Ajude a construir a melhor plataforma de agendamentos do
                  Brasil
                </li>
              </ul>
            </div>

            <a
              href="#cadastro"
              className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
            >
              Quero me Cadastrar
            </a>
          </div>
        </div>
      </section>

      {/* Formulário de Cadastro */}
      <section id="cadastro" className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Inicie sua Jornada
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Preencha o formulário e entraremos em contato para configurar seu
            acesso gratuito
          </p>

          <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
            <button
              onClick={handleGoogleSignup}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg text-base font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-3 mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Cadastrar com Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">
                  ou cadastre-se com email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Nome Completo*
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    CPF/CNPJ*
                  </label>
                  <input
                    type="text"
                    name="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Telefone/WhatsApp*
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="(19) 99999-9999"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Senha*
                  </label>
                  <input
                    type="password"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Digite sua senha"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Confirme a Senha*
                  </label>
                  <input
                    type="password"
                    name="confirmaSenha"
                    value={formData.confirmaSenha}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Confirme sua senha"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="w-full bg-indigo-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400"
              >
                {submitted ? 'Cadastrando...' : 'Realizar Cadastro'}
              </button>

              <p className="text-sm text-gray-600 text-center mt-4">
                Ao enviar, você concorda com nossa Política de Privacidade
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// ==================== LOGIN PAGE ====================
function LoginPage({ setCurrentPage, setUserLoggedIn, setCurrentUserId }: PageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
    cpfCnpj: '',
    telefone: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLogin) {
      // LOGIN
      const result = await signIn({
        email: formData.email,
        senha: formData.password,
      });

      if (result.success) {
        alert('✅ Login realizado com sucesso!');
        setUserLoggedIn(true);
        setCurrentUserId(result.userId ?? null);
        setCurrentPage('profile');
        localStorage.setItem('profileTab', 'clientes');
      } else {
        alert('❌ Erro no login: ' + result.error);
      }
    } else {
      // CADASTRO
      if (formData.password !== formData.confirmPassword) {
        alert('As senhas não coincidem!');
        return;
      }

      const result = await signUp({
        nome: formData.nome,
        email: formData.email,
        senha: formData.password,
        cpfCnpj: formData.cpfCnpj,
        telefone: formData.telefone,
      });

      if (result.success) {
        alert('✅ Cadastro realizado! Verifique seu email para confirmar.');
        setUserLoggedIn(true);
        setCurrentUserId(result.userId ?? null);
        setCurrentPage('profile');
        localStorage.setItem('profileTab', 'pessoais');
      } else {
        alert('❌ Erro no cadastro: ' + result.error);
      }
    }
  };

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    if (!result.success) {
      alert('❌ Erro ao iniciar login com Google: ' + result.error);
    }
    // O redirecionamento é feito automaticamente pelo Supabase OAuth
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo e Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                AgendaSaúde
              </span>
            </div>
            <p className="text-gray-600 text-lg">
              {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta gratuita'}
            </p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Abas Login/Cadastro */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                  isLogin
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                  !isLogin
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cadastrar
              </button>
            </div>

            {/* Botão Google */}
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition flex items-center justify-center gap-3 mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar com Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  ou continue com email
                </span>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Campos extras para cadastro */}
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Nome Completo*
                      </label>
                      <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        placeholder="Seu nome completo"
                        required={!isLogin}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        CPF/CNPJ*
                      </label>
                      <input
                        type="text"
                        name="cpfCnpj"
                        value={formData.cpfCnpj}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        placeholder="000.000.000-00"
                        required={!isLogin}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Telefone/WhatsApp*
                      </label>
                      <input
                        type="tel"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        placeholder="(19) 99999-9999"
                        required={!isLogin}
                      />
                    </div>
                  </>
                )}

                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email*
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Senha*
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar Senha (apenas no cadastro) */}
                {!isLogin && (
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Confirmar Senha*
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        placeholder="••••••••"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Esqueceu senha (apenas no login) */}
                {isLogin && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                )}
              </div>

              {/* Botão de Submit */}
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition mt-6 shadow-lg shadow-indigo-500/30"
              >
                {isLogin ? 'Entrar na Conta' : 'Criar Conta Gratuita'}
              </button>

              {/* Termos (apenas no cadastro) */}
              {!isLogin && (
                <p className="text-xs text-gray-600 text-center mt-4">
                  Ao criar uma conta, você concorda com nossos{' '}
                  <a
                    href="#"
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Termos de Uso
                  </a>{' '}
                  e{' '}
                  <a
                    href="#"
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Política de Privacidade
                  </a>
                </p>
              )}
            </form>
          </div>

          {/* Link para home */}
          <div className="text-center mt-6">
            <button
              onClick={() => setCurrentPage('landing')}
              className="text-gray-600 hover:text-indigo-600 transition font-medium flex items-center justify-center gap-2 mx-auto"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Voltar para home
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// ==================== PROFILE PAGE ====================
function ProfilePage({
  setCurrentPage,
  setUserLoggedIn,
  currentUserId,
  currentProfessionalId,
  setCurrentProfessionalId,
}: ProfilePageProps) {
  const initialTab = localStorage.getItem('profileTab') || 'pessoais';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [pessoais, setPessoais] = useState<Pessoais>({
    nome: '',
    nomeComercial: '',
    email: '',
    telefone: '',
    celularCorporativo: '',
    instagram: '',
    site: '',
    cpfCnpj: '',
    crm: '',
    areaSaude: 'Psicólogo',
    bio: '',
    formaAtendimento: 'Online e Presencial',
    convenios: [],
  });

  const [areas, setAreas] = useState<Areas>({
    especialidades: [],
    intervaloConsultas: '10',
  });

  const [locais, setLocais] = useState<Local[]>([]);

  // Estado da Agenda
  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [visualizacaoAgenda, setVisualizacaoAgenda] = useState<'semana' | 'mes'>('semana');
  const [dataAtualAgenda, setDataAtualAgenda] = useState(new Date());
  const [modalEvento, setModalEvento] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<EventoAgenda | null>(null);

  const [precos, setPrecos] = useState<Precos>({
    configuracoes: [],
  });

  const [politicas, setPoliticas] = useState({
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
  });

  // Carregar dados ao montar o componente
  useEffect(() => {
    console.log('🚀 ProfilePage montado!');
    console.log('👤 currentUserId:', currentUserId);
    console.log('🆔 currentProfessionalId:', currentProfessionalId);

    if (currentUserId) {
      loadData();
    } else {
      console.error('❌ currentUserId não definido!');
      alert('Erro: Usuário não identificado. Faça login novamente.');
    }

    localStorage.removeItem('profileTab');
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log(
        '🔍 Iniciando carregamento de dados para userId:',
        currentUserId
      );

      const result = await loadProfessionalData(currentUserId);
      console.log('📦 Resultado do carregamento:', result);

      if (result.success && result.data) {
        console.log('✅ Dados carregados com sucesso!');

        // Atualizar professional_id se encontrado
        if (result.professionalId) {
          console.log('👤 Professional ID encontrado:', result.professionalId);
          setCurrentProfessionalId(result.professionalId);
        } else {
          console.log('⚠️ Nenhum professional_id encontrado (primeiro acesso)');
        }

        // Carregar dados pessoais
        if (result.data.pessoais) {
          console.log('📝 Carregando dados pessoais:', result.data.pessoais);
          setPessoais(result.data.pessoais);
        }

        // Carregar especialidades
        if (result.data.especialidades) {
          console.log(
            '🏥 Carregando especialidades:',
            result.data.especialidades
          );
          setAreas({
            especialidades: result.data.especialidades,
            intervaloConsultas: result.data.intervaloConsultas || '10',
          });
        }

        // Carregar locais
        if (result.data.locais) {
          console.log('📍 Carregando locais:', result.data.locais);
          setLocais(result.data.locais);
        }

        // Carregar preços
        if (result.data.precos) {
          console.log('💰 Carregando preços:', result.data.precos);
          setPrecos({ configuracoes: result.data.precos });
        }

        // Carregar políticas
        if (result.data.politicas) {
          console.log('📋 Carregando políticas:', result.data.politicas);
          setPoliticas(result.data.politicas);
        }
      } else {
        console.error('❌ Erro ao carregar dados:', result.error);
        alert('Erro ao carregar dados: ' + result.error);
      }
    } catch (error) {
      console.error('💥 Erro crítico ao carregar dados:', error);
      alert('Erro crítico: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      console.log('💾 Iniciando salvamento do perfil...');
      setSaved(false);

      console.log('📝 Dados pessoais a salvar:', pessoais);

      // Salvar dados pessoais e convênios
      const pessoaisResult = await saveProfessionalData(
        currentUserId,
        pessoais
      );
      console.log('📤 Resultado salvamento pessoais:', pessoaisResult);

      if (!pessoaisResult.success) {
        throw new Error(
          pessoaisResult.error || 'Erro ao salvar dados pessoais'
        );
      }

      // Atualizar professional_id se retornado
      if (pessoaisResult.professionalId && !currentProfessionalId) {
        console.log(
          '🆔 Atualizando professional_id:',
          pessoaisResult.professionalId
        );
        setCurrentProfessionalId(pessoaisResult.professionalId);
      }

      const profId = currentProfessionalId || pessoaisResult.professionalId;
      console.log('👤 Professional ID para outras operações:', profId);

      // Salvar convênios
      if (pessoais.convenios && pessoais.convenios.length > 0) {
        console.log('🏥 Salvando convênios:', pessoais.convenios);
        const convResult = await saveConvenios(profId, pessoais.convenios);
        console.log('📤 Resultado convênios:', convResult);
      }

      // Salvar especialidades
      if (areas.especialidades && areas.especialidades.length > 0) {
        console.log('⚕️ Salvando especialidades:', areas.especialidades);
        const espResult = await saveEspecialidades(
          profId,
          areas.especialidades,
          areas.intervaloConsultas
        );
        console.log('📤 Resultado especialidades:', espResult);
      }

      // Salvar locais
      if (locais && locais.length > 0) {
        console.log('📍 Salvando locais:', locais);
        const locResult = await saveLocais(profId, locais);
        console.log('📤 Resultado locais:', locResult);
      }

      // Salvar preços
      if (precos.configuracoes && precos.configuracoes.length > 0) {
        console.log('💰 Salvando preços:', precos.configuracoes);
        const precResult = await savePrecos(profId, precos.configuracoes);
        console.log('📤 Resultado preços:', precResult);
      }

      // Salvar políticas
      console.log('📋 Salvando políticas:', politicas);
      const polResult = await savePoliticas(profId, politicas);
      console.log('📤 Resultado políticas:', polResult);

      console.log('✅ Perfil salvo com sucesso!');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('❌ Erro ao salvar perfil:', error);
      alert('❌ Erro ao salvar perfil: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleLogout = async () => {
    const result = await signOut();

    if (result.success) {
      setUserLoggedIn(false);
      setCurrentPage('landing');
    } else {
      alert('Erro ao sair: ' + result.error);
    }
  };

  const tabs = [
    { id: 'pessoais', label: 'Informações Pessoais', icon: User },
    { id: 'areas', label: 'Especialidade e Tempo de Consulta', icon: Clock },
    { id: 'locais', label: 'Locais e Horários', icon: MapPin },
    { id: 'precos', label: 'Preços e Pagamentos', icon: DollarSign },
    {
      id: 'politicas',
      label: 'Regras de Cancelamento, Reagendamento e Faltas',
      icon: FileText,
    },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'clientes', label: 'Clientes e Resultados', icon: Users },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AgendaSaúde
                </h1>
                <p className="text-sm text-gray-600">Configuração de Perfil</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {activeTab !== 'clientes' && (
                <button
                  onClick={handleSaveProfile}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar
                </button>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Menu Dropdown Mobile/Tablet */}
        <div className="lg:hidden mb-6">
          <div className="relative">
            <button
              onClick={() => {
                const menu = document.getElementById('mobile-menu');
                menu?.classList.toggle('hidden');
              }}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                {(() => {
                  const activeTabData = tabs.find((t) => t.id === activeTab);
                  if (activeTabData) {
                    const Icon = activeTabData.icon;
                    return <Icon className="w-5 h-5 text-indigo-600" />;
                  }
                  return null;
                })()}
                <span className="font-medium text-gray-900">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </span>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div
              id="mobile-menu"
              className="hidden absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      document
                        .getElementById('mobile-menu')
                        ?.classList.add('hidden');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-left">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {saved && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Alterações salvas com sucesso!
              </div>
            )}

            {activeTab === 'pessoais' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Informações Pessoais
                </h2>

                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-3">
                    Foto de Perfil
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <button className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Enviar Foto
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Nome Completo*
                    </label>
                    <input
                      type="text"
                      value={pessoais.nome}
                      onChange={(e) =>
                        setPessoais({ ...pessoais, nome: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Nome Comercial
                    </label>
                    <input
                      type="text"
                      value={pessoais.nomeComercial}
                      onChange={(e) =>
                        setPessoais({
                          ...pessoais,
                          nomeComercial: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="Nome da clínica"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      CPF/CNPJ*
                    </label>
                    <input
                      type="text"
                      value={pessoais.cpfCnpj}
                      onChange={(e) =>
                        setPessoais({ ...pessoais, cpfCnpj: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      CRM/CRP/CRO*
                    </label>
                    <input
                      type="text"
                      value={pessoais.crm}
                      onChange={(e) =>
                        setPessoais({ ...pessoais, crm: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Email*
                    </label>
                    <input
                      type="email"
                      value={pessoais.email}
                      onChange={(e) =>
                        setPessoais({ ...pessoais, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Telefone/WhatsApp*
                    </label>
                    <input
                      type="tel"
                      value={pessoais.telefone}
                      onChange={(e) =>
                        setPessoais({ ...pessoais, telefone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Celular Corporativo
                    </label>
                    <input
                      type="tel"
                      value={pessoais.celularCorporativo}
                      onChange={(e) =>
                        setPessoais({
                          ...pessoais,
                          celularCorporativo: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={pessoais.instagram}
                      onChange={(e) =>
                        setPessoais({ ...pessoais, instagram: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="@seu_instagram"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Site
                    </label>
                    <input
                      type="url"
                      value={pessoais.site}
                      onChange={(e) =>
                        setPessoais({ ...pessoais, site: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="https://seusite.com.br"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Área da Saúde*
                    </label>
                    <select
                      value={pessoais.areaSaude}
                      onChange={(e) =>
                        setPessoais({ ...pessoais, areaSaude: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    >
                      <option value="Psicólogo">Psicólogo</option>
                      <option value="Médico">Médico</option>
                      <option value="Fisioterapeuta">Fisioterapeuta</option>
                      <option value="Dentista">Dentista</option>
                      <option value="Psiquiatra">Psiquiatra</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Forma de Atendimento*
                    </label>
                    <select
                      value={pessoais.formaAtendimento}
                      onChange={(e) =>
                        setPessoais({
                          ...pessoais,
                          formaAtendimento: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    >
                      <option value="Online">Online</option>
                      <option value="Presencial">Presencial</option>
                      <option value="Online e Presencial">
                        Online e Presencial
                      </option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-gray-700 font-medium">
                      Convênios Aceitos
                    </label>
                    <button
                      onClick={() =>
                        setPessoais({
                          ...pessoais,
                          convenios: [
                            ...pessoais.convenios,
                            { nome: '', planos: [] },
                          ],
                        })
                      }
                      className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </button>
                  </div>
                  {pessoais.convenios.map((conv, idx) => (
                    <div key={idx} className="border rounded-lg p-4 mb-3">
                      <div className="flex gap-4 mb-3">
                        <select
                          value={conv.nome}
                          onChange={(e) => {
                            const novos = [...pessoais.convenios];
                            novos[idx].nome = e.target.value;
                            novos[idx].planos = []; // Limpar planos ao trocar convênio
                            setPessoais({ ...pessoais, convenios: novos });
                          }}
                          className="flex-1 px-4 py-2 border rounded-lg"
                        >
                          <option value="">Selecione o convênio</option>
                          {Object.keys(CONVENIOS_DISPONIVEIS).map((convenio) => (
                            <option key={convenio} value={convenio}>
                              {convenio}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() =>
                            setPessoais({
                              ...pessoais,
                              convenios: pessoais.convenios.filter(
                                (_, i) => i !== idx
                              ),
                            })
                          }
                          className="text-red-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      {conv.nome && CONVENIOS_DISPONIVEIS[conv.nome]?.length > 0 && (
                        <div className="mt-3">
                          <label className="text-sm text-gray-600 mb-2 block">
                            Planos aceitos:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {CONVENIOS_DISPONIVEIS[conv.nome].map((plano) => (
                              <label
                                key={plano}
                                className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded"
                              >
                                <input
                                  type="checkbox"
                                  checked={conv.planos.includes(plano)}
                                  onChange={(e) => {
                                    const novos = [...pessoais.convenios];
                                    if (e.target.checked) {
                                      novos[idx].planos = [...novos[idx].planos, plano];
                                    } else {
                                      novos[idx].planos = novos[idx].planos.filter(
                                        (p) => p !== plano
                                      );
                                    }
                                    setPessoais({ ...pessoais, convenios: novos });
                                  }}
                                  className="w-4 h-4 text-indigo-600 rounded"
                                />
                                {plano}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      {conv.nome === 'Particular' && (
                        <p className="text-sm text-gray-500 mt-2 italic">
                          Atendimento particular não possui planos específicos.
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t pt-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Biografia
                  </label>
                  <textarea
                    value={pessoais.bio}
                    onChange={(e) =>
                      setPessoais({ ...pessoais, bio: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg h-32"
                  />
                </div>
              </div>
            )}

            {activeTab === 'areas' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">
                  Especialidade e Tempo de Consulta
                </h2>
                <div className="flex justify-between mb-4">
                  <label className="font-medium">Especialidades</label>
                  <button
                    onClick={() =>
                      setAreas({
                        ...areas,
                        especialidades: [
                          ...areas.especialidades,
                          {
                            nome: '',
                            duracao: '50',
                            formaAtendimento: 'Presencial',
                            convenios: [],
                          },
                        ],
                      })
                    }
                    className="text-indigo-600 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>
                {areas.especialidades.map((esp, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-4 mb-4 bg-gray-50"
                  >
                    <div className="flex justify-between mb-4">
                      <h4 className="font-semibold">Especialidade {idx + 1}</h4>
                      <button
                        onClick={() =>
                          setAreas({
                            ...areas,
                            especialidades: areas.especialidades.filter(
                              (_, i) => i !== idx
                            ),
                          })
                        }
                        className="text-red-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nome da Especialidade*
                        </label>
                        <select
                          value={esp.nome}
                          onChange={(e) => {
                            const novos = [...areas.especialidades];
                            novos[idx].nome = e.target.value;
                            setAreas({ ...areas, especialidades: novos });
                          }}
                          className="w-full px-4 py-2 border rounded-lg"
                        >
                          <option value="">Selecione a especialidade</option>
                          {(ESPECIALIDADES_POR_AREA[pessoais.areaSaude] || []).map((especialidade) => (
                            <option key={especialidade} value={especialidade}>
                              {especialidade}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Duração (minutos)*
                        </label>
                        <input
                          type="number"
                          value={esp.duracao}
                          onChange={(e) => {
                            const novos = [...areas.especialidades];
                            novos[idx].duracao = e.target.value;
                            setAreas({ ...areas, especialidades: novos });
                          }}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Forma de Atendimento*
                        </label>
                        <select
                          value={esp.formaAtendimento}
                          onChange={(e) => {
                            const novos = [...areas.especialidades];
                            novos[idx].formaAtendimento = e.target.value;
                            setAreas({ ...areas, especialidades: novos });
                          }}
                          className="w-full px-4 py-2 border rounded-lg"
                        >
                          <option value="Online">Online</option>
                          <option value="Presencial">Presencial</option>
                          <option value="Online e Presencial">
                            Online e Presencial
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4">
                  <label className="block font-medium mb-2">
                    Intervalo entre Consultas (minutos)*
                  </label>
                  <input
                    type="number"
                    value={areas.intervaloConsultas}
                    onChange={(e) =>
                      setAreas({ ...areas, intervaloConsultas: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="10"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Tempo de pausa entre uma consulta e outra
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'locais' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Locais e Horários</h2>
                  <button
                    onClick={() =>
                      setLocais([
                        ...locais,
                        {
                          id: Date.now(),
                          nome: '',
                          endereco: '',
                          cidade: '',
                          cep: '',
                          especialidades: [],
                          horarios: DIAS_SEMANA.map((d) => ({
                            dia: d.key,
                            ativo: false,
                            inicio: '08:00',
                            fim: '18:00',
                          })),
                        },
                      ])
                    }
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Local
                  </button>
                </div>

                {locais.map((local, localIdx) => (
                  <div
                    key={local.id}
                    className="border rounded-lg p-6 mb-4 bg-gray-50"
                  >
                    <div className="flex justify-between mb-4">
                      <h3 className="text-xl font-semibold">
                        Local {localIdx + 1}
                      </h3>
                      <button
                        onClick={() =>
                          setLocais(locais.filter((l) => l.id !== local.id))
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nome do Local*
                        </label>
                        <input
                          type="text"
                          value={local.nome}
                          onChange={(e) => {
                            const novos = [...locais];
                            novos[localIdx].nome = e.target.value;
                            setLocais(novos);
                          }}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="Consultório Centro"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          CEP*
                        </label>
                        <input
                          type="text"
                          value={local.cep}
                          onChange={(e) => {
                            const novos = [...locais];
                            novos[localIdx].cep = e.target.value;
                            setLocais(novos);
                          }}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="13010-000"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                          Endereço Completo*
                        </label>
                        <input
                          type="text"
                          value={local.endereco}
                          onChange={(e) => {
                            const novos = [...locais];
                            novos[localIdx].endereco = e.target.value;
                            setLocais(novos);
                          }}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="Rua das Flores, 123"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Cidade*
                        </label>
                        <input
                          type="text"
                          value={local.cidade}
                          onChange={(e) => {
                            const novos = [...locais];
                            novos[localIdx].cidade = e.target.value;
                            setLocais(novos);
                          }}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="Campinas"
                        />
                      </div>
                    </div>

                    {/* Seção de Dias e Horários */}
                    <div className="mt-6 border-t pt-4">
                      <label className="block text-sm font-medium mb-3">
                        Dias e Horários de Atendimento
                      </label>
                      <div className="space-y-3">
                        {DIAS_SEMANA.map((dia) => {
                          const horario = local.horarios?.find(
                            (h) => h.dia === dia.key
                          ) || { dia: dia.key, ativo: false, inicio: '08:00', fim: '18:00' };
                          return (
                            <div
                              key={dia.key}
                              className="flex items-center gap-4 p-3 bg-white rounded-lg border"
                            >
                              <label className="flex items-center gap-2 min-w-[140px] cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={horario.ativo}
                                  onChange={(e) => {
                                    const novos = [...locais];
                                    const horarioIdx = novos[localIdx].horarios.findIndex(
                                      (h) => h.dia === dia.key
                                    );
                                    if (horarioIdx >= 0) {
                                      novos[localIdx].horarios[horarioIdx].ativo = e.target.checked;
                                    } else {
                                      novos[localIdx].horarios.push({
                                        dia: dia.key,
                                        ativo: e.target.checked,
                                        inicio: '08:00',
                                        fim: '18:00',
                                      });
                                    }
                                    setLocais(novos);
                                  }}
                                  className="w-4 h-4 text-indigo-600 rounded"
                                />
                                <span className="text-sm font-medium">{dia.nome}</span>
                              </label>
                              {horario.ativo && (
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="time"
                                    value={horario.inicio}
                                    onChange={(e) => {
                                      const novos = [...locais];
                                      const horarioIdx = novos[localIdx].horarios.findIndex(
                                        (h) => h.dia === dia.key
                                      );
                                      if (horarioIdx >= 0) {
                                        novos[localIdx].horarios[horarioIdx].inicio = e.target.value;
                                      }
                                      setLocais(novos);
                                    }}
                                    className="px-3 py-1 border rounded-lg text-sm"
                                  />
                                  <span className="text-gray-500">até</span>
                                  <input
                                    type="time"
                                    value={horario.fim}
                                    onChange={(e) => {
                                      const novos = [...locais];
                                      const horarioIdx = novos[localIdx].horarios.findIndex(
                                        (h) => h.dia === dia.key
                                      );
                                      if (horarioIdx >= 0) {
                                        novos[localIdx].horarios[horarioIdx].fim = e.target.value;
                                      }
                                      setLocais(novos);
                                    }}
                                    className="px-3 py-1 border rounded-lg text-sm"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'precos' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Preços e Pagamentos</h2>
                  <button
                    onClick={() =>
                      setPrecos({
                        ...precos,
                        configuracoes: [
                          ...precos.configuracoes,
                          {
                            local: '',
                            especialidade: '',
                            valor: '',
                            formasPagamento: [],
                            cobrancaNoAgendamento: false,
                            percentualAdiantado: '50',
                            dadosBancarios: {
                              banco: '',
                              agencia: '',
                              conta: '',
                              tipoConta: 'Corrente',
                              chavePix: '',
                            },
                          },
                        ],
                      })
                    }
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Configuração
                  </button>
                </div>

                {precos.configuracoes.map((config, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-6 mb-4 bg-gray-50"
                  >
                    <div className="flex justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        Configuração {idx + 1}
                      </h3>
                      <button
                        onClick={() =>
                          setPrecos({
                            ...precos,
                            configuracoes: precos.configuracoes.filter(
                              (_, i) => i !== idx
                            ),
                          })
                        }
                        className="text-red-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Local*
                        </label>
                        <select
                          value={config.local}
                          onChange={(e) => {
                            const novos = [...precos.configuracoes];
                            novos[idx].local = e.target.value;
                            setPrecos({ ...precos, configuracoes: novos });
                          }}
                          className="w-full px-4 py-2 border rounded-lg"
                        >
                          <option value="">Selecione um local</option>
                          {locais.map((local) => (
                            <option key={local.id} value={local.nome}>
                              {local.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Especialidade*
                        </label>
                        <select
                          value={config.especialidade}
                          onChange={(e) => {
                            const novos = [...precos.configuracoes];
                            novos[idx].especialidade = e.target.value;
                            setPrecos({ ...precos, configuracoes: novos });
                          }}
                          className="w-full px-4 py-2 border rounded-lg"
                        >
                          <option value="">Selecione uma especialidade</option>
                          {areas.especialidades.map((esp, eIdx) => (
                            <option key={eIdx} value={esp.nome}>
                              {esp.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Valor da Consulta (R$)*
                        </label>
                        <input
                          type="number"
                          value={config.valor}
                          onChange={(e) => {
                            const novos = [...precos.configuracoes];
                            novos[idx].valor = e.target.value;
                            setPrecos({ ...precos, configuracoes: novos });
                          }}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="200"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block font-medium mb-3">
                        Formas de Pagamento Aceitas*
                      </label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          'PIX',
                          'Cartão de Crédito',
                          'Cartão de Débito',
                          'Dinheiro',
                          'Transferência Bancária',
                        ].map((forma) => (
                          <label
                            key={forma}
                            className="flex items-center gap-3"
                          >
                            <input
                              type="checkbox"
                              checked={config.formasPagamento.includes(forma)}
                              onChange={(e) => {
                                const novos = [...precos.configuracoes];
                                if (e.target.checked) {
                                  novos[idx].formasPagamento.push(forma);
                                } else {
                                  novos[idx].formasPagamento = novos[
                                    idx
                                  ].formasPagamento.filter((f) => f !== forma);
                                }
                                setPrecos({ ...precos, configuracoes: novos });
                              }}
                              className="w-4 h-4 text-indigo-600 rounded"
                            />
                            <span className="text-sm text-gray-700">
                              {forma}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 border-t pt-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={config.cobrancaNoAgendamento}
                          onChange={(e) => {
                            const novos = [...precos.configuracoes];
                            novos[idx].cobrancaNoAgendamento = e.target.checked;
                            setPrecos({ ...precos, configuracoes: novos });
                          }}
                          className="w-5 h-5 text-indigo-600 rounded"
                        />
                        <div>
                          <span className="font-medium text-gray-900">
                            Cobrança no Agendamento?
                          </span>
                          <p className="text-sm text-gray-600">
                            Exigir pagamento antecipado para confirmar o
                            agendamento
                          </p>
                        </div>
                      </label>

                      {config.cobrancaNoAgendamento && (
                        <div className="ml-8 mt-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Percentual Adiantado (%)*
                            </label>
                            <input
                              type="number"
                              value={config.percentualAdiantado}
                              onChange={(e) => {
                                const novos = [...precos.configuracoes];
                                novos[idx].percentualAdiantado = e.target.value;
                                setPrecos({ ...precos, configuracoes: novos });
                              }}
                              className="w-full px-4 py-2 border rounded-lg"
                              placeholder="50"
                              min="0"
                              max="100"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                              O agendamento só ocorrerá mediante ao pagamento de{' '}
                              {config.percentualAdiantado}% do valor da consulta
                            </p>
                          </div>

                          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Dados Bancários para Recebimento
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Banco*
                                </label>
                                <input
                                  type="text"
                                  value={config.dadosBancarios.banco}
                                  onChange={(e) => {
                                    const novos = [...precos.configuracoes];
                                    novos[idx].dadosBancarios.banco =
                                      e.target.value;
                                    setPrecos({
                                      ...precos,
                                      configuracoes: novos,
                                    });
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                  placeholder="Ex: Banco do Brasil"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Agência*
                                </label>
                                <input
                                  type="text"
                                  value={config.dadosBancarios.agencia}
                                  onChange={(e) => {
                                    const novos = [...precos.configuracoes];
                                    novos[idx].dadosBancarios.agencia =
                                      e.target.value;
                                    setPrecos({
                                      ...precos,
                                      configuracoes: novos,
                                    });
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                  placeholder="0000"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Conta*
                                </label>
                                <input
                                  type="text"
                                  value={config.dadosBancarios.conta}
                                  onChange={(e) => {
                                    const novos = [...precos.configuracoes];
                                    novos[idx].dadosBancarios.conta =
                                      e.target.value;
                                    setPrecos({
                                      ...precos,
                                      configuracoes: novos,
                                    });
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                  placeholder="00000-0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Tipo de Conta*
                                </label>
                                <select
                                  value={config.dadosBancarios.tipoConta}
                                  onChange={(e) => {
                                    const novos = [...precos.configuracoes];
                                    novos[idx].dadosBancarios.tipoConta =
                                      e.target.value;
                                    setPrecos({
                                      ...precos,
                                      configuracoes: novos,
                                    });
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                >
                                  <option value="Corrente">Corrente</option>
                                  <option value="Poupança">Poupança</option>
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">
                                  Chave PIX
                                </label>
                                <input
                                  type="text"
                                  value={config.dadosBancarios.chavePix}
                                  onChange={(e) => {
                                    const novos = [...precos.configuracoes];
                                    novos[idx].dadosBancarios.chavePix =
                                      e.target.value;
                                    setPrecos({
                                      ...precos,
                                      configuracoes: novos,
                                    });
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                  placeholder="email@exemplo.com ou telefone"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {precos.configuracoes.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhuma configuração de preço adicionada</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'politicas' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Políticas de Cancelamento
                  </h3>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={politicas.cancelamento.permiteCancelamento}
                        onChange={(e) =>
                          setPoliticas({
                            ...politicas,
                            cancelamento: {
                              ...politicas.cancelamento,
                              permiteCancelamento: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5 text-indigo-600 rounded"
                      />
                      <span className="font-medium">Permitir Cancelamento</span>
                    </label>

                    {politicas.cancelamento.permiteCancelamento && (
                      <>
                        <div>
                          <label className="block font-medium mb-2">
                            Prazo Mínimo para Cancelamento (horas)*
                          </label>
                          <input
                            type="number"
                            value={politicas.cancelamento.prazoMinimo}
                            onChange={(e) =>
                              setPoliticas({
                                ...politicas,
                                cancelamento: {
                                  ...politicas.cancelamento,
                                  prazoMinimo: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-3 border rounded-lg"
                            placeholder="24"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Cancelamentos com menos de{' '}
                            {politicas.cancelamento.prazoMinimo}h de
                            antecedência estarão sujeitos a multa
                          </p>
                        </div>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={politicas.cancelamento.cobraMulta}
                            onChange={(e) =>
                              setPoliticas({
                                ...politicas,
                                cancelamento: {
                                  ...politicas.cancelamento,
                                  cobraMulta: e.target.checked,
                                },
                              })
                            }
                            className="w-5 h-5 text-indigo-600 rounded"
                          />
                          <span className="font-medium">
                            Cobrar Multa por Cancelamento Tardio
                          </span>
                        </label>

                        {politicas.cancelamento.cobraMulta && (
                          <div>
                            <label className="block font-medium mb-2">
                              Percentual da Multa (%)*
                            </label>
                            <input
                              type="number"
                              value={politicas.cancelamento.percentualMulta}
                              onChange={(e) =>
                                setPoliticas({
                                  ...politicas,
                                  cancelamento: {
                                    ...politicas.cancelamento,
                                    percentualMulta: e.target.value,
                                  },
                                })
                              }
                              className="w-full px-4 py-3 border rounded-lg"
                              placeholder="50"
                              min="0"
                              max="100"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Políticas de Reagendamento
                  </h3>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={politicas.reagendamento.permitido}
                        onChange={(e) =>
                          setPoliticas({
                            ...politicas,
                            reagendamento: {
                              ...politicas.reagendamento,
                              permitido: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5 text-indigo-600 rounded"
                      />
                      <span className="font-medium">
                        Permitir Reagendamento
                      </span>
                    </label>

                    {politicas.reagendamento.permitido && (
                      <>
                        <div>
                          <label className="block font-medium mb-2">
                            Prazo Mínimo para Reagendamento (horas)*
                          </label>
                          <input
                            type="number"
                            value={politicas.reagendamento.prazoMinimo}
                            onChange={(e) =>
                              setPoliticas({
                                ...politicas,
                                reagendamento: {
                                  ...politicas.reagendamento,
                                  prazoMinimo: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-3 border rounded-lg"
                            placeholder="12"
                          />
                        </div>

                        <div>
                          <label className="block font-medium mb-2">
                            Limite de Reagendamentos por Consulta*
                          </label>
                          <input
                            type="number"
                            value={politicas.reagendamento.limiteReagendamentos}
                            onChange={(e) =>
                              setPoliticas({
                                ...politicas,
                                reagendamento: {
                                  ...politicas.reagendamento,
                                  limiteReagendamentos: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-3 border rounded-lg"
                            placeholder="2"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Políticas de Faltas
                  </h3>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={politicas.faltas.cobraFalta}
                        onChange={(e) =>
                          setPoliticas({
                            ...politicas,
                            faltas: {
                              ...politicas.faltas,
                              cobraFalta: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5 text-indigo-600 rounded"
                      />
                      <span className="font-medium">
                        Cobrar por Faltas sem Justificativa
                      </span>
                    </label>

                    {politicas.faltas.cobraFalta && (
                      <div>
                        <label className="block font-medium mb-2">
                          Percentual de Cobrança (%)*
                        </label>
                        <input
                          type="number"
                          value={politicas.faltas.percentualCobranca}
                          onChange={(e) =>
                            setPoliticas({
                              ...politicas,
                              faltas: {
                                ...politicas.faltas,
                                percentualCobranca: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-3 border rounded-lg"
                          placeholder="100"
                          min="0"
                          max="100"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Será cobrado {politicas.faltas.percentualCobranca}% do
                          valor da consulta em caso de falta
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block font-medium mb-2">
                        Tolerância de Atraso (minutos)*
                      </label>
                      <input
                        type="number"
                        value={politicas.faltas.toleranciaAtraso}
                        onChange={(e) =>
                          setPoliticas({
                            ...politicas,
                            faltas: {
                              ...politicas.faltas,
                              toleranciaAtraso: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-3 border rounded-lg"
                        placeholder="15"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Atrasos de até {politicas.faltas.toleranciaAtraso}{' '}
                        minutos serão aceitos sem cobrança
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'agenda' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Agenda</h2>
                  <button
                    onClick={() => {
                      setEventoEditando({
                        id: Date.now(),
                        tipo: 'compromisso',
                        titulo: '',
                        descricao: '',
                        dataInicio: new Date().toISOString().split('T')[0],
                        dataFim: new Date().toISOString().split('T')[0],
                        horaInicio: '09:00',
                        horaFim: '10:00',
                        diaInteiro: false,
                        cor: '#EC4899',
                      });
                      setModalEvento(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Evento
                  </button>
                </div>

                {/* Controles de navegação */}
                <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const novaData = new Date(dataAtualAgenda);
                        if (visualizacaoAgenda === 'semana') {
                          novaData.setDate(novaData.getDate() - 7);
                        } else {
                          novaData.setMonth(novaData.getMonth() - 1);
                        }
                        setDataAtualAgenda(novaData);
                      }}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-100"
                    >
                      ← Anterior
                    </button>
                    <button
                      onClick={() => setDataAtualAgenda(new Date())}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-100"
                    >
                      Hoje
                    </button>
                    <button
                      onClick={() => {
                        const novaData = new Date(dataAtualAgenda);
                        if (visualizacaoAgenda === 'semana') {
                          novaData.setDate(novaData.getDate() + 7);
                        } else {
                          novaData.setMonth(novaData.getMonth() + 1);
                        }
                        setDataAtualAgenda(novaData);
                      }}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-100"
                    >
                      Próximo →
                    </button>
                  </div>
                  <span className="font-semibold text-lg">
                    {dataAtualAgenda.toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVisualizacaoAgenda('semana')}
                      className={`px-4 py-2 rounded-lg ${
                        visualizacaoAgenda === 'semana'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Semana
                    </button>
                    <button
                      onClick={() => setVisualizacaoAgenda('mes')}
                      className={`px-4 py-2 rounded-lg ${
                        visualizacaoAgenda === 'mes'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Mês
                    </button>
                  </div>
                </div>

                {/* Visualização Semanal */}
                {visualizacaoAgenda === 'semana' && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-8 bg-gray-100">
                      <div className="p-3 border-r text-sm font-medium text-gray-500">
                        Horário
                      </div>
                      {(() => {
                        const inicio = new Date(dataAtualAgenda);
                        inicio.setDate(inicio.getDate() - inicio.getDay());
                        return Array.from({ length: 7 }, (_, i) => {
                          const dia = new Date(inicio);
                          dia.setDate(dia.getDate() + i);
                          const isHoje = dia.toDateString() === new Date().toDateString();
                          return (
                            <div
                              key={i}
                              className={`p-3 text-center border-r last:border-r-0 ${
                                isHoje ? 'bg-indigo-100' : ''
                              }`}
                            >
                              <div className="text-xs text-gray-500">
                                {dia.toLocaleDateString('pt-BR', { weekday: 'short' })}
                              </div>
                              <div className={`text-lg font-semibold ${isHoje ? 'text-indigo-600' : ''}`}>
                                {dia.getDate()}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {Array.from({ length: 12 }, (_, i) => {
                        const hora = 7 + i;
                        return (
                          <div key={hora} className="grid grid-cols-8 border-t">
                            <div className="p-2 border-r text-sm text-gray-500 bg-gray-50">
                              {hora.toString().padStart(2, '0')}:00
                            </div>
                            {Array.from({ length: 7 }, (_, j) => {
                              const inicio = new Date(dataAtualAgenda);
                              inicio.setDate(inicio.getDate() - inicio.getDay() + j);
                              const dataStr = inicio.toISOString().split('T')[0];
                              const eventosHora = eventos.filter(
                                (e) =>
                                  e.dataInicio === dataStr &&
                                  parseInt(e.horaInicio.split(':')[0]) === hora
                              );
                              return (
                                <div
                                  key={j}
                                  className="p-1 border-r last:border-r-0 min-h-[50px] hover:bg-gray-50 cursor-pointer"
                                  onClick={() => {
                                    setEventoEditando({
                                      id: Date.now(),
                                      tipo: 'compromisso',
                                      titulo: '',
                                      descricao: '',
                                      dataInicio: dataStr,
                                      dataFim: dataStr,
                                      horaInicio: `${hora.toString().padStart(2, '0')}:00`,
                                      horaFim: `${(hora + 1).toString().padStart(2, '0')}:00`,
                                      diaInteiro: false,
                                      cor: '#EC4899',
                                    });
                                    setModalEvento(true);
                                  }}
                                >
                                  {eventosHora.map((evento) => (
                                    <div
                                      key={evento.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEventoEditando(evento);
                                        setModalEvento(true);
                                      }}
                                      className="text-xs p-1 rounded text-white truncate cursor-pointer"
                                      style={{ backgroundColor: evento.cor }}
                                    >
                                      {evento.titulo || 'Sem título'}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Visualização Mensal */}
                {visualizacaoAgenda === 'mes' && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-7 bg-gray-100">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                        <div key={dia} className="p-3 text-center font-medium text-gray-600">
                          {dia}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {(() => {
                        const primeiroDia = new Date(
                          dataAtualAgenda.getFullYear(),
                          dataAtualAgenda.getMonth(),
                          1
                        );
                        const ultimoDia = new Date(
                          dataAtualAgenda.getFullYear(),
                          dataAtualAgenda.getMonth() + 1,
                          0
                        );
                        const diasAntes = primeiroDia.getDay();
                        const totalDias = ultimoDia.getDate();
                        const dias = [];

                        for (let i = 0; i < diasAntes; i++) {
                          dias.push(<div key={`antes-${i}`} className="p-2 border-t bg-gray-50 min-h-[80px]" />);
                        }

                        for (let dia = 1; dia <= totalDias; dia++) {
                          const data = new Date(dataAtualAgenda.getFullYear(), dataAtualAgenda.getMonth(), dia);
                          const dataStr = data.toISOString().split('T')[0];
                          const eventosdia = eventos.filter((e) => e.dataInicio === dataStr);
                          const isHoje = data.toDateString() === new Date().toDateString();

                          dias.push(
                            <div
                              key={dia}
                              className={`p-2 border-t min-h-[80px] cursor-pointer hover:bg-gray-50 ${
                                isHoje ? 'bg-indigo-50' : ''
                              }`}
                              onClick={() => {
                                setEventoEditando({
                                  id: Date.now(),
                                  tipo: 'compromisso',
                                  titulo: '',
                                  descricao: '',
                                  dataInicio: dataStr,
                                  dataFim: dataStr,
                                  horaInicio: '09:00',
                                  horaFim: '10:00',
                                  diaInteiro: false,
                                  cor: '#EC4899',
                                });
                                setModalEvento(true);
                              }}
                            >
                              <div className={`font-semibold mb-1 ${isHoje ? 'text-indigo-600' : ''}`}>
                                {dia}
                              </div>
                              {eventosdia.slice(0, 3).map((evento) => (
                                <div
                                  key={evento.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEventoEditando(evento);
                                    setModalEvento(true);
                                  }}
                                  className="text-xs p-1 rounded text-white truncate mb-1 cursor-pointer"
                                  style={{ backgroundColor: evento.cor }}
                                >
                                  {evento.titulo || 'Sem título'}
                                </div>
                              ))}
                              {eventosdia.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{eventosdia.length - 3} mais
                                </div>
                              )}
                            </div>
                          );
                        }

                        return dias;
                      })()}
                    </div>
                  </div>
                )}

                {/* Lista de eventos do período */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-4">Próximos Eventos</h3>
                  {eventos.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Nenhum evento cadastrado. Clique em "Novo Evento" para adicionar.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {eventos
                        .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
                        .slice(0, 10)
                        .map((evento) => (
                          <div
                            key={evento.id}
                            className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setEventoEditando(evento);
                              setModalEvento(true);
                            }}
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: evento.cor }}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{evento.titulo || 'Sem título'}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(evento.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')}
                                {!evento.diaInteiro && ` • ${evento.horaInicio} - ${evento.horaFim}`}
                              </div>
                            </div>
                            <span
                              className="text-xs px-2 py-1 rounded"
                              style={{ backgroundColor: evento.cor + '20', color: evento.cor }}
                            >
                              {TIPOS_EVENTO.find((t) => t.id === evento.tipo)?.nome}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Modal de Evento */}
                {modalEvento && eventoEditando && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">
                          {eventos.find((e) => e.id === eventoEditando.id) ? 'Editar' : 'Novo'} Evento
                        </h3>
                        <button
                          onClick={() => {
                            setModalEvento(false);
                            setEventoEditando(null);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Tipo de Evento*</label>
                          <select
                            value={eventoEditando.tipo}
                            onChange={(e) =>
                              setEventoEditando({
                                ...eventoEditando,
                                tipo: e.target.value as EventoAgenda['tipo'],
                                cor: TIPOS_EVENTO.find((t) => t.id === e.target.value)?.cor || '#EC4899',
                              })
                            }
                            className="w-full px-4 py-2 border rounded-lg"
                          >
                            {TIPOS_EVENTO.map((tipo) => (
                              <option key={tipo.id} value={tipo.id}>
                                {tipo.nome}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Título*</label>
                          <input
                            type="text"
                            value={eventoEditando.titulo}
                            onChange={(e) =>
                              setEventoEditando({ ...eventoEditando, titulo: e.target.value })
                            }
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="Ex: Férias de julho"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Descrição</label>
                          <textarea
                            value={eventoEditando.descricao}
                            onChange={(e) =>
                              setEventoEditando({ ...eventoEditando, descricao: e.target.value })
                            }
                            className="w-full px-4 py-2 border rounded-lg"
                            rows={2}
                            placeholder="Detalhes do evento..."
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="diaInteiro"
                            checked={eventoEditando.diaInteiro}
                            onChange={(e) =>
                              setEventoEditando({ ...eventoEditando, diaInteiro: e.target.checked })
                            }
                            className="w-4 h-4"
                          />
                          <label htmlFor="diaInteiro" className="text-sm">
                            Dia inteiro
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Data Início*</label>
                            <input
                              type="date"
                              value={eventoEditando.dataInicio}
                              onChange={(e) =>
                                setEventoEditando({ ...eventoEditando, dataInicio: e.target.value })
                              }
                              className="w-full px-4 py-2 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Data Fim*</label>
                            <input
                              type="date"
                              value={eventoEditando.dataFim}
                              onChange={(e) =>
                                setEventoEditando({ ...eventoEditando, dataFim: e.target.value })
                              }
                              className="w-full px-4 py-2 border rounded-lg"
                            />
                          </div>
                        </div>

                        {!eventoEditando.diaInteiro && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Hora Início</label>
                              <input
                                type="time"
                                value={eventoEditando.horaInicio}
                                onChange={(e) =>
                                  setEventoEditando({ ...eventoEditando, horaInicio: e.target.value })
                                }
                                className="w-full px-4 py-2 border rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Hora Fim</label>
                              <input
                                type="time"
                                value={eventoEditando.horaFim}
                                onChange={(e) =>
                                  setEventoEditando({ ...eventoEditando, horaFim: e.target.value })
                                }
                                className="w-full px-4 py-2 border rounded-lg"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 mt-6">
                        {eventos.find((e) => e.id === eventoEditando.id) && (
                          <button
                            onClick={() => {
                              setEventos(eventos.filter((e) => e.id !== eventoEditando.id));
                              setModalEvento(false);
                              setEventoEditando(null);
                            }}
                            className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                          >
                            Excluir
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setModalEvento(false);
                            setEventoEditando(null);
                          }}
                          className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            if (eventos.find((e) => e.id === eventoEditando.id)) {
                              setEventos(
                                eventos.map((e) => (e.id === eventoEditando.id ? eventoEditando : e))
                              );
                            } else {
                              setEventos([...eventos, eventoEditando]);
                            }
                            setModalEvento(false);
                            setEventoEditando(null);
                          }}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'clientes' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold mb-6">
                    Clientes e Resultados
                  </h2>

                  <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">
                          Total de Pacientes
                        </span>
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-3xl font-bold text-blue-900">142</p>
                      <p className="text-xs text-blue-700 mt-1">+12 este mês</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-900">
                          Faturamento Total
                        </span>
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-3xl font-bold text-green-900">
                        R$ 28.400
                      </p>
                      <p className="text-xs text-green-700 mt-1">Último mês</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-900">
                          Via AgendaSaúde
                        </span>
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-3xl font-bold text-purple-900">
                        R$ 18.200
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        64% do total
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-900">
                          Taxa de Faltas
                        </span>
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <p className="text-3xl font-bold text-red-900">8%</p>
                      <p className="text-xs text-red-700 mt-1">
                        11 faltas este mês
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-sm text-gray-600 mb-1">
                        Consultas Realizadas
                      </p>
                      <p className="text-2xl font-bold text-gray-900">134</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-sm text-gray-600 mb-1">
                        Cancelamentos
                      </p>
                      <p className="text-2xl font-bold text-gray-900">7</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-sm text-gray-600 mb-1">
                        Reagendamentos
                      </p>
                      <p className="text-2xl font-bold text-gray-900">23</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-4">Lista de Pacientes</h3>

                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Buscar paciente..."
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                            Nome
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                            Última Consulta
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                            Especialidade
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                            Total Pago
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            Maria Silva
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            15/12/2024
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            Psicologia Clínica
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Ativo
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            R$ 800
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            João Santos
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            20/12/2024
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            Terapia Cognitiva
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Ativo
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            R$ 1.200
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            Ana Costa
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            10/12/2024
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            Psicologia Clínica
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              Pendente
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            R$ 400
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            Pedro Oliveira
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            05/12/2024
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            Terapia Cognitiva
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              Inativo
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            R$ 600
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Mostrando 4 de 142 pacientes
                    </p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 border rounded hover:bg-gray-50">
                        Anterior
                      </button>
                      <button className="px-3 py-1 bg-indigo-600 text-white rounded">
                        1
                      </button>
                      <button className="px-3 py-1 border rounded hover:bg-gray-50">
                        2
                      </button>
                      <button className="px-3 py-1 border rounded hover:bg-gray-50">
                        3
                      </button>
                      <button className="px-3 py-1 border rounded hover:bg-gray-50">
                        Próximo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
