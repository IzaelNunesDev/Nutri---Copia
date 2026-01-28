import {
    CalculatedData,
    FeedbackItem,
    ResponseData,
    RulesEngineInput,
    RulesEngineOutput
} from './types';
import {
    calculateIMC,
    calculateWeightGain,
    getIMCClassification,
    getTrimester
} from './helpers';
import {
    getDietFeedback,
    getDietQualityFeedback,
    getFishConsumptionFeedback
} from './feedback/diet';
import {
    getCalciumSupplementFeedback,
    getFolicAcidFeedback,
    getIronSupplementFeedback
} from './feedback/supplements';
import {
    getCoffeTeaFeedback,
    getPhysicalActivityFeedback,
    getSubstanceUseFeedback,
    getSunExposureFeedback
} from './feedback/lifestyle';
import { getAnemiaTestFeedback } from './feedback/exams';
import { generateWeightGainRecommendation } from './weight';

/**
 * Função principal do Motor de Regras
 * Processa todas as respostas e retorna feedbacks bifurcados
 */
export const processRulesEngine = (input: RulesEngineInput): RulesEngineOutput => {
    const { responses, gestationalWeek, currentWeight, preGestationalWeight, height } = input;

    // 1. Calcular dados
    const imc = preGestationalWeight && height
        ? calculateIMC(preGestationalWeight, height)
        : null;
    const imcClassification = imc ? getIMCClassification(imc) : null;
    const weightGain = currentWeight && preGestationalWeight
        ? calculateWeightGain(currentWeight, preGestationalWeight)
        : null;
    const trimester = getTrimester(gestationalWeek || 0);

    const calculatedData: CalculatedData = {
        imc,
        imcClassification,
        weightGain,
        gestationalWeek,
        trimester,
        riskScore: 0, // Será calculado ao final
        criticalPoints: 0
    };

    // 2. Coletar todos os feedbacks
    const allFeedback: FeedbackItem[] = [];

    // Dieta
    allFeedback.push(...getDietFeedback(responses.dietary_pattern, responses['dietary_pattern_desc']));

    // Cruzamento Peixe + Dieta
    allFeedback.push(...getFishConsumptionFeedback(responses.fish_consumption, responses.dietary_pattern));

    // Qualidade da Dieta
    allFeedback.push(...getDietQualityFeedback(responses));

    // Suplementação
    allFeedback.push(...getFolicAcidFeedback(responses.folic_acid_supplement, gestationalWeek));
    allFeedback.push(...getIronSupplementFeedback(responses.iron_supplement));
    allFeedback.push(...getCalciumSupplementFeedback(responses.calcium_supplement));

    // Exposição Solar
    allFeedback.push(...getSunExposureFeedback(responses.sun_exposure));

    // Exames
    allFeedback.push(...getAnemiaTestFeedback(responses.anemia_test));

    // Atividade Física
    allFeedback.push(...getPhysicalActivityFeedback(responses.physical_activity));

    // Café/Chá
    allFeedback.push(...getCoffeTeaFeedback(responses.coffee_tea_consumption));

    // Substâncias
    allFeedback.push(...getSubstanceUseFeedback(responses.substances_use));

    // 3. Bifurcar feedbacks
    const professionalAlerts = allFeedback.filter(
        f => f.audience === 'professional' || f.audience === 'both'
    );
    const patientGuidelines = allFeedback.filter(
        f => f.audience === 'patient' || f.audience === 'both'
    );

    // 4. Calcular Pontos Críticos (Antigo Score de Risco)
    // Regra: Conta quantos items tem type: 'critical'

    let criticalPoints = 0;
    allFeedback.forEach(f => {
        if (f.type === 'critical') criticalPoints++;
    });

    calculatedData.criticalPoints = criticalPoints;
    calculatedData.riskScore = criticalPoints;

    // 5. Gerar recomendação de ganho de peso
    const weightGainRecommendation = generateWeightGainRecommendation(
        imcClassification,
        weightGain,
        gestationalWeek,
        trimester
    );

    return {
        calculatedData,
        professionalAlerts,
        patientGuidelines,
        allFeedback,
        weightGainRecommendation
    };
};

/**
 * Função wrapper para compatibilidade com código existente
 */
export const getAlertsFromResponsesNew = (
    responses: Record<string, any>,
    calculations?: { imc?: number | string; gestationalWeek?: number; preGestationalWeight?: number; currentWeight?: number; height?: number }
): FeedbackItem[] => {
    const typedResponses: ResponseData = {
        dietary_pattern: responses.dietary_pattern || null,
        dietary_pattern_desc: responses.dietary_pattern_desc,
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

    const gestationalWeek = calculations?.gestationalWeek || null;
    const currentWeight = typeof calculations?.currentWeight === 'number' ? calculations.currentWeight : null;
    const preGestationalWeight = typeof calculations?.preGestationalWeight === 'number' ? calculations.preGestationalWeight : null;
    const height = typeof calculations?.height === 'number' ? calculations.height : null;

    const result = processRulesEngine({
        responses: typedResponses,
        gestationalWeek,
        currentWeight,
        preGestationalWeight,
        height
    });

    return result.allFeedback;
};
