
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { patientService, pdfService } from '../../services/api';
import {
  getAlertsFromResponsesNew,
  calculateCriticalPoints,
  generateFigoWeightGainMessage,
  determineWeightGainStatus
} from '../../utils/rules';
import { CATEGORY_LIMITS } from '../../utils/rules/weight/figo/data';
import {
  calculateIMC,
  getIMCCategory,
  getExpectedWeightGainForWeek,
  evaluateWeightGainStatus
} from '../../utils/nutritionConstants';

import type { FeedbackItem } from '../../components/pdf/PatientGuidelinesDocument';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function PatientProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [showReport, setShowReport] = useState(false);
  const [evaluationData, setEvaluationData] = useState<any>(null);

  const getAlertsByCategory = (responses: any) => {
    const alerts = {
      critical: [] as FeedbackItem[],
      recommendations: [] as FeedbackItem[],
      normal: [] as FeedbackItem[],
      investigate: [] as FeedbackItem[],
      // NOVO: Alertas clínicos exclusivos para profissional (NÃO vão para o PDF)
      professionalOnly: [] as FeedbackItem[]
    };

    // Use the central Rules Engine instead of duplicated logic
    const allFeedback = getAlertsFromResponsesNew(responses);

    allFeedback.forEach(item => {
      const mappedItem: FeedbackItem = {
        id: item.id,
        title: item.title || '',
        message: item.message || '',
        type: (item.type === 'clinical' ? 'recommendation' :
          item.type === 'normal' ? 'adequate' :
            item.type === 'investigate' ? 'recommendation' :
              item.type) as any,
        audience: item.audience || 'both',
        note: item.note // Preservar nota técnica se existir
      };

      // ===== SISTEMA DE DUAS CAMADAS =====
      // Se audience === 'professional', vai APENAS para professionalOnly (só tela)
      if (item.audience === 'professional') {
        alerts.professionalOnly.push(mappedItem);
        return; // Não adicionar em outras categorias
      }

      // Para audience === 'patient' ou 'both', categorizar normalmente por tipo
      if (item.type === 'critical') {
        alerts.critical.push(mappedItem);
      } else if (item.type === 'recommendation' || item.type === 'clinical') {
        alerts.recommendations.push(mappedItem);
      } else if (item.type === 'investigate' || (item.id.includes('investigate'))) {
        alerts.investigate.push(mappedItem);
      } else if (item.type === 'normal' || item.type === 'success') {
        alerts.normal.push(mappedItem);
      } else if (item.type === 'warning') {
        alerts.recommendations.push(mappedItem);
      }
    });

    return alerts;
  };

  // Verifica se deve mostrar o relatório da nova avaliação
  useEffect(() => {
    const state = location.state as any;
    if (state?.showReport && state?.evaluationData) {
      setShowReport(true);
      setEvaluationData(state.evaluationData);
      setActiveTab('report');
    }
  }, [location.state]);

  const [selectedItems, setSelectedItems] = useState<FeedbackItem[]>([]);
  // NOVO: State para armazenar textos personalizados para cada item
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  // NOVO: State para controlar qual item está sendo editado
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Função para alternar seleção para o PDF da paciente
  const toggleSelection = (item: FeedbackItem) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      // Usar texto editado se existir
      const editedMessage = editedTexts[item.id];
      const itemToAdd = editedMessage ? { ...item, message: editedMessage } : item;
      return [...prev, itemToAdd];
    });
  };

  // Função para atualizar texto personalizado de um item
  const updateItemText = (itemId: string, newText: string) => {
    setEditedTexts(prev => ({ ...prev, [itemId]: newText }));
    // Atualizar também nos selectedItems se já estiver selecionado
    setSelectedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, message: newText } : item
      )
    );
  };

  // Obter o texto atual de um item (editado ou original)
  const getDisplayText = (item: FeedbackItem) => {
    return editedTexts[item.id] || item.message;
  };

  // Carregar guidelines selecionados se existirem no histórico
  useEffect(() => {
    if (evaluationData?.responses?.guidelines_selection) {
      const selection = evaluationData.responses.guidelines_selection;
      const alerts = getAlertsByCategory(evaluationData.responses);
      const allItems = [...alerts.critical, ...alerts.recommendations, ...alerts.normal];

      // Also check clinical recommendations if possible, but guidelines_selection mainly maps alerts
      const clinicalRecs = getClinicalRecommendations(evaluationData.calculations);
      allItems.push(...clinicalRecs);

      const loadedItems: FeedbackItem[] = [];

      Object.keys(selection).forEach(itemId => {
        if (selection[itemId].selected) {
          const originalItem = allItems.find(i => i.id === itemId);
          if (originalItem) {
            loadedItems.push({
              ...originalItem,
              note: selection[itemId].note // Load the note!
            });
          }
        }
      });

      if (loadedItems.length > 0) {
        setSelectedItems(loadedItems);
      }
    }
  }, [evaluationData]);

  const [patient, setPatient] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNormalAlerts, setShowNormalAlerts] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Calcula IMC e categoria para uso no relatório
  const patientIMCData = useMemo(() => {
    const preWeight = parseFloat(patient?.preGestationalWeight) || 0;
    const height = parseFloat(patient?.height) || 0;
    const imc = calculateIMC(preWeight, height);
    const category = getIMCCategory(imc);
    return { imc, category };
  }, [patient?.preGestationalWeight, patient?.height]);



  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [patientData, evaluationsData] = await Promise.all([
          patientService.getById(id),
          patientService.getEvaluations(id)
        ]);

        setPatient({
          id: patientData.id,
          name: patientData.nome,
          email: patientData.email,
          age: patientData.idade,
          gestationalWeek: evaluationsData[0]?.semana_gestacional || '-',
          dueDate: '-',
          preGestationalWeight: evaluationsData[0]?.peso_pre_gestacional || '-',
          currentWeight: evaluationsData[0]?.peso_atual || '-',
          height: patientData.altura,
          bloodType: '-',
          phone: patientData.contato,
          address: '-',
          emergencyContact: '-',
          // riskLevel: REMOVIDA - Substituído por pontos de inadequação
          status: 'normal'
        });

        // Pegar peso pré-gestacional para calcular ganho
        const preGestationalWeight = evaluationsData[0]?.peso_pre_gestacional || 0;

        setEvaluations(evaluationsData.map((e: any) => ({
          id: e.id,
          date: e.data_avaliacao,
          gestationalWeek: e.semana_gestacional,
          weight: e.peso_atual,
          weightGain: preGestationalWeight ? parseFloat((e.peso_atual - preGestationalWeight).toFixed(1)) : 0,
          hemoglobin: e.respostas?.hemoglobin_value || '-',
          bloodPressure: '-',
          riskScore: e.calculos?.risk_score || 0,
          riskLevel: e.calculos?.risk_level || 'Baixo',
          status: e.calculos?.risk_level === 'Baixo' ? 'normal' : e.calculos?.risk_level === 'Médio' ? 'attention' : 'alert',
          notes: e.observacoes,
          responses: e.respostas,
          preGestationalWeight: preGestationalWeight,
          pesoAtual: e.peso_atual,
          calculos: e.calculos
        })));

        // Se há avaliações e não veio de uma nova avaliação, criar evaluationData da última
        if (evaluationsData.length > 0 && !location.state?.evaluationData) {
          const lastEval = evaluationsData[0];
          const altura = patientData.altura > 3 ? patientData.altura / 100 : patientData.altura;
          const imcValue = lastEval.peso_pre_gestacional && altura
            ? (lastEval.peso_pre_gestacional / (altura * altura)).toFixed(1)
            : null;

          setEvaluationData({
            date: lastEval.data_avaliacao,
            semana_gestacional: lastEval.semana_gestacional,
            peso_atual: lastEval.peso_atual,
            peso_pre_gestacional: lastEval.peso_pre_gestacional,
            patientData: {
              name: patientData.nome,
              age: patientData.idade,
              gestationalWeek: lastEval.semana_gestacional
            },
            calculations: {
              imc: imcValue,
              imcClassification: imcValue ? (
                parseFloat(imcValue) < 18.5 ? 'Baixo peso' :
                  parseFloat(imcValue) < 25 ? 'Eutrofia' :
                    parseFloat(imcValue) < 30 ? 'Sobrepeso' : 'Obesidade'
              ) : null,
              weightGain: lastEval.peso_atual && lastEval.peso_pre_gestacional
                ? (lastEval.peso_atual - lastEval.peso_pre_gestacional).toFixed(1)
                : '0',
            },
            // Mudança para contagem de inadequações
            inadequacyCount: (() => {
              const r = lastEval.respostas;
              return calculateCriticalPoints(r);
            })(),
            riskLevel: null,
            responses: lastEval.respostas
          });
          setShowReport(true);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, location.state]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!patient) {
    return <div className="min-h-screen flex items-center justify-center">Paciente não encontrada</div>;
  }



  const getWeightGainStatus = () => {
    // Calcular dados base
    const currentW = parseFloat(patient.currentWeight);
    const preW = parseFloat(patient.preGestationalWeight);
    const h = parseFloat(patient.height) > 3 ? parseFloat(patient.height) / 100 : parseFloat(patient.height);
    const week = parseInt(patient.gestationalWeek) || 0;

    if (!currentW || !preW || !h || week < 1 || isNaN(currentW) || isNaN(preW)) {
      return { status: 'N/A', color: 'text-gray-600' };
    }

    const totalGain = currentW - preW;
    const category = patientIMCData.category;

    if (!category) {
      return { status: 'N/A', color: 'text-gray-600' };
    }

    const expectedGain = getExpectedWeightGainForWeek(category.label, week);
    if (!expectedGain) {
      return { status: 'N/A', color: 'text-gray-600' };
    }

    const status = evaluateWeightGainStatus(totalGain, expectedGain.min, expectedGain.max);

    if (status === 'loss' || status === 'loss_excessive') {
      return { status: 'Perda de Peso', color: 'text-red-600' };
    }
    if (status === 'loss_acceptable') {
      return { status: 'Perda Aceitável', color: 'text-blue-600' };
    }
    if (status === 'below') {
      return { status: 'Insuficiente', color: 'text-orange-600' };
    }
    if (status === 'above' || status === 'max_reached') {
      return { status: 'Excessivo', color: 'text-red-600' };
    }

    return { status: 'Adequado', color: 'text-green-600' };
  };

  const weightGainStatus = getWeightGainStatus();






  const getClinicalRecommendations = (calculations: any) => {
    const recommendations: FeedbackItem[] = [];

    // Clinical recommendations remain relevant
    if (calculations.riskScore >= 7) {
      recommendations.push({
        id: 'risk_high',
        title: 'Risco Alto',
        message: 'Acompanhamento nutricional intensivo necessário. Considerar encaminhamento para nutricionista especializada.',
        type: 'recommendation',
        audience: 'professional'
      });
    }

    if (calculations.imc) {
      const imc = parseFloat(calculations.imc);
      if (imc < 18.5) {
        recommendations.push({
          id: 'imc_low',
          title: 'Baixo Peso',
          message: 'Ganho de peso gestacional deve ser monitorado - baixo peso pré-gestacional',
          type: 'recommendation', // Changed type to conform to FeedbackItem
          audience: 'both'
        });
      } else if (imc >= 30) {
        recommendations.push({
          id: 'imc_high',
          title: 'Obesidade',
          message: 'Controle rigoroso do ganho de peso - obesidade pré-gestacional',
          type: 'recommendation',
          audience: 'both'
        });
      }
    }

    return recommendations;
  };



  // Helper to generate props for the Professional PDF
  const getPdfProps = (evalTarget: any, patientTarget: any) => {
    // Safe numeric parsing helper
    const safeFloat = (val: any) => {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Guard against undefined/null inputs
    if (!evalTarget) evalTarget = {};
    if (!patientTarget) patientTarget = {};

    const hVal = safeFloat(patientTarget.height);
    const patientHeight = hVal > 3 ? hVal / 100 : hVal;
    const preWeight = safeFloat(patientTarget.preGestationalWeight);
    const currWeight = safeFloat(evalTarget.weight || evalTarget.peso_atual || patientTarget.currentWeight);

    const gain = currWeight - preWeight;
    const week = parseInt(evalTarget.gestationalWeek || evalTarget.semana_gestacional || patientTarget.gestationalWeek) || 0;

    // IMC
    const imc = calculateIMC(preWeight, patientHeight);
    const category = getIMCCategory(imc);
    const classification = category?.labelFull || 'Eutrofia pré-gestacional';

    // Trimester
    const trimesterStr = week < 14 ? '1º Trimestre' : week <= 27 ? '2º Trimestre' : '3º Trimestre';
    const trimesterNum = (week < 14 ? 1 : week <= 27 ? 2 : 3) as 1 | 2 | 3; // Type cast fixed

    // Reference Values
    // Ensure CATEGORY_LIMITS is defined and has the key, else fallback safely
    const limits = (CATEGORY_LIMITS && (CATEGORY_LIMITS[classification] || CATEGORY_LIMITS['Eutrofia pré-gestacional'])) || {
      trim3: { min: 0, max: 0 },
      totalMax: 0,
      weeklyRateGrams: 0
    };

    const expectedRange = getExpectedWeightGainForWeek(category?.label || 'Eutrofia', week) || { min: 0, max: 0 };

    // Status
    const rawStatus = determineWeightGainStatus(classification, trimesterNum, gain, week);
    const context = { classification, semana: week, ganho: gain, trimester: trimesterNum };
    const statusMessage = generateFigoWeightGainMessage(context, rawStatus);

    let figoStatus: 'adequate' | 'below' | 'above' | 'loss' | 'critical' = 'adequate';
    if (rawStatus === 'adequate' || rawStatus === 'loss_acceptable') figoStatus = 'adequate';
    else if (rawStatus === 'below' || rawStatus === 'below_severe') figoStatus = 'below';
    else if (rawStatus === 'loss' || rawStatus === 'loss_excessive') figoStatus = 'loss';
    else figoStatus = 'above';

    // Alerts
    const responses = evalTarget.responses || evalTarget.respostas || {};
    let alerts: any = { critical: [], recommendations: [], normal: [], investigate: [] };
    try {
      if (typeof getAlertsByCategory === 'function') {
        alerts = getAlertsByCategory(responses);
      }
    } catch (e) { console.error('Alerts Error', e); }
    const calculations = evalTarget.calculos || evalTarget.calculations || {};
    const clinical = getClinicalRecommendations({ ...calculations, imc });

    // Guidelines Construction
    let guidelines: FeedbackItem[] = [];
    if (responses.guidelines_selection) {
      const all = [...alerts.critical, ...alerts.recommendations, ...alerts.normal, ...alerts.investigate, ...clinical];
      Object.keys(responses.guidelines_selection).forEach(id => {
        if (responses.guidelines_selection[id].selected) {
          const item = all.find(i => i.id === id);
          if (item) guidelines.push({ ...item, note: responses.guidelines_selection[id].note });
        }
      });
    } else {
      // Fallback
      if (activeTab === 'report' && evalTarget === evaluationData) {
        guidelines = selectedItems;
      } else {
        guidelines = [...alerts.critical, ...alerts.recommendations];
      }
    }

    // Professional Alerts - APENAS items com audience='professional'
    // Estes são alertas técnicos que NÃO devem ir para o PDF do paciente
    const allFlats = [...alerts.critical, ...alerts.recommendations, ...alerts.normal, ...alerts.investigate, ...alerts.professionalOnly, ...clinical];
    const proAlerts = allFlats.filter(a => a.audience === 'professional');

    // Safe Date Parsing
    const rawDate = evalTarget.date || evalTarget.data_avaliacao;
    const dateObj = rawDate ? new Date(rawDate) : new Date();

    return {
      patient: {
        name: patientTarget.name || '',
        age: (parseInt(patientTarget.age) || 0).toString(),
        height: patientHeight,
        gestationalWeek: week.toString(),
        preGestationalWeight: preWeight,
        currentWeight: currWeight,
        imc: imc || 0,
        imcClassification: classification,
        weightGain: gain,
        trimester: trimesterStr,
        professionalName: 'Nutricionista',
        evaluationDate: !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
        observations: evalTarget.notes || evalTarget.observacoes || evalTarget.observacao || ''
      },
      figo: {
        expectedMin: expectedRange.min || 0,
        expectedMax: expectedRange.max || 0,
        totalMin: limits?.trim3?.min || 0,
        totalMax: limits?.totalMax || 0,
        weeklyRate: `${limits?.weeklyRateGrams || 0}g`,
        status: figoStatus,
        statusMessage: statusMessage || ''
      },
      patientGuidelines: guidelines,
      professionalAlerts: proAlerts,
      showProfessionalPage: true
    };
  };

  const handleDeletePatient = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta paciente? Esta ação não pode ser desfeita.')) {
      try {
        await patientService.delete(id || '');
        navigate('/dashboard');
      } catch (error) {
        console.error('Erro ao excluir paciente:', error);
        alert('Erro ao excluir paciente. Tente novamente.');
      }
    }
  };

  const handleDownloadPDF = async (
    evaluationTarget: any,
    patientTarget: any,
    options: { showProfessional?: boolean, guidelines?: FeedbackItem[], fileNamePrefix?: string } = {}
  ) => {
    try {
      const { showProfessional = true, guidelines, fileNamePrefix = 'Relatorio' } = options;
      // Get standard props compatible with backend
      const props = getPdfProps(evaluationTarget, patientTarget);

      // Create request object matching backend PDFRequest
      const pdfRequest = {
        patient: props.patient,
        figo: props.figo,
        patientGuidelines: guidelines || props.patientGuidelines,
        professionalAlerts: showProfessional ? props.professionalAlerts : []
      };

      const blob = await pdfService.generate(pdfRequest);

      // Create and click download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileNamePrefix}_${patientTarget.name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };


  const handleSendEmail = async (
    evaluationTarget: any,
    patientTarget: any,
    options: { guidelines?: FeedbackItem[] } = {}
  ) => {
    if (isSendingEmail) return;

    try {
      const email = prompt("Confirmar email para envio:", patientTarget.email || "");
      if (!email) return;

      if (!confirm(`Enviar relatório para ${email}?`)) return;

      setIsSendingEmail(true);

      const { guidelines } = options;

      // Get props but ensure we strictly filter for patient version (no professional alerts)
      const props = getPdfProps(evaluationTarget, patientTarget);

      const pdfRequest = {
        patient: props.patient,
        figo: props.figo,
        patientGuidelines: guidelines || props.patientGuidelines,
        professionalAlerts: [], // Client copy has NO professional alerts
        email: email,
        subject: `Relatório Nutricional - ${patientTarget.name}`,
        message: `Olá, ${patientTarget.name}!\n\nSegue em anexo o seu relatório de avaliação nutricional realizado no sistema NutriPré.\n\nQualquer dúvida, entre em contato.\n\nAtenciosamente,\nEquipe NutriPré`
      };

      await pdfService.sendEmail(pdfRequest);
      alert("Email enviado com sucesso!");

    } catch (error) {
      console.error('Error sending email:', error);
      alert('Erro ao enviar email. Tente novamente.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <i className="ri-arrow-left-line text-xl text-gray-600"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {showReport ? 'Relatório da Avaliação' : 'Perfil da Paciente'}
            </h1>
            <p className="text-sm text-gray-500">{patient?.name || 'Carregando...'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!showReport && (
            <button
              onClick={handleDeletePatient}
              className="flex items-center justify-center w-10 h-10 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
              title="Excluir Paciente"
            >
              <i className="ri-delete-bin-line text-lg"></i>
            </button>
          )}

          <button
            onClick={() => navigate('/checklist', { state: { patientId: id } })}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <i className="ri-add-line text-lg"></i>
            <span className="font-medium text-sm">Nova Avaliação</span>
          </button>

          {patient && evaluations.length > 0 && evaluationData && (
            <button
              onClick={() => handleDownloadPDF(evaluationData, patient)}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
            >
              <i className="ri-file-pdf-line text-red-500"></i>
              <span className="font-medium text-sm">Baixar PDF</span>
            </button>
          )}

          {patient && evaluations.length > 0 && evaluationData && (
            <button
              onClick={() => handleSendEmail(evaluationData, patient)}
              disabled={isSendingEmail}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors shadow-sm border border-gray-200 ${isSendingEmail ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              title="Enviar PDF por email"
            >
              {isSendingEmail ? (
                <i className="ri-loader-4-line animate-spin text-blue-500"></i>
              ) : (
                <i className="ri-mail-send-line text-blue-500"></i>
              )}
              <span className="font-medium text-sm">{isSendingEmail ? 'Enviando...' : 'Enviar Email'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
        <div className="flex gap-1">
          {showReport && (
            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'report'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <i className="ri-file-list-3-line mr-2"></i>
              Relatório
            </button>
          )}
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <i className="ri-user-heart-line mr-2"></i>
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <i className="ri-history-line mr-2"></i>
            Histórico
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'charts'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <i className="ri-line-chart-line mr-2"></i>
            Gráficos
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pb-6">
        {activeTab === 'report' && evaluationData && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Report Header - Centered */}
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-list-3-line text-2xl text-green-600"></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">Relatório de Avaliação Nutricional</h2>
              <p className="text-sm text-gray-500">
                — Lista de Verificação FIGO —
              </p>
            </div>

            {/* Patient Info Header */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-pink-400">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <i className="ri-user-heart-line text-lg text-pink-600"></i>
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-800">{evaluationData?.patientData?.name || patient?.name || '[Nome]'}</p>
                  <p className="text-xs text-gray-500">{evaluationData?.patientData?.age || patient?.age || '-'} anos</p>
                </div>
              </div>
            </div>

            {/* 3 Main Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Status (Semana + Trimestre) */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className="ri-calendar-check-line text-2xl"></i>
                  </div>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Status Gestacional</span>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{evaluationData?.patientData?.gestationalWeek || evaluationData?.semana_gestacional || '-'}ª</p>
                  <p className="text-purple-100 text-sm">Semana Gestacional</p>
                  {(() => {
                    const week = parseInt(evaluationData?.patientData?.gestationalWeek || evaluationData?.semana_gestacional || '0');
                    const trimester = week < 14 ? '1º Trimestre' : week <= 27 ? '2º Trimestre' : '3º Trimestre';
                    const trimesterColor = week < 14 ? 'bg-blue-400' : week <= 27 ? 'bg-purple-300' : 'bg-pink-400';
                    return (
                      <div className="flex gap-2">
                        <span className={`inline-block mt-2 px-3 py-1 ${trimesterColor} rounded-full text-xs font-semibold`}>
                          {trimester}
                        </span>
                        {/* Pontos de Atenção - VISUAL NOVO */}
                        {evaluationData.inadequacyCount > 0 && (
                          <span className="inline-block mt-2 px-3 py-1 bg-red-400 text-white rounded-full text-xs font-semibold flex items-center">
                            <i className="ri-error-warning-fill mr-1"></i>
                            {evaluationData.inadequacyCount} {evaluationData.inadequacyCount === 1 ? 'Ponto' : 'Pontos'} de Atenção
                          </span>
                        )}
                        {/* Se não houver pontos, pode mostrar algo positivo ou nada */}
                        {evaluationData.inadequacyCount === 0 && (
                          <span className="inline-block mt-2 px-3 py-1 bg-green-400 text-white rounded-full text-xs font-semibold flex items-center">
                            <i className="ri-check-line mr-1"></i>
                            Adequado
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Card 2: Peso (Ganho Cumulativo) - Com cores dinâmicas baseadas no status */}
              {(() => {
                const weightGainStr = evaluationData?.calculations?.weightGain ||
                  evaluationData?.calculos?.weight_gain ||
                  (patient?.currentWeight && patient?.preGestationalWeight
                    ? (parseFloat(patient.currentWeight) - parseFloat(patient.preGestationalWeight)).toFixed(1)
                    : '0');
                const gain = parseFloat(weightGainStr);
                const week = parseInt(evaluationData?.patientData?.gestationalWeek || evaluationData?.semana_gestacional || '0');

                // Obter categoria IMC e metas esperadas
                // Obter categoria IMC (necessário para classificação)
                const category = patientIMCData.category;
                const classification = category?.labelFull || 'Eutrofia pré-gestacional';

                // Determinar trimestre base
                const trimester = week < 14 ? 1 : week <= 27 ? 2 : 3;

                // Avaliar status do ganho de peso usando a Engine oficial (mesma lógica das mensagens)
                const status = determineWeightGainStatus(classification, trimester, gain, week);

                // Definir cores baseadas no status (Mapeamento Solicitado)
                let bgGradient = 'from-green-500 to-green-600';
                let labelColor = 'text-green-100';
                let subColor = 'text-green-200';
                let statusLabel = 'Adequado';

                switch (status) {
                  // 🔴 VERMELHO (Crítico / Perda / Teto Total)
                  case 'below_severe':
                  case 'loss':
                  case 'loss_excessive':
                  case 'total_max_reached':
                    bgGradient = 'from-red-500 to-red-600';
                    labelColor = 'text-red-100';
                    subColor = 'text-red-200';
                    statusLabel = status === 'below_severe' ? '⚠️ Baixo Peso Crítico' :
                      status === 'loss' ? '⚠️ Perda de Peso' :
                        status === 'loss_excessive' ? '⚠️ Perda Excessiva' :
                          '⚠️ Teto Total Atingido';
                    break;

                  // 🟠 LARANJA (Alerta Alto / Salto)
                  case 'max_reached_next':
                    bgGradient = 'from-orange-500 to-orange-600';
                    labelColor = 'text-orange-100';
                    subColor = 'text-orange-200';
                    statusLabel = '⚠️ Salto de Trimestre';
                    break;

                  // 🟡 AMARELO (Atenção)
                  case 'above':
                  case 'max_reached': // Teto do trimestre atual
                  case 'below':
                    bgGradient = 'from-amber-500 to-amber-600';
                    labelColor = 'text-amber-100';
                    subColor = 'text-amber-200';
                    statusLabel = status === 'max_reached' ? 'Teto do Trimestre' :
                      status === 'below' ? 'Abaixo do Esperado' :
                        'Acima do Esperado';
                    break;

                  // 🟢 VERDE (Sucesso)
                  case 'adequate':
                  case 'loss_acceptable':
                  default:
                    bgGradient = 'from-green-500 to-green-600';
                    labelColor = 'text-green-100';
                    subColor = 'text-green-200';
                    statusLabel = status === 'loss_acceptable' ? 'Perda Aceitável' : 'Ganho Adequado';
                    break;
                }

                return (
                  <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl p-6 shadow-lg text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <i className="ri-scales-3-line text-2xl"></i>
                      </div>
                      <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Ganho de Peso</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold">{gain > 0 ? '+' : ''}{weightGainStr} kg</p>
                      <p className={`${labelColor} text-sm font-medium`}>{statusLabel}</p>
                      <p className={`${subColor} text-xs mt-2`}>
                        Peso atual: {evaluationData?.peso_atual || patient?.currentWeight || '-'} kg
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Card 3: Recomendação (Range por IMC) */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className="ri-target-line text-2xl"></i>
                  </div>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Meta Gestacional</span>
                </div>
                <div className="space-y-2">
                  {(() => {
                    const imc = evaluationData?.calculations?.imc ||
                      evaluationData?.calculos?.imc ||
                      (patient?.preGestationalWeight && patient?.height
                        ? calculateIMC(parseFloat(patient.preGestationalWeight), parseFloat(patient.height))
                        : null);

                    if (imc) {
                      const imcValue = parseFloat(imc);
                      let range = '';
                      let classification = '';

                      if (imcValue < 18.5) {
                        range = '9.7 a 12.2 kg';
                        classification = 'Baixo peso';
                      } else if (imcValue < 25) {
                        range = '8.0 a 12.0 kg';
                        classification = 'Eutrofia';
                      } else if (imcValue < 30) {
                        range = '7.0 a 9.0 kg';
                        classification = 'Sobrepeso';
                      } else {
                        range = '5.0 a 7.2 kg';
                        classification = 'Obesidade';
                      }

                      return (
                        <>
                          <p className="text-2xl font-bold">{range}</p>
                          <p className="text-blue-100 text-sm">Ganho recomendado até o final</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">IMC: {imc}</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{classification}</span>
                          </div>
                        </>
                      );
                    }
                    return <p className="text-blue-100">Dados insuficientes</p>;
                  })()}
                </div>
              </div>
            </div>

            {/* Clinical Alerts */}
            {evaluationData.responses && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center">
                    <i className="ri-check-double-line text-blue-600 mr-2"></i>
                    Seleção de Orientações para Paciente
                  </h3>
                  <span className="text-sm text-gray-500">
                    Selecione os itens para gerar o PDF personalizado
                  </span>
                </div>

                {(() => {
                  const alerts = getAlertsByCategory(evaluationData.responses);
                  const clinicalRecs = getClinicalRecommendations(evaluationData.calculations);
                  const hasItems = alerts.critical.length > 0 || alerts.recommendations.length > 0 || clinicalRecs.length > 0 || alerts.investigate.length > 0;

                  return (
                    <div className="space-y-4">
                      {/* ===== ALERTAS CLÍNICOS EXCLUSIVOS (SÓ TELA) ===== */}
                      {alerts.professionalOnly.length > 0 && (
                        <div className="space-y-3 border-2 border-dashed border-violet-300 p-4 rounded-xl bg-violet-50/50">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-violet-800 flex items-center">
                              <i className="ri-stethoscope-line mr-2"></i>
                              Alertas Clínicos (Exclusivo Profissional)
                            </h4>
                            <span className="text-[10px] bg-violet-200 text-violet-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <i className="ri-eye-line"></i>
                              SÓ TELA - NÃO VAI AO PDF
                            </span>
                          </div>
                          {alerts.professionalOnly.map((item) => (
                            <div key={item.id} className="p-3 rounded-lg bg-white border border-violet-200 shadow-sm">
                              <div className="flex items-start gap-2">
                                <i className="ri-information-line text-violet-600 mt-0.5"></i>
                                <div>
                                  <h5 className="font-bold text-violet-800 text-sm">{item.title}</h5>
                                  <p className="text-sm text-gray-700 whitespace-pre-line mt-1">{item.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ALERTAS CRÍTICOS */}
                      {alerts.critical.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-red-800 flex items-center bg-red-50 p-2 rounded">
                            <i className="ri-error-warning-line mr-2"></i>
                            Alertas Críticos
                          </h4>
                          {alerts.critical.map((item) => {
                            const isSmart = item.id === 'fish_veg_omega3';
                            const isEditing = editingItemId === item.id;
                            const isSelected = !!selectedItems.find(i => i.id === item.id);
                            return (
                              <div key={item.id} className={`p-3 rounded-lg border transition-colors ${isSmart ? 'border-purple-300 bg-purple-50' : 'border-red-100'
                                } ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}>
                                <div className="flex gap-4">
                                  <div className="pt-1">
                                    <input
                                      type="checkbox"
                                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                      onChange={() => toggleSelection(item)}
                                      checked={isSelected}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <h4 className={`font-bold text-sm ${isSmart ? 'text-purple-800' : 'text-red-800'}`}>{item.title}</h4>
                                      <div className="flex gap-2">
                                        {isSmart && <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-bold">ALERTA INTELIGENTE</span>}
                                        <button
                                          onClick={() => setEditingItemId(isEditing ? null : item.id)}
                                          className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full hover:bg-gray-300 flex items-center gap-1"
                                        >
                                          <i className={isEditing ? 'ri-check-line' : 'ri-edit-line'}></i>
                                          {isEditing ? 'OK' : 'Editar'}
                                        </button>
                                      </div>
                                    </div>
                                    {isEditing ? (
                                      <textarea
                                        className="w-full mt-2 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                        value={getDisplayText(item)}
                                        onChange={(e) => updateItemText(item.id, e.target.value)}
                                        rows={4}
                                        placeholder="Edite o texto que irá para o PDF da paciente..."
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-700 whitespace-pre-line mt-1">{getDisplayText(item)}</p>
                                    )}
                                    {editedTexts[item.id] && !isEditing && (
                                      <span className="text-[9px] text-green-600 flex items-center mt-1 gap-1">
                                        <i className="ri-check-line"></i> Texto personalizado
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* TÓPICOS A DISCUTIR (INVESTIGAR) */}
                      {alerts.investigate.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-orange-800 flex items-center bg-orange-50 p-2 rounded">
                            <i className="ri-question-line mr-2"></i>
                            Tópicos a Investigar
                          </h4>
                          {alerts.investigate.map((item) => {
                            const isEditing = editingItemId === item.id;
                            const isSelected = !!selectedItems.find(i => i.id === item.id);
                            return (
                              <div key={item.id} className={`p-3 rounded-lg border border-orange-100 transition-colors ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}>
                                <div className="flex gap-4">
                                  <div className="pt-1">
                                    <input
                                      type="checkbox"
                                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                      onChange={() => toggleSelection(item)}
                                      checked={isSelected}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-bold text-orange-800 text-sm">{item.title}</h4>
                                      <button
                                        onClick={() => setEditingItemId(isEditing ? null : item.id)}
                                        className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full hover:bg-gray-300 flex items-center gap-1"
                                      >
                                        <i className={isEditing ? 'ri-check-line' : 'ri-edit-line'}></i>
                                        {isEditing ? 'OK' : 'Editar'}
                                      </button>
                                    </div>
                                    {isEditing ? (
                                      <textarea
                                        className="w-full mt-2 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                        value={getDisplayText(item)}
                                        onChange={(e) => updateItemText(item.id, e.target.value)}
                                        rows={4}
                                        placeholder="Edite o texto que irá para o PDF da paciente..."
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-700 whitespace-pre-line mt-1">{getDisplayText(item)}</p>
                                    )}
                                    {editedTexts[item.id] && !isEditing && (
                                      <span className="text-[9px] text-green-600 flex items-center mt-1 gap-1">
                                        <i className="ri-check-line"></i> Texto personalizado
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* RECOMENDAÇÕES */}
                      {alerts.recommendations.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-yellow-800 flex items-center bg-yellow-50 p-2 rounded">
                            <i className="ri-lightbulb-line mr-2"></i>
                            Recomendações
                          </h4>
                          {alerts.recommendations.map((item) => {
                            const isEditing = editingItemId === item.id;
                            const isSelected = !!selectedItems.find(i => i.id === item.id);
                            return (
                              <div key={item.id} className={`p-3 rounded-lg border border-yellow-100 transition-colors ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}>
                                <div className="flex gap-4">
                                  <div className="pt-1">
                                    <input
                                      type="checkbox"
                                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                      onChange={() => toggleSelection(item)}
                                      checked={isSelected}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-bold text-yellow-800 text-sm">{item.title}</h4>
                                      <button
                                        onClick={() => setEditingItemId(isEditing ? null : item.id)}
                                        className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full hover:bg-gray-300 flex items-center gap-1"
                                      >
                                        <i className={isEditing ? 'ri-check-line' : 'ri-edit-line'}></i>
                                        {isEditing ? 'OK' : 'Editar'}
                                      </button>
                                    </div>
                                    {isEditing ? (
                                      <textarea
                                        className="w-full mt-2 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                        value={getDisplayText(item)}
                                        onChange={(e) => updateItemText(item.id, e.target.value)}
                                        rows={4}
                                        placeholder="Edite o texto que irá para o PDF da paciente..."
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-700 whitespace-pre-line mt-1">{getDisplayText(item)}</p>
                                    )}
                                    {editedTexts[item.id] && !isEditing && (
                                      <span className="text-[9px] text-green-600 flex items-center mt-1 gap-1">
                                        <i className="ri-check-line"></i> Texto personalizado
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* CONDUTAS CLÍNICAS */}
                      {clinicalRecs.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-blue-800 flex items-center bg-blue-50 p-2 rounded">
                            <i className="ri-stethoscope-line mr-2"></i>
                            Condutas Clínicas
                          </h4>
                          {clinicalRecs.map((item) => {
                            const isEditing = editingItemId === item.id;
                            const isSelected = !!selectedItems.find(i => i.id === item.id);
                            return (
                              <div key={item.id} className={`p-3 rounded-lg border border-blue-100 transition-colors ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}>
                                <div className="flex gap-4">
                                  <div className="pt-1">
                                    <input
                                      type="checkbox"
                                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                      onChange={() => toggleSelection(item)}
                                      checked={isSelected}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-bold text-blue-800 text-sm">{item.title}</h4>
                                      <button
                                        onClick={() => setEditingItemId(isEditing ? null : item.id)}
                                        className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full hover:bg-gray-300 flex items-center gap-1"
                                      >
                                        <i className={isEditing ? 'ri-check-line' : 'ri-edit-line'}></i>
                                        {isEditing ? 'OK' : 'Editar'}
                                      </button>
                                    </div>
                                    {isEditing ? (
                                      <textarea
                                        className="w-full mt-2 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                        value={getDisplayText(item)}
                                        onChange={(e) => updateItemText(item.id, e.target.value)}
                                        rows={4}
                                        placeholder="Edite o texto que irá para o PDF da paciente..."
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-700 whitespace-pre-line mt-1">{getDisplayText(item)}</p>
                                    )}
                                    {editedTexts[item.id] && !isEditing && (
                                      <span className="text-[9px] text-green-600 flex items-center mt-1 gap-1">
                                        <i className="ri-check-line"></i> Texto personalizado
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* MENSAGENS DE SUCESSO / NORMAL (HIDDEN BY DEFAULT) */}
                      {alerts.normal.length > 0 && (
                        <div className="space-y-3 border-t pt-4">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setShowNormalAlerts(!showNormalAlerts)}
                              className="text-sm text-gray-500 flex items-center gap-2 hover:text-gray-700 font-medium"
                            >
                              <i className={`ri-arrow-${showNormalAlerts ? 'up' : 'down'}-s-line`}></i>
                              {showNormalAlerts ? 'Ocultar Feedbacks de Sucesso' : `Ver Feedbacks de Sucesso (${alerts.normal.length})`}
                            </button>
                          </div>

                          {showNormalAlerts && (
                            <div className="space-y-2 animate-fade-in">
                              {alerts.normal.map((item) => (
                                <div key={item.id} className="flex gap-4 p-3 rounded-lg border border-green-100 bg-green-50/50 hover:bg-green-50 transition-colors">
                                  <div className="pt-1">
                                    <input
                                      type="checkbox"
                                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                      onChange={() => toggleSelection(item)}
                                      checked={!!selectedItems.find(i => i.id === item.id)}
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-green-800 text-sm">{item.title}</h4>
                                    <p className="text-sm text-gray-700 whitespace-pre-line">{item.message}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {!hasItems && alerts.normal.length === 0 && (
                        <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-400">
                          <p className="text-sm text-green-700 flex items-center">
                            <i className="ri-check-double-line mr-2"></i>
                            Nenhum alerta crítico identificado. Continuar acompanhamento de rotina.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Observations */}
            {evaluationData?.responses?.observations && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="ri-file-text-line text-gray-600 mr-2"></i>
                  Observações Adicionais
                </h3>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-700">{evaluationData.responses.observations}</p>
                </div>
              </div>
            )}

            {/* Action Buttons - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg flex justify-end gap-4 md:pl-72 z-20">

              {/* Botão de Download PDF (Técnico) */}
              <button
                onClick={() => handleDownloadPDF(evaluationData, patient, { fileNamePrefix: 'Prontuario_Tecnico' })}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <i className="ri-file-user-line"></i>
                <span>Prontuário (Técnico)</span>
              </button>

              {/* Botão de Download PDF (Paciente) - SEM página técnica */}
              <button
                onClick={() => handleDownloadPDF(evaluationData, patient, { showProfessional: false, guidelines: selectedItems, fileNamePrefix: 'Orientacoes' })}
                className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${selectedItems.length === 0
                  ? 'bg-blue-300 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                  }`}
                disabled={selectedItems.length === 0}
              >
                <i className="ri-printer-line"></i>
                <span>Imprimir Orientações ({selectedItems.length})</span>
              </button>

              {/* Botão Nova Avaliação */}
              <button
                onClick={() => navigate('/checklist', { state: { patientId: id } })}
                className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <span>Nova Avaliação</span>
                <i className="ri-add-line text-lg"></i>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header: Avatar + Info + Card Gestação */}
            <div className="flex gap-4">
              {/* Avatar e Info do Paciente */}
              <div className="bg-white rounded-2xl p-6 shadow-sm flex-1">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                    <i className="ri-user-heart-line text-2xl text-pink-500"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{patient.name}</h2>
                    <p className="text-sm text-gray-500">{patient.age} anos • {patient.gestationalWeek}ª semana</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${patient.riskLevel === 'alto' || patient.riskLevel === 'Alto'
                      ? 'bg-red-100 text-red-600'
                      : patient.riskLevel === 'médio' || patient.riskLevel === 'Médio'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                      }`}>
                      Risco {patient.riskLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Gestação */}
              <div className="bg-blue-50 rounded-2xl p-6 shadow-sm flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Gestação</h3>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Data Prevista do Parto</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {patient.gestationalWeek && patient.gestationalWeek !== '-'
                        ? (() => {
                          const dueDate = new Date();
                          dueDate.setDate(dueDate.getDate() + (40 - Number(patient.gestationalWeek)) * 7);
                          return dueDate.toLocaleDateString('pt-BR');
                        })()
                        : '--/--/----'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Semanas Restantes</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {patient.gestationalWeek && patient.gestationalWeek !== '-'
                        ? 40 - Number(patient.gestationalWeek)
                        : '--'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Atual */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                <i className="ri-heart-pulse-line text-red-500 mr-2"></i>
                Status Atual
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* IMC Pré-gestacional (Antigo IMC Atual - Modificado) */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-xs text-gray-500 font-medium mb-3">IMC Pré-gestacional</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="ri-body-scan-line text-green-600 text-lg"></i>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-800">
                        {patient.preGestationalWeight && patient.preGestationalWeight !== '-' && patient.height && patient.height !== '-'
                          ? calculateIMC(Number(patient.preGestationalWeight), Number(patient.height))
                          : '--'}
                      </span>
                      <p className="text-xs text-green-600 font-medium mt-0.5">
                        {patient.preGestationalWeight && patient.height
                          ? getIMCCategory(calculateIMC(Number(patient.preGestationalWeight), Number(patient.height)))?.label
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meta de Ganho Total (NOVO) */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-xs text-gray-500 font-medium mb-3">Meta de Ganho Total</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className="ri-flag-2-line text-blue-600 text-lg"></i>
                    </div>
                    <div>
                      <span className="text-xl font-bold text-gray-800">
                        {(() => {
                          if (patient.preGestationalWeight && patient.height) {
                            const imc = calculateIMC(Number(patient.preGestationalWeight), Number(patient.height));
                            const category = getIMCCategory(imc);
                            return category ? `${category.totalGainMin} a ${category.totalGainMax} kg` : '--';
                          }
                          return '--';
                        })()}
                      </span>
                      <p className="text-xs text-blue-600 font-medium mt-0.5">
                        Recomendado (FIGO)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Peso Atual */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-xs text-gray-500 font-medium mb-3">Peso Atual</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <i className="ri-scales-3-line text-gray-600 text-lg"></i>
                    </div>
                    <span className="text-2xl font-bold text-gray-800">
                      {patient.currentWeight && patient.currentWeight !== '-'
                        ? `${patient.currentWeight} kg`
                        : '-- kg'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Último: {evaluations.length > 0
                      ? new Date(evaluations[0].date).toLocaleDateString('pt-BR')
                      : '--'}
                  </p>
                </div>

                {/* Ganho de Peso */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-xs text-gray-500 font-medium mb-3">Ganho Atual</p>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${weightGainStatus.status === 'Adequado' ? 'bg-green-100'
                      : weightGainStatus.status === 'Insuficiente' ? 'bg-orange-100' : 'bg-red-100'
                      }`}>
                      <i className={`ri-arrow-up-line text-lg ${weightGainStatus.status === 'Adequado' ? 'text-green-600'
                        : weightGainStatus.status === 'Insuficiente' ? 'text-orange-600' : 'text-red-600'
                        }`}></i>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-800">
                        {patient.currentWeight && patient.currentWeight !== '-' &&
                          patient.preGestationalWeight && patient.preGestationalWeight !== '-'
                          ? `+${(Number(patient.currentWeight) - Number(patient.preGestationalWeight)).toFixed(1)} kg`
                          : '-- kg'}
                      </span>
                      <p className={`text-xs font-medium mt-0.5 ${weightGainStatus.color}`}>
                        {weightGainStatus.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${weightGainStatus.status === 'Adequado' ? 'bg-green-500'
                        : weightGainStatus.status === 'Insuficiente' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                      style={{
                        width: patient.currentWeight && patient.preGestationalWeight
                          ? `${Math.min(((Number(patient.currentWeight) - Number(patient.preGestationalWeight)) / 16) * 100, 100)}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Informações de Contato */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                <i className="ri-contacts-line text-blue-500 mr-2"></i>
                Informações de Contato
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="ri-phone-line text-gray-400"></i>
                    <span className="text-xs text-gray-500 font-medium">Telefone</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <i className="ri-whatsapp-line text-gray-400"></i>
                      <span className="text-sm text-gray-600">
                        {patient.phone && patient.phone !== '-' ? patient.phone : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="ri-map-pin-line text-gray-400"></i>
                    <span className="text-xs text-gray-500 font-medium">Endereço</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <i className="ri-user-location-line text-gray-400"></i>
                      <span className="text-sm text-gray-600">
                        {patient.address && patient.address !== '-' ? patient.address : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="ri-mail-line text-gray-400"></i>
                    <span className="text-xs text-gray-500 font-medium">Email</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <i className="ri-mail-line text-gray-400"></i>
                      <span className="text-sm text-gray-600">-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <i className="ri-flashlight-line text-yellow-500 mr-2"></i>
                Ações Rápidas
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => navigate('/checklist', { state: { patientId: id } })}
                  className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                    <i className="ri-add-line text-white text-lg"></i>
                  </div>
                  <span className="text-xs font-medium text-blue-700">Nova Avaliação</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mb-2">
                    <i className="ri-history-line text-white text-lg"></i>
                  </div>
                  <span className="text-xs font-medium text-purple-700">Ver Histórico</span>
                </button>

                <button
                  onClick={() => setActiveTab('charts')}
                  className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <i className="ri-line-chart-line text-white text-lg"></i>
                  </div>
                  <span className="text-xs font-medium text-green-700">Ver Gráficos</span>
                </button>

                {patient && evaluations.length > 0 && (
                  <button
                    onClick={() => handleDownloadPDF(evaluations[0], patient)}
                    className="flex flex-col items-center p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mb-2">
                      <i className="ri-file-pdf-line text-white text-lg"></i>
                    </div>
                    <span className="text-xs font-medium text-red-700">Baixar PDF</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Cabeçalho explicativo */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-800 flex items-center">
                <i className="ri-information-line mr-2"></i>
                Clique em uma avaliação para ver o relatório completo
              </p>
            </div>

            {evaluations.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-file-list-3-line text-2xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhuma avaliação ainda</h3>
                <p className="text-sm text-gray-600 mb-4">Inicie a primeira avaliação desta paciente</p>
                <button
                  onClick={() => navigate('/checklist', { state: { patientId: id } })}
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="ri-add-line"></i>
                  <span>Nova Avaliação</span>
                </button>
              </div>
            ) : (
              evaluations.map(evaluation => (
                <div
                  key={evaluation.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200"
                  onClick={() => {
                    // Monta os dados da avaliação para exibir no relatório
                    const evalData = {
                      date: evaluation.date,
                      patientData: {
                        name: patient.name,
                        age: patient.age,
                        gestationalWeek: evaluation.gestationalWeek
                      },
                      semana_gestacional: evaluation.gestationalWeek,
                      peso_atual: evaluation.weight,
                      peso_pre_gestacional: patient.preGestationalWeight,
                      calculations: {
                        imc: calculateIMC(patient.preGestationalWeight, patient.height),
                        weightGain: (evaluation.weight - patient.preGestationalWeight).toFixed(1),
                        riskScore: evaluation.riskScore,
                        riskLevel: {
                          level: evaluation.status === 'normal' ? 'Baixo' : evaluation.status === 'attention' ? 'Médio' : 'Alto',
                          color: evaluation.status === 'normal' ? 'text-green-600' : evaluation.status === 'attention' ? 'text-yellow-600' : 'text-red-600',
                          bgColor: evaluation.status === 'normal' ? 'bg-green-100' : evaluation.status === 'attention' ? 'bg-yellow-100' : 'bg-red-100'
                        }
                      },
                      responses: evaluation.responses
                    };
                    setEvaluationData(evalData);
                    setShowReport(true);
                    setActiveTab('report');
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="ri-file-text-line text-blue-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {new Date(evaluation.date).toLocaleDateString('pt-BR')}
                        </h3>
                        <p className="text-sm text-gray-600">{evaluation.gestationalWeek}ª semana gestacional</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${evaluation.status === 'normal'
                        ? 'bg-green-100 text-green-700'
                        : evaluation.status === 'attention'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                        {evaluation.status === 'normal' ? 'Normal' :
                          evaluation.status === 'attention' ? 'Atenção' : 'Alerta'}
                      </div>
                      <i className="ri-arrow-right-s-line text-gray-400 text-xl"></i>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-lg font-bold text-gray-800">{evaluation.weight}kg</div>
                      <div className="text-xs text-gray-600">Peso</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-lg font-bold text-gray-800">{evaluation.riskScore}/10</div>
                      <div className="text-xs text-gray-600">Risco</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-lg font-bold text-gray-800">
                        {evaluation.weight && patient.preGestationalWeight
                          ? `+${(evaluation.weight - patient.preGestationalWeight).toFixed(1)}`
                          : '-'}kg
                      </div>
                      <div className="text-xs text-gray-600">Ganho</div>
                    </div>
                  </div>

                  {evaluation.notes && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-sm text-gray-700 line-clamp-2">{evaluation.notes}</p>
                    </div>
                  )}

                  {/* Ação rápida de PDF */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center">
                      <i className="ri-eye-line mr-1"></i>
                      Clique para ver detalhes
                    </span>
                    <button
                      className="text-xs flex items-center space-x-1 text-red-600 hover:text-red-700 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Format safe date
                        let dateStr = '';
                        try { dateStr = new Date(evaluation.date).toLocaleDateString('pt-BR').replace(/\//g, '-'); } catch { }
                        handleDownloadPDF(evaluation, patient, { fileNamePrefix: `Relatorio_${dateStr}` });
                      }}
                    >
                      <i className="ri-file-pdf-line"></i>
                      <span>Baixar PDF</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* Info Card */}
            {patient.preGestationalWeight && patient.preGestationalWeight !== '-' && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-scales-3-line text-blue-600"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Peso Pré-gestacional de Referência</p>
                    <p className="text-lg font-bold text-blue-600">{patient.preGestationalWeight} kg</p>
                  </div>
                </div>
              </div>
            )}

            {/* Weight Gain Chart - NOVO GRÁFICO DE GANHO ACUMULATIVO */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <i className="ri-arrow-up-line text-green-500 mr-2"></i>
                Ganho de Peso Acumulativo
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Diferença entre peso atual e peso pré-gestacional ao longo da gestação
              </p>
              <div className="h-72 bg-white rounded-xl p-4 border border-gray-100">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...evaluations].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="gestationalWeek"
                      label={{ value: 'Semana Gestacional', position: 'insideBottom', offset: -5 }}
                      stroke="#6B7280"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      label={{ value: 'Ganho (kg)', angle: -90, position: 'insideLeft' }}
                      domain={['dataMin - 1', 'dataMax + 2']}
                      stroke="#6B7280"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value: number) => [`+${value} kg`, 'Ganho']}
                    />
                    {/* Linha de referência no zero (ponto de partida) */}
                    <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" label={{ value: 'Início', position: 'left', fill: '#9CA3AF', fontSize: 10 }} />
                    {/* Faixas de referência dinâmicas baseadas no IMC da paciente */}
                    <ReferenceLine
                      y={patientIMCData.category?.totalGainMin || 8.0}
                      stroke="#22C55E"
                      strokeDasharray="5 5"
                      label={{ value: `Mín. (${patientIMCData.category?.label || 'N/A'})`, position: 'right', fill: '#22C55E', fontSize: 10 }}
                    />
                    <ReferenceLine
                      y={patientIMCData.category?.totalGainMax || 12.0}
                      stroke="#EAB308"
                      strokeDasharray="5 5"
                      label={{ value: `Máx. (${patientIMCData.category?.label || 'N/A'})`, position: 'right', fill: '#EAB308', fontSize: 10 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weightGain"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7, stroke: '#10B981', strokeWidth: 2 }}
                      name="Ganho Acumulativo"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                {/* Valores dinâmicos baseados no IMC da paciente */}
                {(() => {
                  const category = patientIMCData.category;
                  const minGain = category?.totalGainMin || 8.0;
                  const maxGain = category?.totalGainMax || 12.0;
                  const classification = category?.label || 'Eutrofia';

                  return (
                    <>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-xs text-green-600 font-medium">Ganho Mínimo</div>
                        <div className="text-lg font-bold text-green-700">{minGain} kg</div>
                        <div className="text-xs text-green-500">{classification}</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-xs text-blue-600 font-medium">Ganho Atual</div>
                        <div className="text-lg font-bold text-blue-700">
                          +{evaluations.length > 0 ? evaluations[0].weightGain : 0} kg
                        </div>
                        <div className="text-xs text-blue-500">Acumulado</div>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="text-xs text-yellow-600 font-medium">Ganho Máximo</div>
                        <div className="text-lg font-bold text-yellow-700">{maxGain} kg</div>
                        <div className="text-xs text-yellow-500">{classification}</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>



            {/* Risk Score Trend */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <i className="ri-shield-line text-yellow-500 mr-2"></i>
                Evolução do Risco
              </h3>

              <div className="space-y-3">
                {evaluations.map((evaluation) => (
                  <div key={evaluation.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(evaluation.date).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${evaluation.riskScore <= 2 ? 'bg-green-500' :
                            evaluation.riskScore <= 4 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          style={{ width: `${(evaluation.riskScore / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {evaluation.riskScore}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}
