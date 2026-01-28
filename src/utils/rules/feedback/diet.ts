import { DIET_CODES, FEEDBACK_CONTENT } from '../constants';
import { dietNameToCode } from '../helpers';
import type { FeedbackItem, FeedbackType, ResponseData } from '../types';

export const getDietFeedback = (dietPattern: string | null, description?: string): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];
    const dietCode = dietPattern ? dietNameToCode(dietPattern) : DIET_CODES.NAO;

    // Case 1: Sem restrições (Não) - Agora VERDE e com mensagem
    if (!dietCode || dietCode === DIET_CODES.NAO) {
        feedback.push({
            id: 'diet_none',
            title: 'DIETA SEM RESTRIÇÕES',
            message: 'Dieta sem restrições alimentares específicas. É recomendada uma alimentação saudável e equilibrada.',
            type: 'success', // Verde
            audience: 'patient',
            priority: 1
        });
        return feedback;
    }

    switch (dietCode) {
        case DIET_CODES.VEGANA: // AMARELO
            // CAIXA 1: PACIENTE
            feedback.push({
                id: 'diet_vegan_patient',
                title: 'DIETA VEGANA',
                message: `Dieta vegana requer atenção ao ferro, vitamina B12, proteínas, cálcio e ômega 3. É recomendado o uso de bebidas vegetais enriquecidas com cálcio ou suplementação desse mineral e o consumo adequado de leguminosas + cereais.`,
                type: 'warning', // Amarelo
                audience: 'patient',
                priority: 10
            });
            // CAIXA 2: PROFISSIONAL
            feedback.push({
                id: 'diet_vegan_professional',
                title: 'ALERTA CLÍNICO: DIETA VEGANA',
                message: 'Suplemente vitamina B12 e considere suplementar DHA.',
                type: 'clinical',
                audience: 'professional', // Apenas profissional
                priority: 10
            });
            break;

        case DIET_CODES.PESCETARIANA: // VERDE
            feedback.push({
                id: 'diet_pescetarian',
                title: 'DIETA PESCETARIANA',
                message: 'Dieta pescetariana bem planejada atende às necessidades nutricionais na gestação. Rico em ômega-3 pelo consumo de peixes. É importante ter atenção aos níveis de ferro.',
                type: 'success', // Verde
                audience: 'patient',
                priority: 3
            });
            break;

        case DIET_CODES.FLEXITARIANA: // VERDE
            feedback.push({
                id: 'diet_flexitarian',
                title: 'DIETA FLEXITARIANA',
                message: 'Dieta flexitariana bem planejada atende às necessidades nutricionais na gestação. Requer atenção ao ferro e proteínas.',
                type: 'success', // Verde
                audience: 'patient',
                priority: 3
            });
            break;

        case DIET_CODES.OVOLACTOVEGETARIANA: // AMARELO
            // CAIXA 1: PACIENTE
            feedback.push({
                id: 'diet_ovolacto_patient',
                title: 'DIETA OVOLACTOVEGETARIANA',
                message: 'Dieta ovolactovegetariana requer atenção ao ferro e ômega-3. É recomendado um consumo adequado de ovos e laticínios.',
                type: 'warning', // Amarelo
                audience: 'patient',
                priority: 6
            });
            // CAIXA 2: PROFISSIONAL
            feedback.push({
                id: 'diet_ovolacto_professional',
                title: 'ALERTA CLÍNICO: DIETA OVOLACTOVEGETARIANA',
                message: 'Considere suplementação de DHA.',
                type: 'clinical',
                audience: 'professional',
                priority: 8
            });
            break;

        case DIET_CODES.LACTOVEGETARIANA: // AMARELO
            // CAIXA 1: PACIENTE
            feedback.push({
                id: 'diet_lacto_patient',
                title: 'DIETA LACTOVEGETARIANA',
                message: 'Dieta lactovegetariana requer monitoramento de ferro, ômega-3, vitamina B12 e proteínas. É recomendado um consumo adequado de leguminosas + cereais e laticínios.',
                type: 'warning', // Amarelo
                audience: 'patient',
                priority: 6
            });
            // CAIXA 2: PROFISSIONAL
            feedback.push({
                id: 'diet_lacto_professional',
                title: 'ALERTA CLÍNICO: DIETA LACTOVEGETARIANA',
                message: 'Considere suplementação de DHA e de vitamina B12.',
                type: 'clinical',
                audience: 'professional',
                priority: 8
            });
            break;

        case DIET_CODES.ISENTA_LACTOSE: // VERDE
            feedback.push({
                id: 'diet_lactose_free',
                title: 'ISENTA DE LACTOSE',
                message: 'É recomendada uma alimentação saudável e equilibrada com consumo de laticínios zero lactose ou bebidas vegetais enriquecidas com cálcio.',
                type: 'success', // Verde
                audience: 'patient',
                priority: 3
            });
            break;

        case DIET_CODES.ISENTA_GLUTEN: // AMARELO
            feedback.push({
                id: 'diet_gluten_free',
                title: 'ISENTA DE GLÚTEN',
                message: 'Dieta sem glúten requer monitoramento de fibras e vitaminas do complexo B. Oriente consumo de cereais integrais sem glúten (arroz, quinoa, aveia sem contaminação).',
                type: 'warning', // Amarelo
                audience: 'patient',
                priority: 5
            });
            break;

        case DIET_CODES.OUTROS: // AMARELO (Profissional apenas)
            feedback.push({
                id: 'diet_others',
                title: 'DIETA COM RESTRIÇÕES ESPECÍFICAS',
                message: `Restrição informada: "${description || 'Não especificada'}".\nInvestigar a adequação nutricional individualmente e monitorar possíveis deficiências baseadas na restrição relatada.`,
                type: 'recommendation', // warning/recommendation (amarelo)
                audience: 'professional',
                priority: 8
            });
            break;
    }

    return feedback;
};

