
export type FeedbackType = 'normal' | 'critical' | 'alert' | 'recommendation' | 'clinical' | 'warning' | 'success' | 'investigate' | 'adequate' | 'info';
export type AudienceType = 'patient' | 'professional' | 'both';

export interface FeedbackItem {
    id: string;
    title: string;
    message: string;
    patientMessage?: string;
    type: FeedbackType;
    audience: AudienceType;
    priority: number;
    note?: string;
    requiresInput?: boolean;
    inputFields?: string[];
}

export interface CalculatedData {
    imc: number | null;
    imcClassification: string | null;
    weightGain: number | null;
    gestationalWeek: number | null;
    trimester: 1 | 2 | 3 | null;
    riskScore: number;
    criticalPoints: number;
}

export interface ResponseData {
    dietary_pattern: string | null;
    dietary_pattern_desc?: string;
    fruits_vegetables: boolean | null;
    dairy_products: boolean | null;
    whole_grains: boolean | null;
    meat_poultry_eggs: boolean | null;
    plant_proteins: boolean | null;
    fish_consumption: 'Sim' | 'Não' | null;
    processed_foods: boolean | null;
    folic_acid_supplement: 'Sim' | 'Não' | 'Não sei' | null;
    iron_supplement: 'Sim' | 'Não' | 'Não sei' | null;
    calcium_supplement: 'Sim' | 'Não' | 'Não sei' | null;
    sun_exposure: 'Sim' | 'Não' | 'Não sei' | null;
    anemia_test: 'Sim' | 'Não' | 'Não sei' | null;
    physical_activity: 'Sim' | 'Não' | 'Não sei' | null;
    coffee_tea_consumption: boolean | null;
    substances_use: boolean | null;
    [key: string]: any; // Allow indexing
}

export interface WeightGainGuidelines {
    classification: string;
    trim1_min: number;
    trim1_max: number;
    trim2_min: number;
    trim2_max: number;
    trim3_min: number;
    trim3_max: number;
    total_min: number;
    total_max: number;
    weekly_rate_min: number;
    weekly_rate_max: number;
}

export interface RulesEngineInput {
    responses: ResponseData;
    gestationalWeek: number | null;
    currentWeight: number | null;
    preGestationalWeight: number | null;
    height: number | null;
}

export interface RulesEngineOutput {
    calculatedData: CalculatedData;
    professionalAlerts: FeedbackItem[];
    patientGuidelines: FeedbackItem[];
    allFeedback: FeedbackItem[];
    weightGainRecommendation: string | null;
}
