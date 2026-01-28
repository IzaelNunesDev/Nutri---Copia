
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import ChecklistForm from './components/ChecklistForm';
import PatientInfo from './components/PatientInfo';
import ConsultationSetup from './components/ConsultationSetup';
import { patientService } from '../../services/api';

export default function Checklist() {
  const navigate = useNavigate();
  const location = useLocation();

  // Step 1: Cadastro (só para nova paciente)
  // Step 2: Dados da Consulta (sempre)
  // Step 3: Checklist FIGO (sempre)
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [patientData, setPatientData] = useState({
    id: '',
    name: '',
    email: '',
    birthDate: '',
    age: '',
    gestationalWeek: '',
    currentWeight: '',
    height: '',
    preGestationalWeight: '',
    isReturningPatient: false,
    hasRecordedWeight: false,
    phone: '',
    address: '',
    // Novos campos de gestação (Backbone)
    dum: '',
    dpp: '',
    datingMethod: 'dum' as 'dum' | 'ultrassom'
  });

  // Se vier com patientId no state, é uma paciente retornando
  useEffect(() => {
    const loadPatient = async () => {
      const patientId = (location.state as any)?.patientId;
      if (patientId) {
        setIsInitialLoading(true); // Inicia loading inicial
        try {
          const p = await patientService.getById(patientId);

          // Calcular idade se tiver data de nascimento
          const birthDateStr = p.data_nascimento || '';
          let calculatedAge = '';
          if (birthDateStr) {
            const today = new Date();
            const birthDate = new Date(birthDateStr);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            calculatedAge = age.toString();
          }

          setPatientData({
            id: p.id,
            name: p.nome,
            email: p.email || '',
            birthDate: birthDateStr,
            age: calculatedAge || p.idade?.toString() || '',
            height: p.altura.toString(),
            preGestationalWeight: p.peso_pre_gestacional?.toString() || '',
            hasRecordedWeight: !!p.peso_pre_gestacional,
            isReturningPatient: true,
            gestationalWeek: '',
            currentWeight: '',
            phone: p.contato || '',
            address: p.dados_adicionais?.endereco || '',
            // Novos campos de gestação (Backbone)
            dum: p.dum || p.dados_adicionais?.dum || '',
            dpp: p.dpp || p.dados_adicionais?.dpp || '',
            datingMethod: p.metodo_datacao || p.dados_adicionais?.metodo_datacao || 'dum'
          });
          // Se faltar dados críticos (DUM, DPP, Peso), ficar na etapa 1 para completar
          if (!p.dum && !p.dados_adicionais?.dum) {
            setCurrentStep(1);
            toast.info("Por favor, complete os dados de gestação da paciente.");
          } else {
            // Caso contrário, pular direto para avaliação
            setCurrentStep(2);
          }
        } catch (error) {
          console.error("Error fetching patient", error);
          toast.error("Erro ao carregar dados da paciente. Tente novamente.");
        } finally {
          setIsInitialLoading(false); // Finaliza loading inicial
        }
      }
    };
    loadPatient();
  }, [location.state]);

  // Função para salvar nova paciente no banco (ou atualizar existente se estiver na etapa 1)
  const saveNewPatient = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (patientData.isReturningPatient && patientData.id) {
        // Se for paciente retornando na etapa 1, atualizar dados
        await patientService.update(patientData.id, {
          nome: patientData.name,
          email: patientData.email || undefined,
          data_nascimento: patientData.birthDate || undefined,
          altura: parseFloat(patientData.height),
          peso_pre_gestacional: parseFloat(patientData.preGestationalWeight),
          contato: patientData.phone,
          dum: patientData.dum || undefined,
          dpp: patientData.dpp || undefined,
          metodo_datacao: patientData.datingMethod || 'dum',
          dados_adicionais: {
            endereco: patientData.address
          }
        });
        return true;
      }

      const newPatient = await patientService.create({
        nome: patientData.name,
        email: patientData.email || undefined,
        data_nascimento: patientData.birthDate || undefined,
        idade: parseInt(patientData.age) || undefined,
        altura: parseFloat(patientData.height),
        peso_pre_gestacional: parseFloat(patientData.preGestationalWeight),
        contato: patientData.phone,
        // Novos campos de gestação (Backbone)
        dum: patientData.dum || undefined,
        dpp: patientData.dpp || undefined,
        metodo_datacao: patientData.datingMethod || 'dum',
        dados_adicionais: {
          endereco: patientData.address,
          // Backup dos dados de gestação em dados_adicionais (compatibilidade)
          dum: patientData.dum,
          dpp: patientData.dpp,
          metodo_datacao: patientData.datingMethod
        }
      });

      // Atualizar patientData com o ID retornado
      setPatientData(prev => ({
        ...prev,
        id: newPatient.id,
        isReturningPatient: false // Ainda não é "retornando" pois acabou de cadastrar
      }));

      return true;
    } catch (error: any) {
      console.error('Error creating/updating patient:', error);
      toast.error('Erro ao salvar dados: ' + (error.response?.data?.detail || error.message || 'Erro desconhecido'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      // PERMITIR VOLTAR PARA ETAPA 1 SEMPRE
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/dashboard');
    }
  };

  // Simplificação: Removendo getStepInfo complexo para usar Breadcrumb simples


  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Carregando dados da paciente...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header Simplificado (Backbone Style) */}
      <div className="flex flex-col gap-2">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center text-sm text-gray-500">
          <button onClick={() => navigate('/dashboard')} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
            <i className="ri-home-line"></i>
            <span>Início</span>
          </button>

          <i className="ri-arrow-right-s-line mx-2 text-gray-400"></i>
          <span
            onClick={() => setCurrentStep(1)}
            className={`cursor-pointer ${currentStep === 1 ? 'font-bold text-blue-700' : 'text-gray-600'} ${currentStep > 1 ? 'text-green-600' : ''}`}
          >
            {patientData.isReturningPatient ? 'Paciente' : 'Cadastro'}
          </span>

          <i className="ri-arrow-right-s-line mx-2 text-gray-400"></i>
          <span className={`${currentStep === 2 ? 'font-bold text-blue-700' : 'text-gray-600'} ${currentStep > 2 ? 'text-green-600' : ''}`}>
            Avaliação
          </span>

          <i className="ri-arrow-right-s-line mx-2 text-gray-400"></i>
          <span className={`${currentStep === 3 ? 'font-bold text-blue-700' : 'text-gray-600'}`}>
            Checklist FIGO
          </span>
        </div>

        {/* Título da Página - Contextual */}
        <h1 className="text-2xl font-bold text-gray-800">
          {currentStep === 1 && (patientData.isReturningPatient ? 'Confirmação de Dados' : 'Novo Cadastro')}
          {currentStep === 2 && 'Dados da Nova Avaliação'}
          {currentStep === 3 && 'Checklist Nutricional'}
        </h1>
      </div>

      {/* Content */}
      <div className="pb-6">
        {/* Etapa 1: Cadastro (agora visível para nova E retornando na etapa 1) */}
        {currentStep === 1 && (
          <PatientInfo
            data={patientData}
            onChange={setPatientData}
            onNext={handleNextStep}
            onSavePatient={saveNewPatient}
            isLoading={isLoading}
          />
        )}

        {/* Etapa 2: Dados da Consulta */}
        {currentStep === 2 && (
          <ConsultationSetup
            data={patientData}
            onChange={setPatientData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        )}

        {/* Etapa 3: Checklist FIGO */}
        {currentStep === 3 && (
          <ChecklistForm
            patientData={patientData}
            onPrev={handlePrevStep}
          />
        )}
      </div>
    </div>
  );
}

