import { FEEDBACK_CONTENT } from '../constants';
import { getTrimester } from '../helpers';
import { FeedbackItem, FeedbackType } from '../types';

export const getFolicAcidFeedback = (
    response: 'Sim' | 'Não' | 'Não sei' | null,
    gestationalWeek: number | null
): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];
    const trimester = getTrimester(gestationalWeek || 0);

    // Regra Trimestre < 14 semanas ou Lógica geral
    // O prompt especifica "Se SIM e 1º Trimestre" e "Se NÃO e 1º Trimestre"
    // Vamos aplicar a lógica geral ou focar no 1 tri?
    // "Regra de Trimester < 14 semanas" no prompt sugere foco no início.
    // Mas se for 3o tri e não tomar? O prompt não cobre explicitamente, mas vamos manter a lógica de alerta se NÃO tomar.

    // Simplificando com base no FEEDBACK_CONTENT fornecido:
    if (response === 'Sim') {
        // Se 1o trimestre, check_dose. Se outros, ok.
        if (trimester === 1) {
            const item = FEEDBACK_CONTENT.supplements_folic.check_dose;
            feedback.push({
                id: 'folic_acid_check',
                title: item.title,
                message: item.content,
                type: item.type as FeedbackType,
                audience: 'both',
                priority: 5
            });
        } else {
            // Positive feedback generic rewrite or keep generic 'ok'
            feedback.push({
                id: 'folic_acid_ok',
                title: 'Suplementação de Ácido Fólico',
                message: 'Paciente já faz uso. Manter conforme prescrição.',
                type: 'normal', // success
                audience: 'both',
                priority: 1
            });
        }
    } else if (response === 'Não') {
        // Prescribe
        const item = FEEDBACK_CONTENT.supplements_folic.prescribe;
        feedback.push({
            id: 'folic_acid_prescribe',
            title: item.title,
            message: item.content,
            type: item.type as FeedbackType, // alert
            audience: 'both',
            priority: 10
        });
    } else if (response === 'Não sei') {
        feedback.push({
            id: 'folic_acid_investigate',
            title: 'Ácido Fólico - Investigar',
            message: 'Faça uma avaliação mais aprofundada.',
            type: 'investigate' as any,
            audience: 'professional',
            priority: 9
        });
    }

    return feedback;
};

export const getIronSupplementFeedback = (
    response: 'Sim' | 'Não' | 'Não sei' | null
): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    if (response === 'Sim') {
        const item = FEEDBACK_CONTENT.supplements_iron.check_dose;
        feedback.push({
            id: 'iron_check',
            title: item.title,
            message: item.content,
            type: item.type as FeedbackType,
            audience: 'both',
            priority: 5
        });
    } else if (response === 'Não') {
        // ===== CENÁRIO B: REGRA DO WHATSAPP =====
        // Texto HÍBRIDO: traz dosagens/condições técnicas para a caixa editável
        // O profissional vê a regra técnica e pode simplificar a linguagem para o paciente
        feedback.push({
            id: 'iron_prescribe',
            title: 'Suplementação de Ferro Necessária',
            message: `Utilizar suplementação conforme prescrição médica.

Dose profilática universal: 1 comprimido de 200mg de sulfato ferroso ao dia (equivalente a 40mg de ferro elementar).

A ingestão do suplemento de ferro deve ocorrer com intervalo mínimo de 2 horas do suplemento de cálcio.

Opte por ingerir o suplemento antes de refeições, acompanhado de frutas ricas em vitamina C (laranja, acerola, limão, goiaba) para melhorar a absorção.`,
            type: 'critical',
            audience: 'patient', // Texto híbrido vai para caixa editável do paciente
            priority: 10,
            note: 'Lembre-se: pode simplificar a linguagem técnica antes de imprimir para a paciente.'
        });
        // Alerta técnico adicional para o profissional
        feedback.push({
            id: 'iron_prescribe_professional',
            title: 'ALERTA: PRESCREVER FERRO',
            message: 'Paciente não está suplementando ferro. Verificar prescrição existente ou iniciar profilaxia.',
            type: 'clinical',
            audience: 'professional',
            priority: 10
        });
    } else if (response === 'Não sei') {
        feedback.push({
            id: 'iron_investigate',
            title: 'Ferro - Investigar',
            message: 'Faça uma avaliação mais aprofundada.',
            type: 'investigate' as any,
            audience: 'professional',
            priority: 8
        });
    }

    return feedback;
};

export const getCalciumSupplementFeedback = (
    response: 'Sim' | 'Não' | 'Não sei' | null
): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    if (response === 'Sim') {
        const item = FEEDBACK_CONTENT.supplements_calcium.check_dose;
        feedback.push({
            id: 'calcium_check',
            title: item.title,
            message: item.content,
            type: item.type as FeedbackType,
            audience: 'both',
            priority: 5
        });
    } else if (response === 'Não') {
        const item = FEEDBACK_CONTENT.supplements_calcium.prescribe;
        feedback.push({
            id: 'calcium_prescribe',
            title: item.title,
            message: item.content,
            type: item.type as FeedbackType,
            audience: 'both',
            priority: 10
        });
    } else if (response === 'Não sei') {
        feedback.push({
            id: 'calcium_investigate',
            title: 'Cálcio - Investigar',
            message: 'Faça uma avaliação mais aprofundada.',
            type: 'investigate' as any,
            audience: 'professional',
            priority: 6
        });
    }

    return feedback;
};
