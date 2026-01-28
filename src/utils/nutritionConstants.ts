/**
 * ====================================================================
 * CONSTANTES CENTRALIZADAS DE NUTRIÇÃO - FIGO / Kac et al. / MS 2022
 * ====================================================================
 * 
 * Fonte:
 * Adaptado de WHO, 1995; Kac et al., 2021 apud Caderneta da Gestante
 * - Classificações de IMC
 * - Metas de ganho de peso gestacional
 * - Marcos de interpolação por trimestre
 * - Strings de classificação
 * 
 * IMPORTANTE: Todas as funções de cálculo e componentes devem IMPORTAR
 * deste arquivo. NÃO DUPLIQUE estas constantes em outros lugares.
 */

// ====================================================================
// TIPOS
// ====================================================================

export interface IMCCategory {
    key: string;           // Chave curta (ex: 'baixo_peso')
    label: string;         // Label curto (ex: 'Baixo peso')
    labelFull: string;     // Label completo FIGO (ex: 'Baixo peso pré-gestacional')
    imcMin: number;
    imcMax: number;
    totalGainMin: number;  // Meta total mínima (40 semanas)
    totalGainMax: number;  // Meta total máxima (40 semanas)
    weeklyRateMin: number; // Mínimo semanal (kg/semana)
    weeklyRateMax: number; // Máximo semanal (kg/semana)
    weeklyRateGramsMin: number; // Mínimo semanal (gramas)
    weeklyRateGramsMax: number; // Máximo semanal (gramas)
}

export interface InterpolationLandmark {
    min: number;
    max: number;
}

export interface CategoryInterpolation {
    0: InterpolationLandmark;
    13: InterpolationLandmark;
    27: InterpolationLandmark;
    40: InterpolationLandmark;
}

// ====================================================================
// CATEGORIAS DE IMC - FONTE ÚNICA DE VERDADE
// ====================================================================

export const IMC_CATEGORIES: IMCCategory[] = [
    {
        key: 'baixo_peso',
        label: 'Baixo peso',
        labelFull: 'Baixo peso pré-gestacional',
        imcMin: 0,
        imcMax: 18.5,
        totalGainMin: 9.7,
        totalGainMax: 12.2,
        weeklyRateMin: 0.242,
        weeklyRateMax: 0.242,
        weeklyRateGramsMin: 242,
        weeklyRateGramsMax: 242
    },
    {
        key: 'eutrofia',
        label: 'Eutrofia',
        labelFull: 'Eutrofia pré-gestacional',
        imcMin: 18.5,
        imcMax: 25,
        totalGainMin: 8.0,
        totalGainMax: 12.0,
        weeklyRateMin: 0.220,
        weeklyRateMax: 0.420,
        weeklyRateGramsMin: 220,
        weeklyRateGramsMax: 420
    },
    {
        key: 'sobrepeso',
        label: 'Sobrepeso',
        labelFull: 'Sobrepeso pré-gestacional',
        imcMin: 25,
        imcMax: 30,
        totalGainMin: 7.0,
        totalGainMax: 9.0,
        weeklyRateMin: 0.175,
        weeklyRateMax: 0.175,
        weeklyRateGramsMin: 175,
        weeklyRateGramsMax: 175
    },
    {
        key: 'obesidade',
        label: 'Obesidade',
        labelFull: 'Obesidade pré-gestacional',
        imcMin: 30,
        imcMax: 999,
        totalGainMin: 5.0,
        totalGainMax: 7.2,
        weeklyRateMin: 0.125,
        weeklyRateMax: 0.125,
        weeklyRateGramsMin: 125,
        weeklyRateGramsMax: 125
    }
];

// ====================================================================
// MARCOS DE INTERPOLAÇÃO (CURVAS Kac et al./MS 2022 - Tabela 2)
// ====================================================================
// Ganho de peso esperado em cada marco (semanas 0, 13, 27, 40)

