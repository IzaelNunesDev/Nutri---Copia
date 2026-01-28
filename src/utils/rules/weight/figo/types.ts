export interface FigoWeightMessage {
    id: string;
    template: string;
    condition: string;
}

export interface TrimesterMessages {
    loss?: FigoWeightMessage;
    loss_acceptable?: FigoWeightMessage;
    loss_excessive?: FigoWeightMessage;
    below?: FigoWeightMessage;
    below_severe?: FigoWeightMessage;
    adequate?: FigoWeightMessage;
    above?: FigoWeightMessage;
    max_reached?: FigoWeightMessage;
    max_reached_next?: FigoWeightMessage;
    total_max_reached?: FigoWeightMessage;
}

export interface CategoryMessages {
    trim1: TrimesterMessages;
    trim2: TrimesterMessages;
    trim3: TrimesterMessages;
}

export type WeightGainStatus =
    | 'loss'
    | 'loss_acceptable'
    | 'loss_excessive'
    | 'below'
    | 'below_severe'
    | 'adequate'
    | 'above'
    | 'max_reached'      // Atingiu teto do trimestre atual -> vai para meta do próximo
    | 'max_reached_next' // Atingiu teto do trimestre seguinte -> vai para meta do final (pula etapa)
    | 'total_max_reached'; // Atingiu teto total -> taxa semanal fixa

export interface CategoryLimit {
    trim1: { min: number; max: number; lossLimit: number }; // lossLimit é negativo (ex: -1.8)
    trim2: { min: number; max: number };
    trim3: { min: number; max: number };
    totalMin: number;
    totalMax: number;
    weeklyRateGrams: number; // Média semanal em gramas (usada no cálculo final)
}

export type CategoryLimitsMap = Record<string, CategoryLimit>;
