import { DIET_CODES, CRITICAL_POINTS_MAP } from './constants';
import type { ResponseData } from './types';

// Mapeamento de nome para código
export const dietNameToCode = (dietName: string): string => {
    const mapping: Record<string, string> = {
        'Não': DIET_CODES.NAO,
        'Pescetariana (consome peixes, laticínios e ovos, mas não consome carnes e aves)': DIET_CODES.PESCETARIANA,
        'Ovolactovegetariana (consome laticínios e ovos, mas não consome carnes, peixes e aves)': DIET_CODES.OVOLACTOVEGETARIANA,
        'Lactovegetariana (consome laticínios, mas não consome carnes, peixes, aves e ovos)': DIET_CODES.LACTOVEGETARIANA,
        'Flexitariana (consome principalmente alimentos de origem vegetal, mas ainda consome produtos de origem animal)': DIET_CODES.FLEXITARIANA,
        'Vegana (não consome nenhum alimento de origem animal)': DIET_CODES.VEGANA,
        'Isenta de lactose': DIET_CODES.ISENTA_LACTOSE,
        'Isenta de glúten': DIET_CODES.ISENTA_GLUTEN,
        'Outros (alergias, intolerâncias ou preferências)': DIET_CODES.OUTROS
    };
    // Normalize string to avoid encoding issues or slight mismatches
    if (!dietName) return DIET_CODES.NAO;
    const normalizedDiet = dietName.trim();
    return mapping[normalizedDiet] || DIET_CODES.NAO;
};

/**
 * Calcula o IMC pré-gestacional
 */
export const calculateIMC = (weight: number, height: number): number | null => {
    if (!weight || !height || height === 0) return null;
    const h = height > 3 ? height / 100 : height; // Converte cm para m se necessário
    return Number((weight / (h * h)).toFixed(2));
};

/**
 * Classifica o IMC pré-gestacional conforme nomenclatura do CSV
 */
export const getIMCClassification = (imc: number): string => {
    if (imc < 18.5) return 'Baixo peso pré-gestacional';
    if (imc < 25) return 'Eutrofia pré-gestacional';
    if (imc < 30) return 'Sobrepeso pré-gestacional';
    return 'Obesidade pré-gestacional';
};

/**
 * Calcula o ganho de peso cumulativo
 */
export const calculateWeightGain = (currentWeight: number, preWeight: number): number | null => {
    if (!currentWeight || !preWeight) return null;
    return Number((currentWeight - preWeight).toFixed(2));
};

/**
 * Determina o trimestre gestacional
 */
export const getTrimester = (gestationalWeek: number): 1 | 2 | 3 | null => {
    if (!gestationalWeek || gestationalWeek < 1) return null;
    if (gestationalWeek < 14) return 1;
    if (gestationalWeek <= 27) return 2;
    return 3;
};

/**
 * Converte trimestre para texto em português
 */
export const getTrimesterText = (trimester: 1 | 2 | 3 | null): string => {
    switch (trimester) {
        case 1: return 'Primeiro trimestre';
        case 2: return 'Segundo trimestre';
        case 3: return 'Terceiro trimestre';
        default: return 'N/A';
    }
};

export const calculateRoundedGestationalWeek = (weeks: number, days: number): number => {
    if (days >= 4) {
        return weeks + 1;
    }
    return weeks;
};

/**
 * Calcula pontos críticos baseado nas respostas
 */
export const calculateCriticalPoints = (responseData: ResponseData | undefined | null): number => {
    if (!responseData) return 0;
    let points = 0;

    // Mapeamento manual para garantir tipagem segurança
    if (responseData.fruits_vegetables === CRITICAL_POINTS_MAP.fruits_vegetables) points++;
    if (responseData.dairy_products === CRITICAL_POINTS_MAP.dairy_products) points++;
    if (responseData.whole_grains === CRITICAL_POINTS_MAP.whole_grains) points++;
    if (responseData.meat_poultry_eggs === CRITICAL_POINTS_MAP.meat_poultry_eggs) points++;
    if (responseData.plant_proteins === CRITICAL_POINTS_MAP.plant_proteins) points++;

    // Agora usando string comparação para peixe
    if (responseData.fish_consumption === CRITICAL_POINTS_MAP.fish_consumption) points++;

    if (responseData.processed_foods === CRITICAL_POINTS_MAP.processed_foods) points++; // Sim -> Crítico

    // Item 7 - Atividade Física
    if (responseData.physical_activity === CRITICAL_POINTS_MAP.physical_activity) points++; // 'Não' -> Crítico

    // Item 9 - Substâncias
    if (responseData.substances_use === CRITICAL_POINTS_MAP.substances_use) points++;

    return points;
};