export const INTERPOLATION_LANDMARKS: Record<string, CategoryInterpolation> = {
    'Baixo peso': {
        0: { min: 0.0, max: 0.0 },
        13: { min: 0.2, max: 1.2 },
        27: { min: 5.6, max: 7.2 },
        40: { min: 9.7, max: 12.2 }
    },
    'Eutrofia': {
        0: { min: 0.0, max: 0.0 },
        13: { min: -1.8, max: 0.7 },
        27: { min: 3.1, max: 6.3 },
        40: { min: 8.0, max: 12.0 }
    },
    'Sobrepeso': {
        0: { min: 0.0, max: 0.0 },
        13: { min: -1.6, max: -0.05 },
        27: { min: 2.3, max: 3.7 },
        40: { min: 7.0, max: 9.0 }
    },
    'Obesidade': {
        0: { min: 0.0, max: 0.0 },
        13: { min: -1.6, max: -0.05 },
        27: { min: 1.1, max: 2.7 },
        40: { min: 5.0, max: 7.2 }
    },
    // Versão com sufixo completo (para compatibilidade FIGO)
    'Baixo peso pré-gestacional': {
        0: { min: 0.0, max: 0.0 },
        13: { min: 0.2, max: 1.2 },
        27: { min: 5.6, max: 7.2 },
        40: { min: 9.7, max: 12.2 }
    },
    'Eutrofia pré-gestacional': {
        0: { min: 0.0, max: 0.0 },
        13: { min: -1.8, max: 0.7 },
        27: { min: 3.1, max: 6.3 },
        40: { min: 8.0, max: 12.0 }
    },
    'Sobrepeso pré-gestacional': {
        0: { min: 0.0, max: 0.0 },
        13: { min: -1.6, max: -0.05 },
        27: { min: 2.3, max: 3.7 },
        40: { min: 7.0, max: 9.0 }
    },
    'Obesidade pré-gestacional': {
        0: { min: 0.0, max: 0.0 },
        13: { min: -1.6, max: -0.05 },
        27: { min: 1.1, max: 2.7 },
        40: { min: 5.0, max: 7.2 }
    }
};

// ====================================================================
// FUNÇÕES UTILITÁRIAS (CENTRALIZADAS)
// ====================================================================

/**
 * Calcula o IMC (Índice de Massa Corporal)
 * Converte altura de cm para m se necessário
 * @returns número ou null se dados inválidos
 */
export const calculateIMC = (weight: number | string, height: number | string): number | null => {
    const w = typeof weight === 'string' ? parseFloat(weight) : weight;
    let h = typeof height === 'string' ? parseFloat(height) : height;

    if (!w || !h || h === 0 || isNaN(w) || isNaN(h)) return null;

    // Se altura for maior que 3, assumir que está em centímetros
    if (h > 3) h = h / 100;

    return parseFloat((w / (h * h)).toFixed(1));
};

/**
 * Calcula o IMC e retorna como string formatada (para compatibilidade com código legado)
 * @returns string formatada ou 'N/A' se dados inválidos
 */
export const calculateIMCString = (weight: number | string, height: number | string): string => {
    const imc = calculateIMC(weight, height);
    return imc !== null ? imc.toFixed(1) : 'N/A';
};

/**
 * Retorna a categoria de IMC baseada no valor
 */
export const getIMCCategory = (imc: number | null): IMCCategory | null => {
    if (imc === null) return null;
    return IMC_CATEGORIES.find(cat => imc >= cat.imcMin && imc < cat.imcMax) || null;
};

/**
 * Retorna a categoria baseada no peso e altura
 */
export const getIMCCategoryFromWeight = (weight: number | string, height: number | string): IMCCategory | null => {
    const imc = calculateIMC(weight, height);
    return getIMCCategory(imc);
};

/**
 * Classifica o IMC e retorna o label curto
 */
