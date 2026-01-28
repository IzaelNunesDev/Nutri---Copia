import { useState, useMemo, useEffect } from 'react';
import { calculosService } from '../../../services/api';
import {
    calculateIMC,
    getIMCClassification,
    calculateWeightGain,
    getTrimester,
    getTrimesterText,
    calculateExpectedWeightGain,
    calculateRoundedGestationalWeek,
    getFigoWeightGainFeedback
} from '../../../utils/rules';
import { calculateGestationalAgeFromDate } from '../../../utils/dateUtils';
import { ReferenceTables } from './ReferenceTables';

interface PatientData {
    id: string;
    name: string;
    email: string;
    birthDate: string;
    age: string;
    height: string;
    preGestationalWeight: string;
    gestationalWeek: string;
    currentWeight: string;
    isReturningPatient: boolean;
    hasRecordedWeight: boolean;
    phone: string;
    address: string;
    weightGain?: number;
    // Campos de gestação (Backbone)
    dum: string;
    dpp: string;
    datingMethod: 'dum' | 'ultrassom';
}

interface ConsultationSetupProps {
    data: PatientData;
    onChange: (data: PatientData) => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function ConsultationSetup({ data, onChange, onNext, onPrev }: ConsultationSetupProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    // Local state for raw inputs
    const [rawWeek, setRawWeek] = useState(data.gestationalWeek || '');
    const [days, setDays] = useState(0);
    const [showDaysField, setShowDaysField] = useState(true);

    // States for Calculator
    const [evaluationDate, setEvaluationDate] = useState(new Date().toISOString().split('T')[0]); // Default: Hoje
    const [weeksRemaining, setWeeksRemaining] = useState<number | null>(null);

    // Efeito para recálculo automático da IG baseada na Data da Avaliação e DUM (Backbone)
    useEffect(() => {
        if (data.dum && evaluationDate) {
            const { weeks, days, roundedWeeks, totalDays } = calculateGestationalAgeFromDate(data.dum, evaluationDate);

            setRawWeek(weeks.toString());
            setDays(days);

            // Calculando semanas restantes (40 semanas - semanas atuais)
            // 40 semanas * 7 dias = 280 dias totais
            const remainingDays = 280 - totalDays;
            const remainingWeeks = Math.ceil(remainingDays / 7);
            setWeeksRemaining(remainingWeeks > 0 ? remainingWeeks : 0);

            // Atualiza o dado global com o valor arredondado (Regra FIGO)
            if (roundedWeeks.toString() !== data.gestationalWeek) {
                onChange({ ...data, gestationalWeek: roundedWeeks.toString() });
            }
        }
    }, [evaluationDate, data.dum, data.datingMethod]); // Recalcula se mudar a data da avaliação ou a DUM

    // Se o método for Ultrassom, o DUM é calculado retroativamente (já feito no PatientInfo), então a lógica acima funcioma.
    // Mas se o usuário mudar o DUM original, ele muda em "data".


    // ============================================================
    // CÁLCULOS LOCAIS (Frontend) - Fonte única de verdade
    // ============================================================

    // Cálculo do IMC (local, sem backend)
    const imcResult = useMemo(() => {
        const weight = parseFloat(data.preGestationalWeight);
        const height = parseFloat(data.height);
        if (!weight || !height) return null;

        const imc = calculateIMC(weight, height);
        if (!imc) return null;

        const classification = getIMCClassification(imc);
        // Remover sufixo "pré-gestacional" para exibição simplificada
        const displayClassification = classification.replace(' pré-gestacional', '');

        return {
            imc,
            classification: displayClassification,
            fullClassification: classification
        };
    }, [data.preGestationalWeight, data.height]);

    // Análise de ganho de peso (local, sem backend)
    const weightGainAnalysis = useMemo(() => {
        const preWeight = parseFloat(data.preGestationalWeight);
        const currentWeight = parseFloat(data.currentWeight);
        const height = parseFloat(data.height);
        const week = parseInt(data.gestationalWeek);

        if (!preWeight || !currentWeight || !height || !week || !imcResult) return null;

        const weightGain = calculateWeightGain(currentWeight, preWeight);
        if (weightGain === null) return null;

        const trimester = getTrimester(week);
        if (!trimester) return null;

        const { min: expectedMin, max: expectedMax } = calculateExpectedWeightGain(
            imcResult.fullClassification,
            week
        );

        // Usar a função do figoWeightGainMessages que já tem a lógica correta
        const { status, message } = getFigoWeightGainFeedback(
            imcResult.fullClassification,
            trimester,
            week,
            weightGain,
            expectedMin,
            expectedMax
        );

        return {
            status,
            texto_orientacao: message,
            ganho_atual: weightGain,
            trimestre: trimester,
            trimestre_texto: getTrimesterText(trimester),
            faixa_esperada: { min: expectedMin, max: expectedMax }
        };
    }, [data.preGestationalWeight, data.currentWeight, data.height, data.gestationalWeek, imcResult]);

    // Effect to calculate and propagate rounded week
    // Only runs when rawWeek or days change (client side logic for UI sync, OR we could ask backend)
    // We'll keep simple logic here or use backend. Backend has "arredondar_semana_figo" logic.
    // For simplicity, we keep the rounding logic consistent with backend: days >= 4 rounds up.
    // Ideally updateRoundedWeek calls backend? No, that's too many calls. 
    // We already moved the main logic to backend. The UI state can do simple rounding or just rely on backend result.
    // But data.gestationalWeek needs to be the rounded value for other components (Checklist).

    const updateRoundedWeek = (week: string, d: number) => {
        if (!week) return;
        const w = parseInt(week);
        const rounded = calculateRoundedGestationalWeek(w, d);

        if (rounded.toString() !== data.gestationalWeek) {
            onChange({ ...data, gestationalWeek: rounded.toString() });
        }
    };

    const handleWeekChange = (val: string) => {
        setRawWeek(val);
        updateRoundedWeek(val, days);
        if (errors['gestationalWeek']) setErrors({ ...errors, gestationalWeek: '' });
    };

    const handleDaysChange = (val: number) => {
        setDays(val);
        updateRoundedWeek(rawWeek, val);
    };

    const handleChange = (field: string, value: string) => {
        onChange({ ...data, [field]: value });
        if (errors[field]) setErrors({ ...errors, [field]: '' });
    };

    // NÃO precisamos mais das funções manuais antigas (handleCalculateGestationalAge, handleDateInputChange, etc)
    // O cálculo agora é reativo via useEffect no evaluationDate/DUM.



    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!data.gestationalWeek?.trim()) newErrors.gestationalWeek = "Obrigatório";
        else {
            const week = parseInt(data.gestationalWeek);
            if (week < 1 || week > 42) newErrors.gestationalWeek = "Deve estar entre 1 e 42";
        }