export const getFishConsumptionFeedback = (
    fishConsumption: 'Sim' | 'Não' | null,
    _dietPattern: string | null // Reservado para cruzamento peixe/dieta vegetariana
): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    if (fishConsumption === 'Sim') {
        const item = FEEDBACK_CONTENT.fish_consumption.positive;
        feedback.push({
            id: 'fish_consumption_ok',
            title: item.title,
            message: item.content,
            patientMessage: item.content,
            type: item.type as FeedbackType,
            audience: 'patient',
            priority: 1
        });
    } else if (fishConsumption === 'Não') {
        const item = FEEDBACK_CONTENT.fish_consumption.negative;
        const baseFeedback: FeedbackItem = {
            id: 'fish_consumption_low',
            title: item.title,
            message: item.content,
            patientMessage: item.content,
            type: item.type as FeedbackType, // 'critical'
            audience: 'patient', // Changed to patient as main audience for this text
            priority: 8
        };
        feedback.push(baseFeedback);

        // Check for professional content
        if ((item as any).professionalContent) {
            feedback.push({
                id: 'fish_consumption_prof',
                title: `ALERTA CLÍNICO: ${item.title}`,
                message: (item as any).professionalContent,
                type: 'clinical',
                audience: 'professional',
                priority: 8
            });
        }
    }

    return feedback;
};

export const getDietQualityFeedback = (responses: ResponseData): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    // Helper to generate generic structure
    const checkItem = (
        response: boolean | null,
        key: 'fruits_vegetables' | 'dairy_products' | 'whole_grains' | 'meat_poultry_eggs' | 'plant_proteins' | 'processed_foods',
        isInverted: boolean = false
    ) => {
        if (response === null) return;

        // Inverted: SIM is Bad (processed_foods)
        // Normal: SIM is Good

        const isGood = isInverted ? !response : response;
        console.log(`Processing ${key}: response=${response}, isGood=${isGood}`);

        if (isGood) {
            const item = FEEDBACK_CONTENT[key].positive;
            feedback.push({
                id: `${key}_ok`,
                title: item.title,
                message: item.content,
                patientMessage: item.content,
                type: item.type as FeedbackType,
                audience: 'patient',
                priority: 1
            });
        } else {
            const item = FEEDBACK_CONTENT[key].negative;
            feedback.push({
                id: `${key}_critical`,
                title: item.title,
                message: item.content,
                patientMessage: item.content,
                type: item.type as FeedbackType,
                audience: 'patient', // Main text is patient focused
                priority: 8,
                note: key === 'processed_foods' ? undefined : 'Verificar recordatório alimentar.'
            });

            // Check for professional content
            if ((item as any).professionalContent) {
                feedback.push({
                    id: `${key}_prof`,
                    title: `ALERTA CLÍNICO: ${item.title}`,
                    message: (item as any).professionalContent,
                    type: 'clinical',
                    audience: 'professional',
                    priority: 8
                });
            }
        }
    };

    checkItem(responses.fruits_vegetables, 'fruits_vegetables');
    checkItem(responses.dairy_products, 'dairy_products');
    checkItem(responses.whole_grains, 'whole_grains');
    checkItem(responses.meat_poultry_eggs, 'meat_poultry_eggs');
    checkItem(responses.plant_proteins, 'plant_proteins');
    checkItem(responses.processed_foods, 'processed_foods', true); // Inverted

    return feedback;
};