export const classifyIMC = (imc: number | null): string | null => {
    const category = getIMCCategory(imc);
    return category?.label || null;
};

/**
 * Classifica o IMC e retorna o label completo FIGO
 */
export const classifyIMCFull = (imc: number | null): string | null => {
    const category = getIMCCategory(imc);
    return category?.labelFull || null;
};

/**
 * Calcula o ganho de peso esperado para uma semana específica usando interpolação
 * Retorna { min, max } esperados para aquela semana
 */
export const getExpectedWeightGainForWeek = (
    classification: string,
    gestationalWeek: number
): { min: number; max: number } | null => {
    const landmarks = INTERPOLATION_LANDMARKS[classification];
    if (!landmarks) return null;

    // Determinar pontos de interpolação
    let startWeek: number;
    let endWeek: number;

    if (gestationalWeek <= 13) {
        startWeek = 0;
        endWeek = 13;
    } else if (gestationalWeek <= 27) {
        startWeek = 13;
        endWeek = 27;
    } else if (gestationalWeek <= 40) {
        startWeek = 27;
        endWeek = 40;
    } else {
        startWeek = 40;
        endWeek = 40;
    }

    const startLandmark = landmarks[startWeek as keyof CategoryInterpolation];
    const endLandmark = landmarks[endWeek as keyof CategoryInterpolation];

    if (startWeek === endWeek) {
        return { min: startLandmark.min, max: startLandmark.max };
    }

    const ratio = (gestationalWeek - startWeek) / (endWeek - startWeek);
    return {
        min: parseFloat((startLandmark.min + (endLandmark.min - startLandmark.min) * ratio).toFixed(1)),
        max: parseFloat((startLandmark.max + (endLandmark.max - startLandmark.max) * ratio).toFixed(1))
    };
};

/**
 * Determina o trimestre baseado na semana gestacional
 */
export const getTrimester = (gestationalWeek: number): 1 | 2 | 3 | null => {
    if (gestationalWeek < 1) return null;
    if (gestationalWeek < 14) return 1;
    if (gestationalWeek <= 27) return 2;
    return 3;
};

/**
 * Retorna texto do trimestre para exibição
 */
export const getTrimesterText = (gestationalWeek: number): string => {
    const trimester = getTrimester(gestationalWeek);
    if (!trimester) return 'N/A';
    return `${trimester}º Trimestre`;
};

/**
 * Regra de arredondamento da semana gestacional (Regra FIGO)
 * Se >= 4 dias, arredonda para cima
 */
export const roundGestationalWeek = (weeks: number, days: number): number => {
    if (days >= 4) return weeks + 1;
    return weeks;
};

/**
 * Avalia o status do ganho de peso atual em relação ao esperado
 * Considera margem de tolerância de 0.5kg
 */
export type WeightGainStatusType = 'loss' | 'loss_acceptable' | 'loss_excessive' | 'below' | 'adequate' | 'above' | 'max_reached';

export const evaluateWeightGainStatus = (
    actualGain: number,
    expectedMin: number,
    expectedMax: number,
    tolerance: number = 0.5
): WeightGainStatusType => {
    // Perda de peso
    if (actualGain < 0) {
        // Se o mínimo esperado é negativo (permitido para Sobrepeso/Obesidade no 1º tri)
        if (expectedMin < 0) {
            if (actualGain >= expectedMin - tolerance) {
                return 'loss_acceptable';
            }
            return 'loss_excessive';
        }
        return 'loss';
    }

    // Abaixo do esperado (com tolerância)
    if (actualGain < expectedMin - tolerance) {
        return 'below';
    }

    // Acima do esperado (com tolerância)
    if (actualGain > expectedMax + tolerance) {
        // Se já atingiu o máximo total
        if (actualGain > expectedMax * 1.1) { // 10% acima do máximo
            return 'max_reached';
        }
        return 'above';
    }

    // Dentro do esperado
    return 'adequate';
};
