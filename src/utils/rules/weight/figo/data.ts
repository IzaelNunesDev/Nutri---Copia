import type { CategoryLimitsMap } from './types';


export const CATEGORY_LIMITS: CategoryLimitsMap = {
    'Baixo peso pré-gestacional': {
        trim1: { min: 0.2, max: 1.2, lossLimit: 0 },
        trim2: { min: 5.6, max: 7.2 },
        trim3: { min: 9.7, max: 12.2 }, // Alterado para 9.7 (Meta Final) conforme solicitação (BP3)
        totalMax: 12.2,
        totalMin: 9.7, // Added explicit totalMin inferred from trim3.min
        weeklyRateGrams: 242 // Pag 6 do PDF
    },
    'Eutrofia pré-gestacional': {
        trim1: { min: 0.2, max: 1.2, lossLimit: -1.8 }, // Updated T1 target to 0.2-1.2 based on User Case 4
        trim2: { min: 3.1, max: 6.3 },
        trim3: { min: 8.0, max: 12.0 },
        totalMax: 12.0,
        totalMin: 8.0,
        weeklyRateGrams: 200 // Pag 6 do PDF
    },
    'Sobrepeso pré-gestacional': {
        trim1: { min: -1.6, max: 0, lossLimit: -1.6 },
        trim2: { min: 2.3, max: 3.7 },
        trim3: { min: 7.0, max: 9.0 },
        totalMax: 9.0,
        totalMin: 7.0,
        weeklyRateGrams: 175 // Pag 6 do PDF
    },
    'Obesidade pré-gestacional': {
        trim1: { min: -1.6, max: 0, lossLimit: -1.6 },
        trim2: { min: 2.7, max: 4.2 }, // Updated T2 target based on User Case 7
        trim3: { min: 5.0, max: 7.2 },
        totalMax: 7.2,
        totalMin: 5.0,
        weeklyRateGrams: 125 // Pag 6 do PDF
    }
};


export const INTERPOLATION_LANDMARKS = {
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
        13: { min: -1.6, max: 0 },
        27: { min: 2.3, max: 3.7 },
        40: { min: 7.0, max: 9.0 }
    },
    'Obesidade pré-gestacional': {
        0: { min: 0.0, max: 0.0 },
        13: { min: -1.6, max: 0 },
        27: { min: 1.1, max: 2.7 },
        40: { min: 5.0, max: 7.2 }
    }
} as const;

export const INTERPOLATION_LANDMARKS_SIMPLE = {
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
        13: { min: -1.6, max: 0 },
        27: { min: 2.3, max: 3.7 },
        40: { min: 7.0, max: 9.0 }
    },
    'Obesidade': {
        0: { min: 0.0, max: 0.0 },
        13: { min: -1.6, max: 0 },
        27: { min: 1.1, max: 2.7 },
        40: { min: 5.0, max: 7.2 }
    }
} as const;
