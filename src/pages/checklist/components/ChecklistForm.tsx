
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../../services/api';
import {
  processRulesEngine,
  type FeedbackItem,
  type ResponseData,
  getTrimester,
  getTrimesterText
} from '../../../utils/rules';
import { calculateIMCString } from '../../../utils/nutritionConstants';
import { PatientData } from '../types';
import { getChecklistItems, INLINE_FEEDBACK_IDS } from '../config';
import { ChecklistProgress } from './ChecklistProgress';
import { ChecklistHeader } from './ChecklistHeader';
import { ChecklistReview } from './ChecklistReview';
import { QuestionItem } from './QuestionItem';

interface ChecklistFormProps {
  patientData: PatientData;
  onPrev: () => void;
}

export default function ChecklistForm({ patientData, onPrev }: ChecklistFormProps) {
  const navigate = useNavigate();
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentBlock, setCurrentBlock] = useState(1);
  const totalBlocks = 5;

  // Rules Engine State
  const [activeAlerts, setActiveAlerts] = useState<FeedbackItem[]>([]);
  const [professionalAlerts, setProfessionalAlerts] = useState<FeedbackItem[]>([]);
  const [patientGuidelines, setPatientGuidelines] = useState<FeedbackItem[]>([]);
  const [selectedGuidelines, setSelectedGuidelines] = useState<Record<string, { selected: boolean; note: string }>>({});
  const [editedMessages, setEditedMessages] = useState<Record<string, string>>({});
  const [showGuidelinesSidebar, setShowGuidelinesSidebar] = useState(false);
  const [weightGainRecommendation, setWeightGainRecommendation] = useState<string | null>(null);

  // Weight Recommendation State
  const [weightRecMode, setWeightRecMode] = useState<'auto' | 'manual'>('auto');
  const [manualWeightRec, setManualWeightRec] = useState('');

  // Step 4 State (Review)
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const checklistItems = useMemo(() => getChecklistItems(patientData), [patientData]);

  // Calculate trimester from gestational week
  const currentTrimester = useMemo(() => {
    const week = parseInt(patientData.gestationalWeek || '0');
    return getTrimester(week);
  }, [patientData.gestationalWeek]);

  const trimesterText = useMemo(() => {
    return getTrimesterText(currentTrimester);
  }, [currentTrimester]);

  // Process Rules Engine Reactively
  useEffect(() => {
    const typedResponses: ResponseData = {
      dietary_pattern: responses.dietary_pattern || null,
      fruits_vegetables: responses.fruits_vegetables,
      dairy_products: responses.dairy_products,
      whole_grains: responses.whole_grains,
      meat_poultry_eggs: responses.meat_poultry_eggs,
      plant_proteins: responses.plant_proteins,
      fish_consumption: responses.fish_consumption,
      processed_foods: responses.processed_foods,
      folic_acid_supplement: responses.folic_acid_supplement || null,
      iron_supplement: responses.iron_supplement || null,
      calcium_supplement: responses.calcium_supplement || null,
      sun_exposure: responses.sun_exposure || null,
      anemia_test: responses.anemia_test || null,
      physical_activity: responses.physical_activity,
      coffee_tea_consumption: responses.coffee_tea_consumption,
      substances_use: responses.substances_use
    };

    const gestationalWeek = parseInt(patientData.gestationalWeek) || null;
    const currentWeight = parseFloat(patientData.currentWeight) || null;
    const preGestationalWeight = parseFloat(patientData.preGestationalWeight || responses.pre_gestational_weight) || null;
    const height = parseFloat(patientData.height) || null;

    const result = processRulesEngine({
      responses: typedResponses,
      gestationalWeek,
      currentWeight,
      preGestationalWeight,
      height
    });

    setActiveAlerts(result.allFeedback);
    setProfessionalAlerts(result.professionalAlerts);
    setPatientGuidelines(result.patientGuidelines);
    setWeightGainRecommendation(result.weightGainRecommendation);

    const newSelection = { ...selectedGuidelines };
    let hasChanges = false;
    result.allFeedback.forEach(alert => {
      if (newSelection[alert.id] === undefined && (alert.type === 'critical' || alert.type === 'recommendation' || alert.type === 'clinical' || alert.type === 'investigate')) {
        newSelection[alert.id] = { selected: true, note: '' };
        hasChanges = true;
      }
    });
    if (hasChanges) {
      setSelectedGuidelines(newSelection);
    }

    if (currentBlock === 5 && !selectedReviewId && result.allFeedback.length > 0) {
      setSelectedReviewId(result.allFeedback[0].id);
    }

  }, [responses, patientData]);

  useEffect(() => {
    setResponses(prev => ({
      ...prev,
      height: patientData.height,
      current_weight: patientData.currentWeight,
      gestational_week_detailed: patientData.gestationalWeek,
      pre_gestational_weight: patientData.preGestationalWeight
    }));
  }, [patientData]);

  const handleResponseChange = (itemId: string, value: any) => {
    setResponses(prev => ({ ...prev, [itemId]: value }));
    if (validationErrors[itemId] && value !== '' && value !== null && value !== undefined) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[itemId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    checklistItems.forEach(item => {
      if (item.required) {
        const value = responses[item.id];
        if (value === undefined || value === null || value === '' ||
          (typeof value === 'string' && value.trim() === '')) {
          errors[item.id] = 'Este campo é obrigatório';
        }
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getPatientIMC = () => {
    const preWeight = responses.pre_gestational_weight || patientData.preGestationalWeight;
    return calculateIMCString(preWeight, patientData.height);
  };

  const formatGuidelinesSummary = () => {
    const lines: string[] = [];
    activeAlerts.forEach(alert => {
      if (selectedGuidelines[alert.id]?.selected) {
        const note = selectedGuidelines[alert.id]?.note;
        const message = editedMessages[alert.id] || alert.message;
        lines.push(`[${alert.title}] ${message} ${note ? `(Nota: ${note})` : ''}`);
      }
    });
    if (lines.length === 0) return '';
    return '\n\n--- ORIENTAÇÕES SELECIONADAS ---\n' + lines.join('\n');
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      const firstErrorElement = document.querySelector('.border-red-300');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      let patientId = patientData.id;
      if (!patientId) {
        const newPatient = await patientService.create({
          nome: patientData.name,
          idade: parseInt(patientData.age),
          altura: parseFloat(patientData.height),
          peso_pre_gestacional: parseFloat(patientData.preGestationalWeight),
          contato: '',
          dados_adicionais: {}
        });
        patientId = newPatient.id;
      }

      const formattedResponses = { ...responses };
      checklistItems.forEach(item => {
        const value = formattedResponses[item.id];
        if (item.type === 'boolean' && typeof value === 'boolean') {
          formattedResponses[item.id] = value ? 'Sim' : 'Não';
        }
      });

      const preWeight = patientData.preGestationalWeight || responses.pre_gestational_weight;
      const evaluationData: {
        paciente_id: string;
        semana_gestacional: number;
        peso_atual: number;
        peso_pre_gestacional?: number;
        respostas: Record<string, any>;
        observacoes?: string;
      } = {
        paciente_id: patientId,
        semana_gestacional: parseInt(patientData.gestationalWeek),
        peso_atual: parseFloat(patientData.currentWeight),
        respostas: {
          ...formattedResponses,
          guidelines_selection: selectedGuidelines,
          weight_gain_mode: weightRecMode,
          weight_gain_manual: weightRecMode === 'manual' ? manualWeightRec : null,
        },
        observacoes: (responses.observations || '') + formatGuidelinesSummary()
      };

      if (preWeight) {
        evaluationData.peso_pre_gestacional = parseFloat(preWeight);
      }

      const createdEvaluation = await patientService.createEvaluation(evaluationData);
      setShowSuccess(true);
      setTimeout(() => {
        navigate(`/patient/${patientId}`, {
          state: {
            evaluationData: createdEvaluation,
            showReport: true
          }
        });
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting checklist:', error);
      if (error.response?.status !== 401) {
        alert('Erro ao salvar avaliação: ' + (error.response?.data?.detail || error.message || 'Erro desconhecido'));
      }
    }
  };

  const validateBlock = (block: number) => {
    const blockItems = checklistItems.filter(item => item.block === block && item.required);
    const errors: Record<string, string> = {};
    let isValid = true;

    blockItems.forEach(item => {
      const value = responses[item.id];
      if (value === undefined || value === null || value === '' ||
        (typeof value === 'string' && value.trim() === '')) {
        errors[item.id] = 'Este campo é obrigatório';
        isValid = false;
      }
    });

    if (!isValid) {
      setValidationErrors(prev => ({ ...prev, ...errors }));
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.border-red-300');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateBlock(currentBlock)) {
      setCurrentBlock(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentBlock > 1) {
      setCurrentBlock(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onPrev();
    }
  };

  const toggleGuideline = (id: string) => {
    setSelectedGuidelines(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        selected: !prev[id]?.selected,
        note: prev[id]?.note || ''
      }
    }));
  };

  const updateGuidelineNote = (id: string, note: string) => {
    setSelectedGuidelines(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        selected: true,
        note
      }
    }));
  };

  const getInlineFeedback = (itemId: string, response: any) => {
    if (response === undefined || response === null || response === '') {
      return { show: false, message: '', type: 'info' as const };
    }

    const engineAlert = activeAlerts.find(alert => {
      if (alert.id === itemId) return true;
      if (alert.id.startsWith(itemId + '_')) return true;
      if (itemId === 'folic_acid_supplement' && (alert.id.includes('folic') || alert.id.includes('acid'))) return true;
      if (itemId === 'iron_supplement' && alert.id.includes('iron')) return true;
      if (itemId === 'calcium_supplement' && alert.id.includes('calcium')) return true;
      if (itemId === 'anemia_test' && alert.id.includes('anemia')) return true;
      if (itemId === 'substances_use' && alert.id.includes('substance')) return true;
      if (itemId === 'coffee_tea_consumption' && alert.id.includes('coffee')) return true;
      return false;
    });

    if (engineAlert) {
      let type: 'info' | 'warning' | 'critical' | 'success' = 'info';
      const alertType = engineAlert.type;
      if (alertType === 'critical') type = 'critical';
      else if (alertType === 'recommendation' || alertType === 'warning' || alertType === 'clinical') type = 'warning';
      else if (alertType === 'success' || alertType === 'normal') type = 'success';
      return { show: true, message: engineAlert.message, type };
    }

    const item = checklistItems.find(i => i.id === itemId);
    if (item && item.feedback) {
      const match = item.feedback.find(f => f.condition(response));
      if (match) {
        let type: 'info' | 'warning' | 'critical' | 'success' = 'info';
        if (match.type === 'alert') type = 'critical';
        if (match.type === 'recommendation') type = 'warning';
        if (match.type === 'normal') type = 'success';
        return { show: true, message: match.message, type };
      }
    }
    return { show: false, message: '', type: 'info' as const };
  };

  const filteredSidebarAlerts = useMemo(() => {
    return activeAlerts.filter(alert =>
      !INLINE_FEEDBACK_IDS.has(alert.id.replace(/_alert|_guideline|_positive/g, '')) &&
      alert.type !== 'normal'
    );
  }, [activeAlerts]);

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <i className="ri-check-line text-3xl text-green-600"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Avaliação Concluída!</h3>
        <p className="text-gray-600 mb-4">Gerando relatório da avaliação nutricional...</p>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const MENU_STEPS = [
    { id: 1, title: 'Dieta e Nutrição', icon: 'ri-restaurant-line', description: 'Padrões e Qualidade' },
    { id: 2, title: 'Suplementos e Exames', icon: 'ri-capsule-line', description: 'Ferro, Cálcio, Ácido fólico' },
    { id: 3, title: 'Estilo de Vida', icon: 'ri-heart-pulse-line', description: 'Atividade, Sol, Hábitos' },
    { id: 4, title: 'Observações Finais', icon: 'ri-file-edit-line', description: 'Condutas adicionais' },
    { id: 5, title: 'Revisão e Plano', icon: 'ri-file-list-3-line', description: 'Gerar PDF e Conduta' }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start relative min-h-[calc(100vh-100px)] animate-fade-in p-4 lg:p-0">

      <ChecklistProgress
        currentBlock={currentBlock}
        setCurrentBlock={setCurrentBlock}
        patientData={patientData}
        steps={MENU_STEPS}
      />

      <div className="flex-1 w-full min-w-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">

          <ChecklistHeader
            currentBlock={currentBlock}
            steps={MENU_STEPS}
            patientData={patientData}
            onPrev={onPrev}
            patientIMC={getPatientIMC()}
            currentTrimester={currentTrimester}
            trimesterText={trimesterText}
          />

          {currentBlock === 5 ? (
            <ChecklistReview
              activeAlerts={activeAlerts}
              weightGainRecommendation={weightGainRecommendation}
              selectedReviewId={selectedReviewId}
              setSelectedReviewId={setSelectedReviewId}
              weightRecMode={weightRecMode}
              setWeightRecMode={setWeightRecMode}
              manualWeightRec={manualWeightRec}
              setManualWeightRec={setManualWeightRec}
              selectedGuidelines={selectedGuidelines}
              toggleGuideline={toggleGuideline}
              editedMessages={editedMessages}
              setEditedMessages={setEditedMessages}
              updateGuidelineNote={updateGuidelineNote}
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="space-y-8">
                {checklistItems
                  .filter(item => item.block === currentBlock)
                  .map(item => (
                    <QuestionItem
                      key={item.id}
                      item={item}
                      responses={responses}
                      handleResponseChange={handleResponseChange}
                      validationErrors={validationErrors}
                      getInlineFeedback={getInlineFeedback}
                    />
                  ))}
              </div>
            </div>
          )}

          <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-b-2xl">
            <button
              onClick={handlePrev}
              disabled={currentBlock === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${currentBlock === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
            >
              <i className="ri-arrow-left-line"></i>
              Voltar
            </button>

            {currentBlock === 5 ? (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-200 transform hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                <i className="ri-check-double-line text-xl"></i>
                Finalizar Avaliação
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transform hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                Próximo Passo
                <i className="ri-arrow-right-line text-xl"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={`
        fixed inset-0 z-50 lg:sticky lg:top-4 lg:z-auto lg:block lg:w-80 lg:flex-shrink-0 lg:border-l lg:border-gray-100 lg:bg-white lg:h-[calc(100vh-2rem)] lg:overflow-y-auto lg:rounded-2xl
        ${showGuidelinesSidebar ? 'block' : 'hidden'}
      `}>
        <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={() => setShowGuidelinesSidebar(false)} />
        <div className={`
          absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl lg:shadow-none lg:static lg:w-full lg:h-full lg:flex lg:flex-col
          transform transition-transform duration-300 ${showGuidelinesSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center lg:hidden">
            <h3 className="font-bold">Devolutiva</h3>
            <button onClick={() => setShowGuidelinesSidebar(false)}><i className="ri-close-line text-lg"></i></button>
          </div>

          <div className="hidden lg:block p-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-bold text-gray-700 flex items-center">
              <i className="ri-list-check mr-2 text-blue-500"></i>
              Devolutiva
            </h3>
            <p className="text-xs text-gray-500">Alertas para o prontuário</p>
          </div>

          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {filteredSidebarAlerts.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">Nenhum alerta pendente.</p>
            ) : (
              filteredSidebarAlerts.map(alert => {
                const isSelected = selectedGuidelines[alert.id]?.selected;
                return (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 text-sm bg-white shadow-sm transition-all ${isSelected ? 'opacity-100 ring-1 ring-blue-200' : 'opacity-70 grayscale'} 
                ${alert.type === 'critical' ? 'border-red-500' : alert.type === 'recommendation' ? 'border-amber-500' : 'border-green-500'}`}>
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-gray-800">{alert.title}</span>
                      <button onClick={() => toggleGuideline(alert.id)} className="text-gray-400 hover:text-blue-500">
                        <i className={isSelected ? "ri-checkbox-circle-fill text-blue-500" : "ri-checkbox-circle-line"}></i>
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