        if (!data.currentWeight?.trim()) newErrors.currentWeight = "Obrigatório";
        else {
            const weight = parseFloat(data.currentWeight);
            if (weight < 30 || weight > 200) newErrors.currentWeight = "Peso inválido";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            // Persist current weight gain if available
            if (weightGainAnalysis?.ganho_atual !== undefined) {
                // We update the data before moving next so parent/backend receives it
                // Note: This relies on onNext handling the logic or the state update propagating.
                // Since this is a setup step, usually the update is enough.
                onChange({ ...data, weightGain: weightGainAnalysis.ganho_atual });
            }
            onNext();
        }
    };

    // Helper to get visual Feedback from analysis result
    const getAnalysisFeedback = () => {
        if (!weightGainAnalysis) return null;

        const { status, texto_orientacao, ganho_atual } = weightGainAnalysis;

        // Mapear status para cores e labels visuais
        // Status do frontend: 'loss' | 'loss_acceptable' | 'loss_excessive' | 'below' | 'adequate' | 'above' | 'max_reached'
        let feedbackColor = 'text-green-600';
        let feedbackBg = 'bg-green-100';
        let feedbackBorder = 'border-green-300';
        let feedbackIcon = 'ri-check-line';
        let feedbackLabel = 'Adequado';

        if (status === 'below' || status === 'loss' || status === 'loss_excessive') {
            // Perda crítica ou ganho insuficiente - VERMELHO
            feedbackColor = 'text-red-600';
            feedbackBg = 'bg-red-100';
            feedbackBorder = 'border-red-300';
            feedbackIcon = 'ri-alert-line';
            feedbackLabel = status === 'below' ? 'Abaixo do esperado' : 'Perda de Peso Crítica';
        } else if (status === 'below_severe') {
            // Crítico (Abaixo do mínimo do trimestre anterior) - VERMELHO (Igual loss/below)
            feedbackColor = 'text-red-600';
            feedbackBg = 'bg-red-100';
            feedbackBorder = 'border-red-300';
            feedbackIcon = 'ri-alert-line';
            feedbackLabel = 'Ganho Muito Baixo';
        } else if (status === 'loss_acceptable') {
            // Perda aceitável (Eutrofia/Sobrepeso/Obesidade) - AMARELO
            feedbackColor = 'text-amber-600';
            feedbackBg = 'bg-amber-100';
            feedbackBorder = 'border-amber-300';
            feedbackIcon = 'ri-information-line';
            feedbackLabel = 'Perda de Peso Aceitável';
        } else if (status === 'above' || status === 'max_reached' || status === 'total_max_reached') {
            // Ganho acima do esperado - AMARELO
            feedbackColor = 'text-amber-600';
            feedbackBg = 'bg-amber-100';
            feedbackBorder = 'border-amber-300';
            feedbackIcon = 'ri-arrow-up-line';
            feedbackLabel = status === 'max_reached' ? 'Máximo Atingido' : (status === 'total_max_reached' ? 'Ganho Máximo Total Atingido' : 'Acima do esperado');
        }
        // 'adequate' = padrão verde

        return {
            color: feedbackColor,
            bg: feedbackBg,
            border: feedbackBorder,
            icon: feedbackIcon,
            label: feedbackLabel,
            message: texto_orientacao,
            gain: ganho_atual
        };
    };

    const feedback = getAnalysisFeedback();

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            {/* Header */}
            <div className="border-b pb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="ri-scales-3-line text-green-600"></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Passo 1: Antropometria e Ganho de Peso</h2>
                        <p className="text-xs text-gray-500">Dados essenciais para cálculo das recomendações FIGO</p>
                    </div>
                </div>
            </div>

            {/* Resumo da Paciente */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="ri-user-heart-line text-blue-600 text-xl"></i>
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-blue-900 text-lg mb-1">{data.name}</h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4 mt-2">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-blue-400">Idade / Altura</p>
                                <p className="text-sm font-medium text-blue-800">{data.age} anos • {data.height}m</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-blue-400">Peso Pré-Gestacional</p>
                                <p className="text-sm font-medium text-blue-800">{data.preGestationalWeight} kg</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-blue-400">IMC Pré-Gestacional</p>
                                <p className="text-sm font-medium text-blue-800">
                                    {imcResult ? imcResult.imc.toFixed(1) : '-'} kg/m²
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-blue-400">Classificação (IMC)</p>
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${imcResult?.classification === 'Eutrofia' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {imcResult?.classification || 'Carregando...'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- NOVA SEÇÃO: Dados Temporais (Backbone) --- */}
            <div className="bg-white p-4 rounded-xl border border-blue-100 mb-4 shadow-sm">
                <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <i className="ri-calendar-check-line"></i> Dados Temporais da Avaliação
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Data da Avaliação (Selector) Task 2.1 */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Data da Avaliação
                        </label>
                        <input
                            type="date"
                            value={evaluationDate}
                            onChange={(e) => setEvaluationDate(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Data de referência para o cálculo da IG (IG = Data Avaliação - DUM)</p>
                    </div>

                    {/* Dados Estáticos de Referência (Read-only) Task 1.2 */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Dados da Gestação (Referência)
                        </label>
                        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                            <div className="flex justify-between mb-1">
                                <span>DUM (Data Última Mestruação):</span>
                                <span className="font-semibold text-gray-800">{data.dum ? new Date(data.dum).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Não informada'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>DPP (Data Provável Parto):</span>
                                <span className="font-semibold text-gray-800">{data.dpp ? new Date(data.dpp).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Não informada'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exibição das Semanas Restantes */}
                {weeksRemaining !== null && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <i className="ri-hourglass-line"></i>
                        <span>Faltam aproximadamente <strong>{weeksRemaining} semanas</strong> para o parto (40 sem).</span>
                    </div>
                )}
            </div>
            {/* -------------------------------------- */}

            {/* Campos da Consulta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-green-100 bg-green-50/30 p-4 rounded-xl">
                {/* Semana Gestacional e Dias */}
                <div className="space-y-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        <i className="ri-calendar-2-line mr-1 text-green-600"></i>
                        Idade Gestacional Atual
                    </label>

                    <div className={`grid gap-2 ${showDaysField ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        <div>
                            <input
                                type="number"
                                value={rawWeek}
                                onChange={e => handleWeekChange(e.target.value)}
                                min="1"
                                max="42"
                                className={`w-full p-2.5 border-2 rounded-lg bg-white focus:ring-2 focus:ring-green-500 transition-all 
                                    ${errors.gestationalWeek ? 'border-red-300' : 'border-green-200'}`}
                                placeholder="Semanas"
                            />
                            <span className="text-[10px] text-gray-500">Semanas (calculadas automaticamente) *</span>
                        </div>

                        {/* Campo de dias só aparece se checkbox marcado */}
                        {showDaysField && (
                            <div>
                                <select
                                    className="w-full p-2.5 border-2 border-green-200 rounded-lg bg-white focus:ring-2 focus:ring-green-500"
                                    value={days}
                                    onChange={(e) => handleDaysChange(parseInt(e.target.value))}
                                >
                                    {[0, 1, 2, 3, 4, 5, 6].map(d => (
                                        <option key={d} value={d}>{d} {d === 1 ? 'dia' : 'dias'}</option>
                                    ))}
                                </select>
                                <span className="text-[10px] text-gray-500">Dias (opcional)</span>
                            </div>
                        )}
                    </div>

                    {/* NOVO CHECKBOX para mostrar/ocultar dias */}
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                        <input
                            type="checkbox"
                            checked={showDaysField}
                            onChange={(e) => {
                                setShowDaysField(e.target.checked);
                                // Reset days to 0 when hiding the field
                                if (!e.target.checked) {
                                    setDays(0);
                                    updateRoundedWeek(rawWeek, 0);
                                }
                            }}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4"
                        />
                        <span>Informar dias exatos (para arredondamento FIGO)</span>
                    </label>

                    {/* Regra de Arredondamento - só mostra se dias estiver ativo */}
                    {showDaysField && (
                        <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-[10px] text-blue-800 font-bold uppercase">Semana para Avaliação (Arredondada)</p>
                                <span className="text-lg font-bold text-blue-700">
                                    {data.gestationalWeek}ª
                                </span>
                            </div>
                            <p className="text-[10px] text-blue-600 leading-tight">
                                *O sistema utilizará este valor para os cálculos. (4+ dias arredonda para cima).
                            </p>
                        </div>
                    )}

                    {errors.gestationalWeek && <span className="text-xs text-red-500 mt-1 block">{errors.gestationalWeek}</span>}
                    {/* Exibição do Trimestre (Baseado na semana arredondada) */}
                    {data.gestationalWeek && !isNaN(parseInt(data.gestationalWeek)) && (
                        <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600`}>
                            <span className="text-xs font-semibold">
                                {getTrimesterText(getTrimester(parseInt(data.gestationalWeek))) || 'Trimestre'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Peso Atual */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        <i className="ri-scales-2-line mr-1 text-green-600"></i>
                        Peso Atual (kg)
                    </label>
                    <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*[.,]?[0-9]*"
                        value={data.currentWeight}
                        onChange={e => {
                            const value = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                            const parts = value.split('.');
                            const cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : value;
                            handleChange('currentWeight', cleanValue);
                        }}
                        className={`w-full p-2.5 border-2 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${errors.currentWeight ? 'border-red-300' : 'border-green-200'
                            }`}
                        placeholder="Ex: 65.0"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Peso medido nesta consulta</p>
                    {errors.currentWeight && <span className="text-xs text-red-500">{errors.currentWeight}</span>}
                </div>
            </div>

            {/* Feedback de Ganho de Peso */}
            {feedback && (
                <div className={`border-2 ${feedback.border} ${feedback.bg} rounded-xl p-4`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 ${feedback.bg} rounded-full flex items-center justify-center`}>
                                <i className={`${feedback.icon} ${feedback.color} text-lg`}></i>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Ganho de Peso Atual</p>
                                <p className={`text-xs ${feedback.color} font-medium`}>{feedback.label}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-2xl font-bold ${feedback.color}`}>
                                {feedback.gain > 0 ? '+' : ''}{feedback.gain.toFixed(1)} kg
                            </p>
                        </div>
                    </div>
                    {/* Mensagem de orientação */}
                    <p className={`text-sm ${feedback.color}`}>
                        {feedback.message}
                    </p>
                </div>
            )}





            {/* Botões de Ação */}

            <div className="flex gap-3">
                <button
                    onClick={onPrev}
                    className="flex-shrink-0 px-6 py-3.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                    <i className="ri-arrow-left-line"></i>
                    <span>Voltar</span>
                </button>
                <button
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <span>Confirmar Dados e Iniciar Checklist</span>
                    <i className="ri-arrow-right-line"></i>
                </button>
            </div>
        </div>
    );
}
